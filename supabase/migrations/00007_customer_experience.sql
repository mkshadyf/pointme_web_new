-- Create reviews table
CREATE TABLE customer_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES auth.users(id) NOT NULL,
  service_id UUID REFERENCES services(id) NOT NULL,
  provider_id UUID REFERENCES auth.users(id) NOT NULL,
  booking_id UUID REFERENCES bookings(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  images TEXT[],
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('pending', 'published', 'hidden')),
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create favorites table
CREATE TABLE customer_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES auth.users(id) NOT NULL,
  service_id UUID REFERENCES services(id),
  provider_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, service_id),
  UNIQUE(customer_id, provider_id)
);

-- Create customer preferences table
CREATE TABLE customer_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES auth.users(id) NOT NULL,
  preferred_categories TEXT[],
  preferred_days TEXT[],
  preferred_times TEXT[],
  price_range NUMRANGE,
  location_preference JSONB,
  special_requirements TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create service recommendations table
CREATE TABLE service_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES auth.users(id) NOT NULL,
  service_id UUID REFERENCES services(id) NOT NULL,
  score DECIMAL(3,2) NOT NULL,
  reason TEXT,
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_reviews_customer ON customer_reviews(customer_id);
CREATE INDEX idx_reviews_service ON customer_reviews(service_id);
CREATE INDEX idx_reviews_provider ON customer_reviews(provider_id);
CREATE INDEX idx_reviews_rating ON customer_reviews(rating);
CREATE INDEX idx_favorites_customer ON customer_favorites(customer_id);
CREATE INDEX idx_recommendations_customer ON service_recommendations(customer_id);
CREATE INDEX idx_recommendations_score ON service_recommendations(score);

-- Enable RLS
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_recommendations ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can manage their own reviews"
  ON customer_reviews FOR ALL
  USING (auth.uid() = customer_id);

CREATE POLICY "Reviews are viewable by everyone"
  ON customer_reviews FOR SELECT
  USING (status = 'published');

CREATE POLICY "Users can manage their favorites"
  ON customer_favorites FOR ALL
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can view their preferences"
  ON customer_preferences FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can manage their preferences"
  ON customer_preferences FOR ALL
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can view their recommendations"
  ON service_recommendations FOR SELECT
  USING (auth.uid() = customer_id);

-- Create function to update service ratings
CREATE OR REPLACE FUNCTION update_service_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE services
  SET 
    average_rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM customer_reviews
      WHERE service_id = NEW.service_id
      AND status = 'published'
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM customer_reviews
      WHERE service_id = NEW.service_id
      AND status = 'published'
    )
  WHERE id = NEW.service_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating service ratings
CREATE TRIGGER update_service_rating_trigger
  AFTER INSERT OR UPDATE ON customer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_service_rating(); 
-- Create recurring bookings table
CREATE TABLE recurring_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES services(id) NOT NULL,
  client_id UUID REFERENCES auth.users(id) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  start_date DATE NOT NULL,
  end_date DATE,
  days_of_week INTEGER[],
  time_of_day TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create waiting list table
CREATE TABLE waiting_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES services(id) NOT NULL,
  client_id UUID REFERENCES auth.users(id) NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TIME NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create group bookings table
CREATE TABLE group_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES services(id) NOT NULL,
  organizer_id UUID REFERENCES auth.users(id) NOT NULL,
  participants UUID[] REFERENCES auth.users(id)[],
  max_participants INTEGER NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create resources table
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  capacity INTEGER,
  availability JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create booking reminders table
CREATE TABLE booking_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'push')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_recurring_bookings_service ON recurring_bookings(service_id);
CREATE INDEX idx_recurring_bookings_client ON recurring_bookings(client_id);
CREATE INDEX idx_waiting_list_service ON waiting_list(service_id);
CREATE INDEX idx_waiting_list_client ON waiting_list(client_id);
CREATE INDEX idx_group_bookings_service ON group_bookings(service_id);
CREATE INDEX idx_booking_reminders_booking ON booking_reminders(booking_id);
CREATE INDEX idx_booking_reminders_status ON booking_reminders(status);

-- Add RLS policies
ALTER TABLE recurring_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiting_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_reminders ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view their own recurring bookings"
  ON recurring_bookings FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Users can join waiting lists"
  ON waiting_list FOR ALL
  USING (client_id = auth.uid());

CREATE POLICY "Users can manage group bookings they organize"
  ON group_bookings FOR ALL
  USING (organizer_id = auth.uid());

CREATE POLICY "Staff can manage resources"
  ON resources FOR ALL
  USING (auth.uid() IN (
    SELECT user_id FROM staff WHERE status = 'active'
  ));

CREATE POLICY "System can manage reminders"
  ON booking_reminders FOR ALL
  USING (true); 
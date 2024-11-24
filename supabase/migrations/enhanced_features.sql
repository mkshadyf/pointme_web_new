-- Add currency configuration
CREATE TABLE supported_currencies (
  code text primary key,
  name text not null,
  symbol text not null,
  is_active boolean default true,
  exchange_rate decimal not null,
  last_updated timestamp with time zone default now()
);

-- Add real-time analytics tables
CREATE TABLE analytics_events (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id),
  event_type text not null,
  event_data jsonb not null,
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- Add materialized views for real-time analytics
CREATE MATERIALIZED VIEW hourly_analytics AS
SELECT 
  date_trunc('hour', created_at) as hour,
  business_id,
  event_type,
  count(*) as event_count,
  sum((event_data->>'amount')::decimal) as total_amount
FROM analytics_events
GROUP BY 1, 2, 3;

-- Add advanced scheduling features
ALTER TABLE report_schedules
ADD COLUMN custom_schedule jsonb,
ADD COLUMN priority integer default 1,
ADD COLUMN retry_config jsonb default '{"max_retries": 3, "backoff": "exponential"}'::jsonb,
ADD COLUMN dependencies uuid[] references report_schedules(id)[];

-- Add real-time notifications
CREATE TABLE analytics_alerts (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id),
  alert_type text not null,
  conditions jsonb not null,
  notification_channels text[] not null,
  is_active boolean default true,
  last_triggered timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Add indexes
CREATE INDEX analytics_events_business_time_idx ON analytics_events (business_id, created_at);
CREATE INDEX analytics_events_type_idx ON analytics_events (event_type);
CREATE INDEX analytics_alerts_business_idx ON analytics_alerts (business_id);
CREATE INDEX supported_currencies_active_idx ON supported_currencies (is_active);

-- Add RLS policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE supported_currencies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Businesses can view their own analytics events"
  ON analytics_events FOR SELECT
  USING (business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Businesses can manage their own alerts"
  ON analytics_alerts FOR ALL
  USING (business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Anyone can view active currencies"
  ON supported_currencies FOR SELECT
  USING (is_active = true); 
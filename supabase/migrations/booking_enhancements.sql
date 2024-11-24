-- Add recurring bookings support
CREATE TABLE recurring_bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  service_id uuid references services(id) not null,
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly')),
  interval_count integer not null default 1,
  start_date date not null,
  end_date date,
  days_of_week integer[], -- For weekly bookings
  day_of_month integer, -- For monthly bookings
  time_of_day time not null,
  status text not null default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add waiting list support
CREATE TABLE waiting_list (
  id uuid primary key default uuid_generate_v4(),
  service_id uuid references services(id) not null,
  user_id uuid references auth.users(id) not null,
  preferred_date date not null,
  preferred_time time not null,
  notes text,
  status text not null default 'pending',
  notified_at timestamptz,
  created_at timestamptz default now()
);

-- Add booking preferences
CREATE TABLE booking_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  preferred_staff uuid[] references staff(id)[],
  preferred_days integer[],
  preferred_times timerange[],
  blackout_dates daterange[],
  notification_preferences jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add booking history tracking
CREATE TABLE booking_history (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings(id) not null,
  action text not null,
  changes jsonb,
  performed_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Add indexes
CREATE INDEX idx_recurring_bookings_user ON recurring_bookings(user_id);
CREATE INDEX idx_recurring_bookings_service ON recurring_bookings(service_id);
CREATE INDEX idx_waiting_list_service ON waiting_list(service_id);
CREATE INDEX idx_waiting_list_user ON waiting_list(user_id);
CREATE INDEX idx_booking_preferences_user ON booking_preferences(user_id);
CREATE INDEX idx_booking_history_booking ON booking_history(booking_id);

-- Add RLS policies
ALTER TABLE recurring_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiting_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_history ENABLE ROW LEVEL SECURITY;

-- Recurring bookings policies
CREATE POLICY "Users can manage their recurring bookings"
  ON recurring_bookings FOR ALL
  USING (auth.uid() = user_id);

-- Waiting list policies
CREATE POLICY "Users can manage their waiting list entries"
  ON waiting_list FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Staff can view waiting list"
  ON waiting_list FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
      AND staff.business_id = (
        SELECT business_id FROM services WHERE id = service_id
      )
    )
  );

-- Booking preferences policies
CREATE POLICY "Users can manage their booking preferences"
  ON booking_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Booking history policies
CREATE POLICY "Users can view their booking history"
  ON booking_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_id
      AND (bookings.user_id = auth.uid() OR bookings.provider_id = auth.uid())
    )
  ); 
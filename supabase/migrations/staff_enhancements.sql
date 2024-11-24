-- Add staff skills and certifications
CREATE TABLE staff_skills (
  id uuid primary key default uuid_generate_v4(),
  staff_id uuid references staff(id) not null,
  skill_name text not null,
  proficiency_level integer check (proficiency_level between 1 and 5),
  certified boolean default false,
  certification_expiry date,
  created_at timestamptz default now()
);

-- Add staff availability templates
CREATE TABLE staff_availability_templates (
  id uuid primary key default uuid_generate_v4(),
  staff_id uuid references staff(id) not null,
  name text not null,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Add staff breaks
CREATE TABLE staff_breaks (
  id uuid primary key default uuid_generate_v4(),
  staff_id uuid references staff(id) not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  break_type text not null,
  created_at timestamptz default now()
);

-- Add staff performance metrics
CREATE TABLE staff_performance (
  id uuid primary key default uuid_generate_v4(),
  staff_id uuid references staff(id) not null,
  metric_date date not null,
  bookings_completed integer default 0,
  revenue_generated decimal default 0,
  customer_rating decimal,
  attendance_rate decimal,
  created_at timestamptz default now()
);

-- Add indexes
CREATE INDEX idx_staff_skills_staff ON staff_skills(staff_id);
CREATE INDEX idx_staff_availability_staff ON staff_availability_templates(staff_id);
CREATE INDEX idx_staff_breaks_staff_date ON staff_breaks(staff_id, date);
CREATE INDEX idx_staff_performance_staff_date ON staff_performance(staff_id, metric_date);

-- Add RLS policies
ALTER TABLE staff_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_availability_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_breaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_performance ENABLE ROW LEVEL SECURITY;

-- Staff skills policies
CREATE POLICY "Staff can view their own skills"
  ON staff_skills FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = staff_id
      AND staff.user_id = auth.uid()
    )
  );

-- Staff availability policies
CREATE POLICY "Staff can manage their availability"
  ON staff_availability_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = staff_id
      AND staff.user_id = auth.uid()
    )
  );

-- Staff breaks policies
CREATE POLICY "Staff can manage their breaks"
  ON staff_breaks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = staff_id
      AND staff.user_id = auth.uid()
    )
  );

-- Staff performance policies
CREATE POLICY "Staff can view their own performance"
  ON staff_performance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = staff_id
      AND staff.user_id = auth.uid()
    )
  ); 
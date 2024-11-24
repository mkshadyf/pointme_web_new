-- Add more scheduling options
alter table report_schedules 
add column schedule_config jsonb default '{
  "frequency": "daily",
  "time": "09:00",
  "days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "timezone": "UTC",
  "repeat_interval": 1,
  "format": "pdf",
  "include_charts": true,
  "notify_on_completion": true
}'::jsonb;

-- Add report templates table
create table report_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  type report_type not null,
  config jsonb not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add report schedule history
create table report_schedule_history (
  id uuid primary key default uuid_generate_v4(),
  schedule_id uuid references report_schedules(id) not null,
  status text not null check (status in ('success', 'failed', 'skipped')),
  run_at timestamp with time zone not null,
  duration interval,
  error text,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes
create index report_templates_type_idx on report_templates(type);
create index report_schedule_history_schedule_id_idx on report_schedule_history(schedule_id);
create index report_schedule_history_status_idx on report_schedule_history(status);
create index report_schedule_history_run_at_idx on report_schedule_history(run_at);

-- Add RLS policies
alter table report_templates enable row level security;
alter table report_schedule_history enable row level security;

-- Report templates policies
create policy "Anyone can view active report templates"
  on report_templates for select
  using (is_active = true);

create policy "Only admins can manage report templates"
  on report_templates for all
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.role = 'admin'
    )
  );

-- Report schedule history policies
create policy "Users can view their own report schedule history"
  on report_schedule_history for select
  using (
    schedule_id in (
      select id from report_schedules
      where business_id in (
        select id from businesses where owner_id = auth.uid()
      )
    )
  ); 
-- Create report schedules table
create type report_frequency as enum ('daily', 'weekly', 'monthly');
create type report_type as enum ('payment_analytics', 'customer_analytics', 'service_analytics');

create table report_schedules (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) not null,
  report_type report_type not null,
  frequency report_frequency not null,
  time time not null,
  recipients text[] not null,
  last_run timestamp with time zone,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create report logs table
create table report_logs (
  id uuid primary key default uuid_generate_v4(),
  schedule_id uuid references report_schedules(id) not null,
  status text not null check (status in ('success', 'failed')),
  error text,
  file_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table report_schedules enable row level security;
alter table report_logs enable row level security;

-- Report schedules policies
create policy "Businesses can view their own report schedules"
  on report_schedules for select
  using (
    business_id in (
      select id from businesses where owner_id = auth.uid()
    )
  );

create policy "Businesses can manage their own report schedules"
  on report_schedules for all
  using (
    business_id in (
      select id from businesses where owner_id = auth.uid()
    )
  );

-- Report logs policies
create policy "Businesses can view their own report logs"
  on report_logs for select
  using (
    schedule_id in (
      select id from report_schedules
      where business_id in (
        select id from businesses where owner_id = auth.uid()
      )
    )
  );

-- Add indexes
create index report_schedules_business_id_idx on report_schedules(business_id);
create index report_schedules_frequency_time_idx on report_schedules(frequency, time);
create index report_logs_schedule_id_idx on report_logs(schedule_id);
create index report_logs_created_at_idx on report_logs(created_at); 
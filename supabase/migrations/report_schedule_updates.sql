-- Add template support
alter table report_schedules
add column template_id uuid references report_templates(id),
add column custom_parameters jsonb;

-- Add more scheduling options
alter table report_schedules
add column schedule_type text check (schedule_type in ('fixed', 'recurring', 'event_based')),
add column event_trigger jsonb,
add column next_run_time timestamp with time zone,
add column last_success_time timestamp with time zone,
add column failure_count integer default 0,
add column max_retries integer default 3,
add column notification_channels text[] default array['email'];

-- Add report archive table
create table report_archives (
  id uuid primary key default uuid_generate_v4(),
  schedule_id uuid references report_schedules(id),
  file_url text not null,
  file_size integer,
  format text not null,
  generated_at timestamp with time zone not null,
  expires_at timestamp with time zone,
  download_count integer default 0,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes
create index report_schedules_template_id_idx on report_schedules(template_id);
create index report_schedules_next_run_time_idx on report_schedules(next_run_time);
create index report_archives_schedule_id_idx on report_archives(schedule_id);
create index report_archives_generated_at_idx on report_archives(generated_at);

-- Add RLS policies
alter table report_archives enable row level security;

create policy "Users can view their own report archives"
  on report_archives for select
  using (
    schedule_id in (
      select id from report_schedules
      where business_id in (
        select id from businesses where owner_id = auth.uid()
      )
    )
  ); 
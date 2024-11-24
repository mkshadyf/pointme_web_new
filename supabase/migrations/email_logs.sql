-- Create email_logs table
create table email_logs (
  id uuid primary key default uuid_generate_v4(),
  to_email text not null,
  subject text not null,
  status text not null check (status in ('sent', 'failed')),
  error text,
  sent_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table email_logs enable row level security;

-- Only allow admins to view email logs
create policy "Admins can view email logs"
  on email_logs for select
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.role in ('admin', 'super_admin')
    )
  );

-- Add indexes
create index email_logs_to_email_idx on email_logs(to_email);
create index email_logs_status_idx on email_logs(status);
create index email_logs_sent_at_idx on email_logs(sent_at); 
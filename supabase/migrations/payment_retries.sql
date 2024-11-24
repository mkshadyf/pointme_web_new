-- Create payment_retries table
create table payment_retries (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings(id) not null,
  attempt integer not null,
  retry_at timestamp with time zone not null,
  status text not null check (status in ('scheduled', 'processing', 'completed', 'failed')),
  result text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes
create index payment_retries_booking_id_idx on payment_retries(booking_id);
create index payment_retries_retry_at_idx on payment_retries(retry_at);
create index payment_retries_status_idx on payment_retries(status);

-- Add RLS policies
alter table payment_retries enable row level security;

create policy "Users can view their own payment retries"
  on payment_retries for select
  using (
    exists (
      select 1 from bookings
      where bookings.id = booking_id
      and (bookings.client_id = auth.uid() or bookings.provider_id = auth.uid())
    )
  ); 
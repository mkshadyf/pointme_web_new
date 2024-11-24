-- Create payment_intents table
create type payment_status as enum (
  'requires_payment_method',
  'requires_confirmation',
  'requires_action',
  'processing',
  'requires_capture',
  'cancelled',
  'succeeded'
);

create table payment_intents (
  id uuid primary key default uuid_generate_v4(),
  stripe_payment_intent_id text not null unique,
  booking_id uuid references bookings(id) not null,
  amount integer not null,
  currency text not null default 'usd',
  status payment_status not null,
  client_secret text not null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add payment fields to bookings table
alter table bookings add column payment_status payment_status default 'requires_payment_method';
alter table bookings add column payment_intent_id uuid references payment_intents(id);
alter table bookings add column total_amount integer;

-- Create payment_methods table
create table payment_methods (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  type text not null,
  is_default boolean default false,
  card jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create payment_history table
create table payment_history (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings(id) not null,
  amount integer not null,
  status text not null,
  payment_method_id uuid references payment_methods(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table payment_intents enable row level security;
alter table payment_methods enable row level security;
alter table payment_history enable row level security;

-- Payment intents policies
create policy "Users can view their own payment intents"
  on payment_intents for select
  using (
    booking_id in (
      select id from bookings where client_id = auth.uid()
    )
  );

-- Payment methods policies
create policy "Users can view their own payment methods"
  on payment_methods for select
  using (auth.uid() = user_id);

create policy "Users can insert their own payment methods"
  on payment_methods for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own payment methods"
  on payment_methods for update
  using (auth.uid() = user_id);

create policy "Users can delete their own payment methods"
  on payment_methods for delete
  using (auth.uid() = user_id);

-- Payment history policies
create policy "Users can view their payment history"
  on payment_history for select
  using (
    exists (
      select 1 from bookings
      where bookings.id = booking_id
      and (bookings.client_id = auth.uid() or bookings.provider_id = auth.uid())
    )
  );

-- Add indexes
create index payment_intents_booking_id_idx on payment_intents(booking_id);
create index payment_methods_user_id_idx on payment_methods(user_id);
create index payment_methods_is_default_idx on payment_methods(is_default);
create index payment_history_booking_id_idx on payment_history(booking_id);
create index payment_history_payment_method_id_idx on payment_history(payment_method_id);
create index payment_history_created_at_idx on payment_history(created_at); 
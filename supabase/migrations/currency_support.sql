-- Add currency support
alter table businesses 
add column default_currency text not null default 'USD',
add column accepted_currencies text[] default array['USD', 'ZAR'];

-- Add currency conversion rates table
create table currency_rates (
  id uuid primary key default uuid_generate_v4(),
  from_currency text not null,
  to_currency text not null,
  rate decimal not null,
  last_updated timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(from_currency, to_currency)
);

-- Add tax rates table
create table tax_rates (
  id uuid primary key default uuid_generate_v4(),
  country text not null,
  state text,
  rate decimal not null,
  tax_type text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add fraud detection rules table
create table fraud_rules (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  conditions jsonb not null,
  action text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add chargeback tracking table
create table chargebacks (
  id uuid primary key default uuid_generate_v4(),
  payment_intent_id text not null,
  booking_id uuid references bookings(id) not null,
  amount decimal not null,
  currency text not null,
  reason text not null,
  status text not null,
  evidence jsonb,
  due_date timestamp with time zone,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes
create index currency_rates_currencies_idx on currency_rates(from_currency, to_currency);
create index tax_rates_location_idx on tax_rates(country, state);
create index chargebacks_booking_id_idx on chargebacks(booking_id);
create index chargebacks_status_idx on chargebacks(status);

-- Add RLS policies
alter table currency_rates enable row level security;
alter table tax_rates enable row level security;
alter table fraud_rules enable row level security;
alter table chargebacks enable row level security;

-- Currency rates policies
create policy "Anyone can view currency rates"
  on currency_rates for select
  using (true);

-- Tax rates policies
create policy "Anyone can view tax rates"
  on tax_rates for select
  using (is_active = true);

-- Fraud rules policies
create policy "Only admins can manage fraud rules"
  on fraud_rules for all
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.role = 'admin'
    )
  );

-- Chargebacks policies
create policy "Businesses can view their own chargebacks"
  on chargebacks for select
  using (
    exists (
      select 1 from bookings
      where bookings.id = booking_id
      and bookings.business_id in (
        select id from businesses where owner_id = auth.uid()
      )
    )
  ); 
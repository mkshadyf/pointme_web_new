-- Create loyalty points table
create table loyalty_points (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  business_id uuid references businesses(id) not null,
  points integer not null default 0,
  lifetime_points integer not null default 0,
  last_earned timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, business_id)
);

-- Create loyalty tiers table
create table loyalty_tiers (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) not null,
  name text not null,
  required_points integer not null,
  multiplier decimal not null default 1,
  benefits jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create loyalty transactions table
create table loyalty_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  business_id uuid references businesses(id) not null,
  booking_id uuid references bookings(id),
  points integer not null,
  type text not null check (type in ('earn', 'redeem', 'expire', 'bonus')),
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create referral codes table
create table referral_codes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  code text not null unique,
  uses integer not null default 0,
  max_uses integer,
  points_per_use integer not null default 100,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes
create index loyalty_points_user_business_idx on loyalty_points(user_id, business_id);
create index loyalty_points_points_idx on loyalty_points(points);
create index loyalty_tiers_business_points_idx on loyalty_tiers(business_id, required_points);
create index loyalty_transactions_user_idx on loyalty_transactions(user_id);
create index loyalty_transactions_business_idx on loyalty_transactions(business_id);
create index loyalty_transactions_created_at_idx on loyalty_transactions(created_at);
create index referral_codes_code_idx on referral_codes(code);

-- Add RLS policies
alter table loyalty_points enable row level security;
alter table loyalty_tiers enable row level security;
alter table loyalty_transactions enable row level security;
alter table referral_codes enable row level security;

-- Loyalty points policies
create policy "Users can view their own loyalty points"
  on loyalty_points for select
  using (auth.uid() = user_id);

create policy "Businesses can view their customers' loyalty points"
  on loyalty_points for select
  using (business_id in (
    select id from businesses where owner_id = auth.uid()
  ));

-- Loyalty tiers policies
create policy "Anyone can view loyalty tiers"
  on loyalty_tiers for select
  using (true);

create policy "Businesses can manage their loyalty tiers"
  on loyalty_tiers for all
  using (business_id in (
    select id from businesses where owner_id = auth.uid()
  ));

-- Loyalty transactions policies
create policy "Users can view their own loyalty transactions"
  on loyalty_transactions for select
  using (auth.uid() = user_id);

create policy "Businesses can view their loyalty transactions"
  on loyalty_transactions for select
  using (business_id in (
    select id from businesses where owner_id = auth.uid()
  ));

-- Referral codes policies
create policy "Users can view and manage their own referral codes"
  on referral_codes for all
  using (auth.uid() = user_id);

create policy "Anyone can view active referral codes"
  on referral_codes for select
  using (
    (expires_at is null or expires_at > now())
    and (max_uses is null or uses < max_uses)
  ); 
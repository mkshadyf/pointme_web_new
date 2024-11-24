-- Create subscription plans table
create table subscription_plans (
  id uuid primary key default uuid_generate_v4(),
  stripe_price_id text unique not null,
  name text not null,
  description text,
  price integer not null,
  interval text not null check (interval in ('day', 'week', 'month', 'year')),
  trial_days integer,
  features jsonb,
  metadata jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create subscriptions table
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references auth.users(id) not null,
  plan_id uuid references subscription_plans(id) not null,
  stripe_subscription_id text unique not null,
  status text not null check (
    status in (
      'active',
      'canceled',
      'incomplete',
      'incomplete_expired',
      'past_due',
      'trialing',
      'unpaid'
    )
  ),
  current_period_start timestamp with time zone not null,
  current_period_end timestamp with time zone not null,
  cancel_at_period_end boolean default false,
  canceled_at timestamp with time zone,
  trial_end timestamp with time zone,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table subscription_plans enable row level security;
alter table subscriptions enable row level security;

-- Subscription plans policies
create policy "Anyone can view active subscription plans"
  on subscription_plans for select
  using (is_active = true);

create policy "Only admins can manage subscription plans"
  on subscription_plans for all
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.role = 'admin'
    )
  );

-- Subscriptions policies
create policy "Users can view their own subscriptions"
  on subscriptions for select
  using (auth.uid() = customer_id);

create policy "Only admins can manage subscriptions"
  on subscriptions for all
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.role = 'admin'
    )
  );

-- Add indexes
create index subscription_plans_price_idx on subscription_plans(price);
create index subscription_plans_interval_idx on subscription_plans(interval);
create index subscriptions_customer_id_idx on subscriptions(customer_id);
create index subscriptions_plan_id_idx on subscriptions(plan_id);
create index subscriptions_status_idx on subscriptions(status);
create index subscriptions_current_period_end_idx on subscriptions(current_period_end); 
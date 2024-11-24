-- Create payment_analytics table
create table payment_analytics (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) not null,
  service_id uuid references services(id) not null,
  payment_intent_id text not null,
  amount integer not null,
  currency text not null default 'usd',
  status payment_status not null,
  payment_method_type text not null,
  customer_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create payment_metrics table for aggregated data
create table payment_metrics (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) not null,
  date date not null,
  total_payments integer not null default 0,
  total_amount integer not null default 0,
  successful_payments integer not null default 0,
  failed_payments integer not null default 0,
  refunded_payments integer not null default 0,
  average_amount integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(business_id, date)
);

-- Add RLS policies
alter table payment_analytics enable row level security;
alter table payment_metrics enable row level security;

-- Payment analytics policies
create policy "Businesses can view their own payment analytics"
  on payment_analytics for select
  using (
    business_id in (
      select id from businesses where owner_id = auth.uid()
    )
  );

create policy "Admins can view all payment analytics"
  on payment_analytics for select
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.role in ('admin', 'super_admin')
    )
  );

-- Payment metrics policies
create policy "Businesses can view their own payment metrics"
  on payment_metrics for select
  using (
    business_id in (
      select id from businesses where owner_id = auth.uid()
    )
  );

create policy "Admins can view all payment metrics"
  on payment_metrics for select
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.role in ('admin', 'super_admin')
    )
  );

-- Add indexes
create index payment_analytics_business_id_idx on payment_analytics(business_id);
create index payment_analytics_service_id_idx on payment_analytics(service_id);
create index payment_analytics_customer_id_idx on payment_analytics(customer_id);
create index payment_analytics_created_at_idx on payment_analytics(created_at);
create index payment_metrics_business_id_date_idx on payment_metrics(business_id, date); 
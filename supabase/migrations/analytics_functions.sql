-- Create function to calculate service analytics
create or replace function get_service_analytics(
  p_business_id uuid,
  p_start_date timestamp with time zone default null,
  p_end_date timestamp with time zone default null
)
returns table (
  service_id uuid,
  service_name text,
  total_bookings bigint,
  total_revenue bigint,
  average_rating numeric
)
language plpgsql
security definer
as $$
begin
  return query
  select
    s.id as service_id,
    s.name as service_name,
    count(b.id) as total_bookings,
    sum(b.total_amount) as total_revenue,
    avg(s.rating) as average_rating
  from services s
  left join bookings b on b.service_id = s.id
  where s.business_id = p_business_id
  and (
    p_start_date is null
    or b.created_at >= p_start_date
  )
  and (
    p_end_date is null
    or b.created_at <= p_end_date
  )
  group by s.id, s.name
  order by total_revenue desc;
end;
$$;

-- Create function to update payment metrics
create or replace function update_payment_metrics()
returns trigger
language plpgsql
security definer
as $$
declare
  v_date date;
  v_business_id uuid;
begin
  v_date := date(new.created_at);
  v_business_id := new.business_id;

  insert into payment_metrics (
    business_id,
    date,
    total_payments,
    total_amount,
    successful_payments,
    failed_payments,
    refunded_payments,
    average_amount,
    created_at,
    updated_at
  )
  select
    v_business_id,
    v_date,
    count(*),
    sum(amount),
    count(*) filter (where status = 'succeeded'),
    count(*) filter (where status = 'failed'),
    count(*) filter (where status = 'refunded'),
    (sum(amount)::numeric / count(*)::numeric)::integer,
    now(),
    now()
  from payment_analytics
  where business_id = v_business_id
  and date(created_at) = v_date
  on conflict (business_id, date)
  do update set
    total_payments = excluded.total_payments,
    total_amount = excluded.total_amount,
    successful_payments = excluded.successful_payments,
    failed_payments = excluded.failed_payments,
    refunded_payments = excluded.refunded_payments,
    average_amount = excluded.average_amount,
    updated_at = now();

  return new;
end;
$$;

-- Create trigger to update metrics on payment analytics changes
create trigger update_payment_metrics_trigger
after insert or update on payment_analytics
for each row
execute function update_payment_metrics(); 
create type staff_role as enum ('staff', 'manager', 'admin');
create type staff_status as enum ('active', 'inactive');

create table staff (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) not null,
  full_name text not null,
  email text not null,
  phone text not null,
  role staff_role not null default 'staff',
  status staff_status not null default 'active',
  avatar_url text,
  specialties text[],
  schedule jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes
create index staff_business_id_idx on staff(business_id);
create index staff_email_idx on staff(email);
create index staff_status_idx on staff(status);

-- Add RLS policies
alter table staff enable row level security;

create policy "Staff members can be viewed by authenticated users."
  on staff for select
  using (auth.role() in ('authenticated'));

create policy "Staff members can be created by business owners."
  on staff for insert
  with check (
    auth.uid() in (
      select owner_id from businesses where id = business_id
    )
  );

create policy "Staff members can be updated by business owners."
  on staff for update
  using (
    auth.uid() in (
      select owner_id from businesses where id = business_id
    )
  );

create policy "Staff members can be deleted by business owners."
  on staff for delete
  using (
    auth.uid() in (
      select owner_id from businesses where id = business_id
    )
  ); 
-- Create push subscriptions table
create table push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  subscription jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create offline mutations table
create table offline_mutations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  table_name text not null,
  operation text not null check (operation in ('INSERT', 'UPDATE', 'DELETE')),
  record_id text not null,
  data jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  error text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  processed_at timestamp with time zone
);

-- Add indexes
create index push_subscriptions_user_idx on push_subscriptions(user_id);
create index offline_mutations_user_idx on offline_mutations(user_id);
create index offline_mutations_status_idx on offline_mutations(status);

-- Add RLS policies
alter table push_subscriptions enable row level security;
alter table offline_mutations enable row level security;

-- Push subscriptions policies
create policy "Users can manage their own push subscriptions"
  on push_subscriptions for all
  using (auth.uid() = user_id);

-- Offline mutations policies
create policy "Users can manage their own offline mutations"
  on offline_mutations for all
  using (auth.uid() = user_id); 
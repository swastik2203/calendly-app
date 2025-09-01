-- Create users table if it doesn't exist
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text not null,
  avatar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS on users table
alter table public.users enable row level security;

-- Drop existing policies if they exist
drop policy if exists "users can read all users" on public.users;
drop policy if exists "users can update own profile" on public.users;
drop policy if exists "users can insert own profile" on public.users;
drop policy if exists "users can upsert own profile" on public.users;

-- Policy: users can read all users (for assignment dropdowns)
create policy "users can read all users" on public.users
  for select
  using (true);

-- Policy: users can manage their own profile
create policy "users can manage own profile" on public.users
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);
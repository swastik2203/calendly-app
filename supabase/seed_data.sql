-- Seed data for testing task assignment functionality
-- This script adds test users to the database

-- First, let's create a users table to store user information
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

-- Policy: users can read all users (for assignment dropdowns)
create policy "users can read all users" on public.users
  for select
  using (true);

-- Policy: users can update their own profile
create policy "users can update own profile" on public.users
  for update
  using (auth.uid() = id);

-- Policy: users can insert their own profile
create policy "users can insert own profile" on public.users
  for insert
  with check (auth.uid() = id);

-- Policy: allow upsert for user profiles (needed for automatic profile creation)
create policy "users can upsert own profile" on public.users
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Insert some test users
insert into public.users (email, name) values
  ('john.doe@example.com', 'John Doe'),
  ('jane.smith@example.com', 'Jane Smith'),
  ('mike.johnson@example.com', 'Mike Johnson'),
  ('sarah.wilson@example.com', 'Sarah Wilson'),
  ('david.brown@example.com', 'David Brown')
on conflict (email) do nothing;

-- IMPORTANT: You need to manually create auth accounts for these test users
-- Go to Supabase Dashboard → Authentication → Users → Add User
-- Create accounts with these emails and set passwords:
-- 
-- Email: john.doe@example.com, Password: test123
-- Email: jane.smith@example.com, Password: test123  
-- Email: mike.johnson@example.com, Password: test123
-- Email: sarah.wilson@example.com, Password: test123
-- Email: david.brown@example.com, Password: test123
--
-- OR use the Supabase CLI to create them programmatically
\
-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Drop existing objects if they exist
drop trigger if exists tasks_set_updated_at on public.tasks;
drop function if exists public.set_updated_at();
drop table if exists public.tasks;

-- Tasks table (owner created tasks with optional assignees)
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  company text,
  date timestamptz not null,
  time text,
  type text not null check (type in ('Task','Meeting','Week-off')),
  color text not null check (color in ('red','green','blue','yellow','pink','orange')),
  status text not null default 'No Action' check (status in ('No Action','Accepted','In Progress','Done')),
  completion_status text not null default 'Pending' check (completion_status in ('Pending','Completed')),
  owner_id uuid not null references auth.users(id) on delete cascade,
  assignee_emails text[] default '{}',
  assignee_names text[] default '{}',
  is_recurring boolean default false,
  recurrence_type text check (recurrence_type in ('none','daily','weekdays','weekly','monthly','yearly')),
  recurrence_interval int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Updated at trigger function
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger
create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

-- Enable RLS
alter table public.tasks enable row level security;

-- Drop existing policies if they exist
drop policy if exists "owners can manage own tasks" on public.tasks;
drop policy if exists "assignees can read" on public.tasks;
drop policy if exists "assignees can update" on public.tasks;
drop policy if exists "users can see own and assigned tasks" on public.tasks;

-- Policies: owners can do everything on their rows
create policy "owners can manage own tasks" on public.tasks
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Assignees can read tasks assigned to them
create policy "assignees can read" on public.tasks
  for select
  using (
    auth.jwt() ->> 'email' = ANY(assignee_emails)
  );

-- Assignees can update tasks assigned to them (for status changes)
create policy "assignees can update" on public.tasks
  for update
  using (
    auth.jwt() ->> 'email' = ANY(assignee_emails)
  );

-- Allow users to see all tasks they own OR are assigned to
create policy "users can see own and assigned tasks" on public.tasks
  for select
  using (
    auth.uid() = owner_id OR 
    auth.jwt() ->> 'email' = ANY(assignee_emails)
  );

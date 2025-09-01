-- Check if auth setup is correct for task assignment
-- Run this in Supabase SQL Editor

-- 1. Check if auth users exist
SELECT 
  'Auth Users' as check_type,
  COUNT(*) as total_users
FROM auth.users;

-- 2. Show existing auth users
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- 3. Check if our test users table has data
SELECT 
  'Test Users Table' as check_type,
  COUNT(*) as total_users
FROM public.users;

-- 4. Show test users
SELECT 
  id,
  name,
  email
FROM public.users
ORDER BY name;

-- 5. Check if tasks table exists and has data
SELECT 
  'Tasks Table' as check_type,
  COUNT(*) as total_tasks
FROM public.tasks;

-- 6. Show recent tasks with assignments
SELECT 
  id,
  title,
  owner_id,
  assignee_emails,
  assignee_names,
  created_at
FROM public.tasks
ORDER BY created_at DESC
LIMIT 5;

-- 7. Check RLS policies on tasks table
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'tasks';

-- 8. Check if RLS is enabled on tasks table
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'tasks';

-- Debug script to check task assignment status
-- Run this in Supabase SQL Editor to see what's happening

-- Check if tasks table exists and has data
SELECT 
  'Tasks Table Status' as check_type,
  COUNT(*) as total_tasks,
  COUNT(CASE WHEN assignee_emails IS NOT NULL AND array_length(assignee_emails, 1) > 0 THEN 1 END) as tasks_with_assignees
FROM public.tasks;

-- Check specific task details
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

-- Check if users table has data
SELECT 
  'Users Table Status' as check_type,
  COUNT(*) as total_users
FROM public.users;

-- Check specific users
SELECT 
  id,
  name,
  email
FROM public.users
ORDER BY name;

-- Check auth.users (Supabase Auth)
SELECT 
  'Auth Users Status' as check_type,
  COUNT(*) as total_auth_users
FROM auth.users;

-- Check specific auth users
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'tasks';

-- Test RLS policy manually (replace 'your-test-email@example.com' with actual email)
-- This will show what the RLS policy sees
SELECT 
  'RLS Test' as test_type,
  auth.jwt() ->> 'email' as current_user_email,
  auth.uid() as current_user_id;

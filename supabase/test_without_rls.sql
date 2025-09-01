-- Test task assignment without RLS restrictions
-- This will help us see if the data exists but RLS is blocking it

-- Temporarily disable RLS to see all data
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;

-- Check all tasks and their assignments
SELECT 
  'All Tasks (RLS Disabled)' as test_type,
  COUNT(*) as total_tasks
FROM public.tasks;

-- Show all tasks with their assignments
SELECT 
  id,
  title,
  owner_id,
  assignee_emails,
  assignee_names,
  created_at
FROM public.tasks
ORDER BY created_at DESC;

-- Check if there are any tasks with assignees
SELECT 
  'Tasks with Assignees' as test_type,
  COUNT(*) as tasks_with_assignees
FROM public.tasks
WHERE assignee_emails IS NOT NULL 
  AND array_length(assignee_emails, 1) > 0;

-- Show tasks that have assignees
SELECT 
  id,
  title,
  assignee_emails,
  assignee_names
FROM public.tasks
WHERE assignee_emails IS NOT NULL 
  AND array_length(assignee_emails, 1) > 0;

-- Re-enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Now test with a specific user context
-- Replace 'your-email@example.com' with an actual email from your auth.users table
SELECT 
  'Testing with specific email' as test_type,
  'your-email@example.com' as test_email,
  COUNT(*) as accessible_tasks
FROM public.tasks
WHERE owner_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com')
   OR 'your-email@example.com' = ANY(assignee_emails);

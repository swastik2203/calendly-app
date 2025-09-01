-- Test RLS policies for task assignment
-- This script helps verify that the security policies are working

-- First, let's create a test task with assignment
INSERT INTO public.tasks (
  title,
  description,
  company,
  date,
  time,
  type,
  color,
  status,
  completion_status,
  owner_id,
  assignee_emails,
  assignee_names,
  is_recurring,
  recurrence_type,
  recurrence_interval
) VALUES (
  'Test RLS Task',
  'This is a test task to verify RLS policies',
  'Test Company',
  NOW(),
  '14:00',
  'Task',
  'blue',
  'No Action',
  'Pending',
  (SELECT id FROM auth.users LIMIT 1), -- Use first auth user as owner
  ARRAY['john.doe@example.com'], -- Assign to test user
  ARRAY['John Doe'],
  false,
  NULL,
  NULL
) ON CONFLICT DO NOTHING;

-- Now let's test the RLS policies
-- This should show tasks for the current authenticated user

-- Test 1: Check if we can see tasks owned by current user
SELECT 
  'Owned Tasks' as test_type,
  COUNT(*) as task_count
FROM public.tasks 
WHERE owner_id = auth.uid();

-- Test 2: Check if we can see tasks assigned to current user
SELECT 
  'Assigned Tasks' as test_type,
  COUNT(*) as task_count
FROM public.tasks 
WHERE auth.jwt() ->> 'email' = ANY(assignee_emails);

-- Test 3: Check if we can see all tasks we should have access to
SELECT 
  'Total Accessible Tasks' as test_type,
  COUNT(*) as task_count
FROM public.tasks 
WHERE owner_id = auth.uid() 
   OR auth.jwt() ->> 'email' = ANY(assignee_emails);

-- Test 4: Show current user context
SELECT 
  'Current User Context' as test_type,
  auth.uid() as user_id,
  auth.jwt() ->> 'email' as user_email,
  auth.jwt() ->> 'role' as user_role;

-- Test 5: Check if the test task exists and has correct assignment
SELECT 
  'Test Task Details' as test_type,
  id,
  title,
  owner_id,
  assignee_emails,
  assignee_names,
  created_at
FROM public.tasks 
WHERE title = 'Test RLS Task';

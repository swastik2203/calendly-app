# Supabase Schema Setup

## Task Assignment Visibility Fix

The current schema has been updated to fix the issue where assigned users couldn't see tasks assigned to them.

### What Was Fixed:

1. **RLS Policies**: Updated to properly allow assignees to see tasks
2. **Database Schema**: Added support for new color options and recurrence types
3. **Task Fetching**: Modified to fetch tasks user owns OR is assigned to

### Steps to Apply:

1. **Go to Supabase Dashboard** → Your Project → SQL Editor
2. **Run the updated schema.sql** (copy from `supabase/schema.sql`)
3. **Test the fix** by:
   - Creating a task and assigning it to a different email
   - Logging in with that email
   - Verifying the task appears in "Delegated Task" filter

### Key Changes Made:

#### 1. Updated RLS Policies:
```sql
-- Assignees can read tasks assigned to them
create policy "assignees can read" on public.tasks
  for select
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
```

#### 2. Updated Schema Constraints:
```sql
-- Added new color options
color text not null check (color in ('red','green','blue','yellow','pink','orange'))

-- Added 'none' recurrence option
recurrence_type text check (recurrence_type in ('none','daily','weekdays','weekly','monthly','yearly'))
```

#### 3. Frontend Changes:
- **TaskContext**: Now fetches tasks user owns OR is assigned to
- **Filter Logic**: Fixed delegated task filtering to use email comparison
- **Real-time Updates**: Tasks automatically refresh when auth state changes

### Testing the Fix:

1. **Create Task with Assignment**:
   - Log in as User A
   - Create a task and assign it to User B's email
   - Save the task

2. **Verify Assignment**:
   - Check that the task appears in User A's "My Tasks"
   - The task should show assignees

3. **Test Assignee Visibility**:
   - Log out and log in as User B
   - The task should appear in User B's "Delegated Task" filter
   - User B should be able to see and update the task status

### Expected Behavior:

- ✅ **Task Owners**: Can see all their created tasks
- ✅ **Task Assignees**: Can see tasks assigned to them
- ✅ **Filtering**: "Delegated Task" shows tasks assigned to current user
- ✅ **Status Updates**: Assignees can update task status
- ✅ **Real-time Sync**: Changes appear immediately for all users

### If Issues Persist:

1. **Check RLS Policies**: Ensure policies are properly applied
2. **Verify Email Matching**: Check that assignee emails match exactly
3. **Database Permissions**: Ensure Supabase client has proper access
4. **Console Logs**: Check browser console for any errors

This fix ensures that task delegation works as specified in your requirements!

import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Task, User, TaskFilter, TaskStatus, CompletionStatus } from '../types'

interface TaskState {
  tasks: Task[]
  users: User[]
  currentUser: User | null
  selectedDate: Date
  currentFilter: TaskFilter
  viewMode: 'day' | 'list'
  loading: boolean
}

type TaskAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'SET_SELECTED_DATE'; payload: Date }
  | { type: 'SET_FILTER'; payload: TaskFilter }
  | { type: 'SET_VIEW_MODE'; payload: 'day' | 'list' }

const initialState: TaskState = {
  tasks: [],
  users: [],
  currentUser: null,
  selectedDate: new Date(),
  currentFilter: { type: 'My Tasks' },
  viewMode: 'list',
  loading: true,
}

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_TASKS':
      return { ...state, tasks: action.payload }
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] }
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => (t.id === action.payload.id ? action.payload : t)),
      }
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) }
    case 'SET_USERS':
      return { ...state, users: action.payload }
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload }
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload }
    case 'SET_FILTER':
      return { ...state, currentFilter: action.payload }
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload }
    default:
      return state
  }
}

interface TaskContextType {
  state: TaskState
  dispatch: React.Dispatch<TaskAction>
  refreshTasks: () => Promise<void>
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'owner'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>
  updateCompletionStatus: (id: string, status: CompletionStatus) => Promise<void>
  getFilteredTasks: () => Task[]
  getTasksForDate: (date: Date) => Task[]
  getTasksByType: (type: TaskFilter['type']) => Task[]
  ensureUserProfile: (supaUser: any) => Promise<void>
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

function mapRowToTask(row: any, owner: User): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    company: row.company ?? undefined,
    date: new Date(row.date),
    time: row.time ?? undefined,
    type: row.type,
    color: row.color,
    status: row.status as TaskStatus,
    completionStatus: (row.completion_status as CompletionStatus) ?? 'Pending',
    owner,
    assignees: (row.assignee_emails || []).map((email: string, idx: number) => ({
      id: email,
      name: (row.assignee_names || [])[idx] ?? email,
      email,
    })),
    notes: undefined,
    isRecurring: row.is_recurring ?? false,
    recurrencePattern: row.recurrence_type
      ? { type: row.recurrence_type, interval: row.recurrence_interval ?? 1 }
      : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  useEffect(() => {
    const init = async () => {
      dispatch({ type: 'SET_LOADING', payload: true })
      const { data: userResp } = await supabase.auth.getUser()
      const supaUser = userResp.user
      if (!supaUser) {
        dispatch({ type: 'SET_CURRENT_USER', payload: null })
        dispatch({ type: 'SET_LOADING', payload: false })
        return
      }

      // Ensure user profile exists in users table
      await ensureUserProfile(supaUser)

      const currentUser: User = {
        id: supaUser.id,
        name: supaUser.user_metadata?.full_name || supaUser.email || 'User',
        email: supaUser.email || '',
      }
      dispatch({ type: 'SET_CURRENT_USER', payload: currentUser })

      // Fetch users for assignment dropdown
      await refreshUsers()
      
      await refreshTasksInternal(currentUser)
      dispatch({ type: 'SET_LOADING', payload: false })
    }

    init()

    const { data: sub } = supabase.auth.onAuthStateChange((_e, _s) => {
      // When auth state updates, refetch
      init()
    })
    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  const ensureUserProfile = async (supaUser: any) => {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', supaUser.id)
      .single()
    
    if (!existingUser) {
      // Create user profile
      await supabase
        .from('users')
        .insert({
          id: supaUser.id,
          email: supaUser.email,
          name: supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'User',
        })
    }
  }

  const refreshUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('Error fetching users:', error)
      return
    }
    
    const users = data.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      avatar: row.avatar,
    }))
    
    dispatch({ type: 'SET_USERS', payload: users })
  }

  const refreshTasksInternal = async (ownerUser?: User) => {
    const owner = ownerUser || state.currentUser
    if (!owner) return
    
    try {
      // First, try to fetch tasks using the improved RLS policy
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .or(`owner_id.eq.${owner.id},assignee_emails.cs.{${owner.email}}`)
        .order('date', { ascending: true })
      
      if (error) {
        console.error('Error fetching tasks with RLS:', error)
        
        // Fallback: fetch all tasks and filter on frontend
        const { data: allTasks, error: fallbackError } = await supabase
          .from('tasks')
          .select('*')
          .order('date', { ascending: true })
        
        if (fallbackError) {
          console.error('Fallback fetch also failed:', fallbackError)
          return
        }
        
        // Filter tasks on frontend
        const filteredTasks = (allTasks || []).filter(task => 
          task.owner_id === owner.id || 
          (task.assignee_emails && task.assignee_emails.includes(owner.email))
        )
        
        const tasks = await Promise.all(filteredTasks.map(async (row) => {
          let taskOwner = owner
          
          // If this task is not owned by current user, try to get owner info
          if (row.owner_id !== owner.id) {
            // Try to get owner from our users table first
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('id', row.owner_id)
              .single()
            
            if (userData) {
              taskOwner = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                avatar: userData.avatar,
              }
            } else {
              // Fallback to using current user as owner
              taskOwner = owner
            }
          }
          
          return mapRowToTask(row, taskOwner)
        }))
        
        dispatch({ type: 'SET_TASKS', payload: tasks })
        return
      }
      
      // Map tasks and determine the actual owner for each task
      const tasks = await Promise.all((data || []).map(async (row) => {
        let taskOwner = owner
        
        // If this task is not owned by current user, try to get owner info
        if (row.owner_id !== owner.id) {
          // Try to get owner from our users table first
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', row.owner_id)
            .single()
          
          if (userData) {
            taskOwner = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              avatar: userData.avatar,
            }
          } else {
            // Fallback to using current user as owner
            taskOwner = owner
          }
        }
        
        return mapRowToTask(row, taskOwner)
      }))
      
      dispatch({ type: 'SET_TASKS', payload: tasks })
      
    } catch (error) {
      console.error('Unexpected error in refreshTasksInternal:', error)
    }
  }

  const refreshTasks = async () => {
    await refreshTasksInternal()
  }

  const addTask: TaskContextType['addTask'] = async taskData => {
    if (!state.currentUser) return
    const assigneeEmails = taskData.assignees.map(a => a.email)
    const assigneeNames = taskData.assignees.map(a => a.name)

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          title: taskData.title,
          description: taskData.description ?? null,
          company: taskData.company ?? null,
          date: taskData.date.toISOString(),
          time: taskData.time ?? null,
          type: taskData.type,
          color: taskData.color,
          status: taskData.status ?? 'No Action',
          completion_status: taskData.completionStatus ?? 'Pending',
          owner_id: state.currentUser.id,
          assignee_emails: assigneeEmails,
          assignee_names: assigneeNames,
          is_recurring: taskData.isRecurring ?? false,
          recurrence_type: taskData.recurrencePattern?.type ?? null,
          recurrence_interval: taskData.recurrencePattern?.interval ?? null,
        },
      ])
      .select('*')
      .single()

    if (error || !data) return
    const mapped = mapRowToTask(data, state.currentUser)
    dispatch({ type: 'ADD_TASK', payload: mapped })
  }

  const updateTask: TaskContextType['updateTask'] = async (id, updates) => {
    if (!state.currentUser) return

    const payload: any = {}
    if (updates.title !== undefined) payload.title = updates.title
    if (updates.description !== undefined) payload.description = updates.description
    if (updates.company !== undefined) payload.company = updates.company
    if (updates.date !== undefined) payload.date = updates.date.toISOString()
    if (updates.time !== undefined) payload.time = updates.time
    if (updates.type !== undefined) payload.type = updates.type
    if (updates.color !== undefined) payload.color = updates.color
    if (updates.status !== undefined) payload.status = updates.status
    if (updates.completionStatus !== undefined) payload.completion_status = updates.completionStatus
    if (updates.assignees !== undefined) {
      payload.assignee_emails = updates.assignees.map(a => a.email)
      payload.assignee_names = updates.assignees.map(a => a.name)
    }
    if (updates.isRecurring !== undefined) payload.is_recurring = updates.isRecurring
    if (updates.recurrencePattern !== undefined) {
      payload.recurrence_type = updates.recurrencePattern?.type ?? null
      payload.recurrence_interval = updates.recurrencePattern?.interval ?? null
    }

    const { data, error } = await supabase.from('tasks').update(payload).eq('id', id).select('*').single()
    if (error || !data) return
    const mapped = mapRowToTask(data, state.currentUser)
    dispatch({ type: 'UPDATE_TASK', payload: mapped })
  }

  const deleteTask: TaskContextType['deleteTask'] = async id => {
    await supabase.from('tasks').delete().eq('id', id)
    dispatch({ type: 'DELETE_TASK', payload: id })
  }

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    await updateTask(id, { status })
  }

  const updateCompletionStatus = async (id: string, status: CompletionStatus) => {
    await updateTask(id, { completionStatus: status })
  }

  const getFilteredTasks = (): Task[] => {
    let filtered = state.tasks

    if (state.currentFilter.type === 'My Tasks') {
      filtered = filtered.filter(task => task.owner.id === state.currentUser?.id && task.assignees.length === 0)
    } else if (state.currentFilter.type === 'Delegated Task') {
      filtered = filtered.filter(task => task.assignees.some(a => a.email === state.currentUser?.email))
    } else if (state.currentFilter.type === 'Meetings') {
      filtered = filtered.filter(task => task.type === 'Meeting')
    }

    if (state.currentFilter.date) {
      filtered = filtered.filter(task => task.date.toDateString() === state.currentFilter.date?.toDateString())
    }

    return filtered
  }

  const getTasksForDate = (date: Date): Task[] => {
    return state.tasks.filter(task => task.date.toDateString() === date.toDateString())
  }

  const getTasksByType = (type: TaskFilter['type']): Task[] => {
    if (type === 'My Tasks') {
      return state.tasks.filter(task => task.owner.id === state.currentUser?.id && task.assignees.length === 0)
    } else if (type === 'Delegated Task') {
      return state.tasks.filter(task => task.assignees.some(a => a.email === state.currentUser?.email))
    } else if (type === 'Meetings') {
      return state.tasks.filter(task => task.type === 'Meeting')
    }
    return []
  }

  const value: TaskContextType = useMemo(
    () => ({
      state,
      dispatch,
      refreshTasks,
      addTask,
      updateTask,
      deleteTask,
      updateTaskStatus,
      updateCompletionStatus,
      getFilteredTasks,
      getTasksForDate,
      getTasksByType,
      ensureUserProfile,
    }),
    [state]
  )

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

export function useTaskContext() {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error('useTaskContext must be used within a TaskProvider')
  return ctx
} 
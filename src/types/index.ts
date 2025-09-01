export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  company?: string;
  date: Date;
  time?: string;
  type: 'Task' | 'Meeting' | 'Week-off';
  color: 'red' | 'green' | 'blue' | 'yellow' | 'pink' | 'orange';
  status: TaskStatus;
  completionStatus: CompletionStatus;
  owner: User;
  assignees: User[];
  notes?: string;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 'No Action' | 'Accepted' | 'In Progress' | 'Done';
export type CompletionStatus = 'Pending' | 'Completed';

export interface RecurrencePattern {
  type: 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
}

export interface TaskFilter {
  type: 'My Tasks' | 'Delegated Task' | 'Meetings';
  date?: Date;
  status?: TaskStatus;
  assignee?: string;
}

export interface EmailNotification {
  id: string;
  taskId: string;
  type: 'reminder' | 'assignment' | 'update';
  recipient: User;
  reminderTime?: number; // minutes before
  sent: boolean;
  sentAt?: Date;
}

export interface CalendarEvent {
  id: string;
  task: Task;
  start: Date;
  end: Date;
  allDay: boolean;
} 
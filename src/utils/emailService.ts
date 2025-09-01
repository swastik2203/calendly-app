import { Task, User, EmailNotification } from '../types'

async function postEmail(to: string[], subject: string, html: string) {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html }),
    })
    if (!res.ok) throw new Error('send failed')
    return true
  } catch (e) {
    console.log('Email send failed, falling back to console log:', e)
    return false
  }
}

export class EmailService {
  private static notifications: EmailNotification[] = []

  static async sendTaskAssignment(task: Task, assignees: User[]): Promise<void> {
    const to = assignees.map(a => a.email)
    const subject = `New Task Assignment - ${task.title}`
    const html = `<p>You have been assigned: <b>${task.title}</b></p>`
    const ok = await postEmail(to, subject, html)
    const now = new Date()
    assignees.forEach(assignee => {
      this.notifications.push({ id: `${now.getTime()}-${assignee.email}`, taskId: task.id, type: 'assignment', recipient: assignee, sent: ok, sentAt: now })
    })
  }

  static async sendTaskUpdate(task: Task, assignees: User[]): Promise<void> {
    const to = assignees.map(a => a.email)
    const subject = `Task Updated - ${task.title}`
    const html = `<p>Task updated. Status: <b>${task.status}</b>, Completion: <b>${task.completionStatus}</b></p>`
    const ok = await postEmail(to, subject, html)
    const now = new Date()
    assignees.forEach(assignee => {
      this.notifications.push({ id: `${now.getTime()}-${assignee.email}`, taskId: task.id, type: 'update', recipient: assignee, sent: ok, sentAt: now })
    })
  }

  static async sendReminder(task: Task, recipient: User, reminderTime: number): Promise<void> {
    const subject = `Reminder - ${task.title} in ${reminderTime} minutes`
    const html = `<p>Reminder for <b>${task.title}</b> at ${task.time || ''}</p>`
    const ok = await postEmail([recipient.email], subject, html)
    const now = new Date()
    this.notifications.push({ id: `${now.getTime()}-${recipient.email}`, taskId: task.id, type: 'reminder', recipient, reminderTime, sent: ok, sentAt: now })
  }

  static async sendMeetingInvitation(task: Task, participants: User[]): Promise<void> {
    const to = participants.map(p => p.email)
    const subject = `Meeting Invitation - ${task.title}`
    const html = `<p>Meeting: <b>${task.title}</b> at ${task.time || ''}</p>`
    const ok = await postEmail(to, subject, html)
    const now = new Date()
    participants.forEach(p => {
      this.notifications.push({ id: `${now.getTime()}-${p.email}`, taskId: task.id, type: 'assignment', recipient: p, sent: ok, sentAt: now })
    })
  }

  static getNotifications(): EmailNotification[] {
    return this.notifications
  }

  static clearNotifications(): void {
    this.notifications = []
  }
}

export function scheduleTaskReminders(_task: Task): void {
  // For serverless, real schedulers should be cron/queue. Keep client-side reminder optional.
} 
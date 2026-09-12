export type Urgency = 'urgent' | 'normal' | 'someday'
export type Duration = 'short' | 'medium' | 'long'
export type TaskStatus = 'open' | 'completed'

export interface Task {
  id: string
  title: string
  description?: string
  categoryId: string
  urgency: Urgency
  duration: Duration
  estimatedMinutes?: number
  dueDate?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  status: TaskStatus
  notes?: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  createdAt: string
  sortOrder: number
}

export interface BackupData {
  version: 1
  exportedAt: string
  tasks: Task[]
  categories: Category[]
}

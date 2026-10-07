export type Urgency = 'urgent' | 'normal' | 'someday'
export type Duration = 'short' | 'medium' | 'long'
export type TaskStatus = 'open' | 'completed'
export type EnergyLevel = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description?: string
  categoryId: string
  urgency: Urgency
  duration: Duration
  estimatedMinutes?: number
  energyLevel?: EnergyLevel
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
  emoji?: string
  color: string
  createdAt: string
  sortOrder: number
}

export interface QuickItem {
  id: string
  text: string
  completed: boolean
  createdAt: string
  sortOrder?: number
}

export type ThoughtColor = 'yellow' | 'red' | 'pink' | 'purple' | 'blue' | 'green' | 'orange'

export interface Thought {
  id: string
  title?: string
  content: string
  color: ThoughtColor
  tags: string[]
  x: number
  y: number
  zIndex: number
  manualX?: number
  manualY?: number
  manualZIndex?: number
  createdAt: string
  updatedAt: string
}

export interface BackupData {
  version: 1 | 2
  exportedAt: string
  tasks: Task[]
  categories: Category[]
  quickItems?: QuickItem[]
  thoughts?: Thought[]
}

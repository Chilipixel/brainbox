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
  /** Synchronisations-Metadaten; bei alten lokalen Datensätzen optional. */
  sourceDeviceId?: string
}

export interface Category {
  id: string
  name: string
  icon: string
  emoji?: string
  color: string
  createdAt: string
  sortOrder: number
  /** Bei Datensätzen aus älteren App-Versionen noch nicht vorhanden. */
  updatedAt?: string
  sourceDeviceId?: string
}

export interface SyncTombstone {
  key: string
  entityType: 'task' | 'category'
  id: string
  createdAt: string
  updatedAt: string
  deletedAt: string
  sourceDeviceId: string
}

export interface QuickItem {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

export interface BackupData {
  version: 1
  exportedAt: string
  tasks: Task[]
  categories: Category[]
  quickItems?: QuickItem[]
}

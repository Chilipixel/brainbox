import type { BackupData, Category, Task } from '../types/models'

const urgencies = ['urgent', 'normal', 'someday']
const durations = ['short', 'medium', 'long']

const isString = (value: unknown): value is string => typeof value === 'string'

function validCategory(value: unknown): value is Category {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return ['id', 'name', 'icon', 'color', 'createdAt'].every((key) => isString(v[key])) && typeof v.sortOrder === 'number'
}

function validTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return ['id', 'title', 'categoryId', 'createdAt', 'updatedAt'].every((key) => isString(v[key]))
    && urgencies.includes(String(v.urgency)) && durations.includes(String(v.duration))
    && ['open', 'completed'].includes(String(v.status))
}

export function validateBackup(value: unknown): value is BackupData {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  if (v.version !== 1 || !isString(v.exportedAt) || !Array.isArray(v.tasks) || !Array.isArray(v.categories)) return false
  if (!v.tasks.every(validTask) || !v.categories.every(validCategory)) return false
  const ids = new Set(v.categories.map((category) => category.id))
  return v.tasks.every((task) => ids.has(task.categoryId))
}

export function createBackup(tasks: Task[], categories: Category[]): BackupData {
  return { version: 1, exportedAt: new Date().toISOString(), tasks, categories }
}

import type { BackupData, Category, QuickItem, Task } from '../types/models'

const urgencies = ['urgent', 'normal', 'someday']
const durations = ['short', 'medium', 'long']
const energyLevels = ['low', 'medium', 'high']

const isString = (value: unknown): value is string => typeof value === 'string'

function validCategory(value: unknown): value is Category {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return ['id', 'name', 'icon', 'color', 'createdAt'].every((key) => isString(v[key])) && typeof v.sortOrder === 'number'
    && (v.emoji === undefined || isString(v.emoji))
}

function validTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return ['id', 'title', 'categoryId', 'createdAt', 'updatedAt'].every((key) => isString(v[key]))
    && urgencies.includes(String(v.urgency)) && durations.includes(String(v.duration))
    && (v.energyLevel === undefined || energyLevels.includes(String(v.energyLevel)))
    && ['open', 'completed'].includes(String(v.status))
}

function validQuickItem(value: unknown): value is QuickItem {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return ['id', 'text', 'createdAt'].every((key) => isString(v[key])) && typeof v.completed === 'boolean'
}

export function validateBackup(value: unknown): value is BackupData {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  if (v.version !== 1 || !isString(v.exportedAt) || !Array.isArray(v.tasks) || !Array.isArray(v.categories)) return false
  if (v.quickItems !== undefined && (!Array.isArray(v.quickItems) || !v.quickItems.every(validQuickItem))) return false
  if (!v.tasks.every(validTask) || !v.categories.every(validCategory)) return false
  const ids = new Set(v.categories.map((category) => category.id))
  return v.tasks.every((task) => ids.has(task.categoryId))
}

export function createBackup(tasks: Task[], categories: Category[], quickItems: QuickItem[] = []): BackupData {
  return { version: 1, exportedAt: new Date().toISOString(), tasks, categories, quickItems }
}

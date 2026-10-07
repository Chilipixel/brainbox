import type { BackupData, Category, QuickItem, Task, Thought } from '../types/models'

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
    && (v.sortOrder === undefined || typeof v.sortOrder === 'number')
}

function validThought(value: unknown): value is Thought {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return ['id', 'content', 'color', 'createdAt', 'updatedAt'].every((key) => isString(v[key]))
    && (v.title === undefined || isString(v.title))
    && ['yellow', 'pink', 'purple', 'blue', 'green', 'orange'].includes(String(v.color))
    && Array.isArray(v.tags) && v.tags.every(isString)
    && ['x', 'y', 'zIndex'].every((key) => typeof v[key] === 'number' && Number.isFinite(v[key]))
}

export function validateBackup(value: unknown): value is BackupData {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  if (![1, 2].includes(Number(v.version)) || !isString(v.exportedAt) || !Array.isArray(v.tasks) || !Array.isArray(v.categories)) return false
  if (v.quickItems !== undefined && (!Array.isArray(v.quickItems) || !v.quickItems.every(validQuickItem))) return false
  if (v.thoughts !== undefined && (!Array.isArray(v.thoughts) || !v.thoughts.every(validThought))) return false
  if (!v.tasks.every(validTask) || !v.categories.every(validCategory)) return false
  const ids = new Set(v.categories.map((category) => category.id))
  return v.tasks.every((task) => ids.has(task.categoryId))
}

export function createBackup(tasks: Task[], categories: Category[], quickItems: QuickItem[] = [], thoughts: Thought[] = []): BackupData {
  return { version: 2, exportedAt: new Date().toISOString(), tasks, categories, quickItems, thoughts }
}

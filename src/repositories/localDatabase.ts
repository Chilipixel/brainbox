import Dexie, { type EntityTable } from 'dexie'
import type { Category, Task } from '../types/models'
import type { CategoryRepository, TaskRepository } from './interfaces'

export class SinnvollDatabase extends Dexie {
  tasks!: EntityTable<Task, 'id'>
  categories!: EntityTable<Category, 'id'>

  constructor() {
    super('sinnvoll-db')
    this.version(1).stores({
      tasks: 'id, categoryId, urgency, duration, status, dueDate, createdAt, completedAt',
      categories: 'id, sortOrder, name'
    })
  }
}

export const db = new SinnvollDatabase()

export const taskRepository: TaskRepository = {
  list: () => db.tasks.toArray(),
  save: async (task) => { await db.tasks.put(task) },
  delete: async (id) => { await db.tasks.delete(id) },
  replaceAll: async (tasks) => { await db.transaction('rw', db.tasks, async () => { await db.tasks.clear(); await db.tasks.bulkPut(tasks) }) }
}

export const categoryRepository: CategoryRepository = {
  list: () => db.categories.orderBy('sortOrder').toArray(),
  save: async (category) => { await db.categories.put(category) },
  delete: async (id) => { await db.categories.delete(id) },
  replaceAll: async (categories) => { await db.transaction('rw', db.categories, async () => { await db.categories.clear(); await db.categories.bulkPut(categories) }) }
}

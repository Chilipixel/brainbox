import Dexie, { type EntityTable } from 'dexie'
import type { Category, QuickItem, Task, Thought } from '../types/models'
import type { CategoryRepository, QuickItemRepository, TaskRepository, ThoughtRepository } from './interfaces'

export class SinnvollDatabase extends Dexie {
  tasks!: EntityTable<Task, 'id'>
  categories!: EntityTable<Category, 'id'>
  quickItems!: EntityTable<QuickItem, 'id'>
  thoughts!: EntityTable<Thought, 'id'>

  constructor() {
    super('sinnvoll-db')
    this.version(1).stores({
      tasks: 'id, categoryId, urgency, duration, status, dueDate, createdAt, completedAt',
      categories: 'id, sortOrder, name'
    })
    this.version(2).stores({
      tasks: 'id, categoryId, urgency, duration, energyLevel, status, dueDate, createdAt, completedAt',
      categories: 'id, sortOrder, name',
      quickItems: 'id, createdAt'
    })
    this.version(3).stores({
      tasks: 'id, categoryId, urgency, duration, energyLevel, status, dueDate, createdAt, completedAt',
      categories: 'id, sortOrder, name',
      quickItems: 'id, createdAt',
      syncTombstones: 'key, entityType, id, updatedAt, deletedAt'
    })
    // Version 3 enthielt kurzzeitig optionale Sync-Metadaten. Version 4 entfernt
    // ausschließlich diesen Hilfsspeicher; Aufgaben und Kategorien bleiben erhalten.
    this.version(4).stores({
      tasks: 'id, categoryId, urgency, duration, energyLevel, status, dueDate, createdAt, completedAt',
      categories: 'id, sortOrder, name',
      quickItems: 'id, createdAt',
      syncTombstones: null
    })
    this.version(5).stores({
      tasks: 'id, categoryId, urgency, duration, energyLevel, status, dueDate, createdAt, completedAt',
      categories: 'id, sortOrder, name',
      quickItems: 'id, sortOrder, createdAt',
      thoughts: 'id, updatedAt, createdAt, color, *tags'
    }).upgrade(async (transaction) => {
      const quickItems = await transaction.table('quickItems').toArray() as QuickItem[]
      quickItems.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      await transaction.table('quickItems').bulkPut(quickItems.map((item, sortOrder) => ({ ...item, sortOrder })))
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

export const quickItemRepository: QuickItemRepository = {
  list: () => db.quickItems.orderBy('createdAt').toArray(),
  save: async (item) => { await db.quickItems.put(item) },
  deleteCompleted: async () => { await db.quickItems.filter((item) => item.completed).delete() },
  replaceAll: async (items) => { await db.transaction('rw', db.quickItems, async () => { await db.quickItems.clear(); await db.quickItems.bulkPut(items) }) }
}

export const thoughtRepository: ThoughtRepository = {
  save: async (thought) => { await db.thoughts.put(thought) },
  delete: async (id) => { await db.thoughts.delete(id) },
  replaceAll: async (thoughts) => { await db.transaction('rw', db.thoughts, async () => { await db.thoughts.clear(); await db.thoughts.bulkPut(thoughts) }) }
}

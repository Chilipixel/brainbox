/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { Category, QuickItem, Task } from '../types/models'
import { db, quickItemRepository } from '../repositories/localDatabase'
import { createQuickItem, toggleQuickItemState } from '../domain/quickChecklist'
import { seedDevelopmentData } from '../repositories/seed'
import { getDeviceId } from '../sync/localSyncStore'
import { syncManager } from '../sync/syncManager'

interface AppData {
  tasks: Task[]
  categories: Category[]
  quickItems: QuickItem[]
  ready: boolean
  saveTask(task: Task): Promise<void>
  deleteTask(id: string): Promise<void>
  toggleTask(id: string): Promise<void>
  saveCategory(category: Category): Promise<void>
  deleteCategory(id: string, moveTo?: string): Promise<void>
  addQuickItem(text: string): Promise<void>
  toggleQuickItem(id: string): Promise<void>
  clearCompletedQuickItems(): Promise<void>
  importData(tasks: Task[], categories: Category[], quickItems?: QuickItem[]): Promise<void>
}

const AppDataContext = createContext<AppData | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [seeded, setSeeded] = useState(false)
  useEffect(() => { seedDevelopmentData().finally(() => setSeeded(true)) }, [])
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], [])
  const categories = useLiveQuery(() => db.categories.orderBy('sortOrder').toArray(), [], [])
  const quickItems = useLiveQuery(() => db.quickItems.orderBy('createdAt').toArray(), [], [])

  const value = useMemo<AppData>(() => ({
    tasks, categories, quickItems, ready: seeded,
    saveTask: async (task) => {
      await db.tasks.put({ ...task, sourceDeviceId: getDeviceId() })
      syncManager.markLocalChange()
    },
    deleteTask: async (id) => {
      const task = await db.tasks.get(id)
      if (!task) return
      const now = new Date().toISOString()
      await db.transaction('rw', db.tasks, db.syncTombstones, async () => {
        await db.tasks.delete(id)
        await db.syncTombstones.put({ key: `task:${id}`, entityType: 'task', id, createdAt: task.createdAt, updatedAt: now, deletedAt: now, sourceDeviceId: getDeviceId() })
      })
      syncManager.markLocalChange()
    },
    toggleTask: async (id) => {
      const task = await db.tasks.get(id)
      if (!task) return
      const completed = task.status === 'open'
      await db.tasks.put({ ...task, status: completed ? 'completed' : 'open', completedAt: completed ? new Date().toISOString() : undefined, updatedAt: new Date().toISOString(), sourceDeviceId: getDeviceId() })
      syncManager.markLocalChange()
    },
    saveCategory: async (category) => {
      await db.categories.put({ ...category, updatedAt: new Date().toISOString(), sourceDeviceId: getDeviceId() })
      syncManager.markLocalChange()
    },
    deleteCategory: async (id, moveTo) => {
      const now = new Date().toISOString()
      const deviceId = getDeviceId()
      await db.transaction('rw', db.categories, db.tasks, db.syncTombstones, async () => {
        const related = await db.tasks.where('categoryId').equals(id).toArray()
        if (moveTo) await db.tasks.bulkPut(related.map((task) => ({ ...task, categoryId: moveTo, updatedAt: now, sourceDeviceId: deviceId })))
        else {
          await db.tasks.bulkDelete(related.map((task) => task.id))
          await db.syncTombstones.bulkPut(related.map((task) => ({ key: `task:${task.id}`, entityType: 'task' as const, id: task.id, createdAt: task.createdAt, updatedAt: now, deletedAt: now, sourceDeviceId: deviceId })))
        }
        const category = await db.categories.get(id)
        await db.categories.delete(id)
        if (category) await db.syncTombstones.put({ key: `category:${id}`, entityType: 'category', id, createdAt: category.createdAt, updatedAt: now, deletedAt: now, sourceDeviceId: deviceId })
      })
      syncManager.markLocalChange()
    },
    addQuickItem: async (text) => {
      const item = createQuickItem(text)
      if (item) await quickItemRepository.save(item)
    },
    toggleQuickItem: async (id) => {
      const item = await db.quickItems.get(id)
      if (item) await quickItemRepository.save(toggleQuickItemState(item))
    },
    clearCompletedQuickItems: () => quickItemRepository.deleteCompleted(),
    importData: async (nextTasks, nextCategories, nextQuickItems = []) => {
      const now = new Date().toISOString()
      const deviceId = getDeviceId()
      const [oldTasks, oldCategories] = await Promise.all([db.tasks.toArray(), db.categories.toArray()])
      const nextTaskIds = new Set(nextTasks.map((task) => task.id)); const nextCategoryIds = new Set(nextCategories.map((category) => category.id))
      await db.transaction('rw', db.categories, db.tasks, db.quickItems, db.syncTombstones, async () => {
        await db.tasks.clear(); await db.categories.clear(); await db.quickItems.clear()
        await db.syncTombstones.clear()
        await db.categories.bulkPut(nextCategories.map((category) => ({ ...category, updatedAt: now, sourceDeviceId: deviceId })))
        await db.tasks.bulkPut(nextTasks.map((task) => ({ ...task, updatedAt: now, sourceDeviceId: deviceId })))
        await db.quickItems.bulkPut(nextQuickItems)
        await db.syncTombstones.bulkPut([
          ...oldTasks.filter((task) => !nextTaskIds.has(task.id)).map((task) => ({ key: `task:${task.id}`, entityType: 'task' as const, id: task.id, createdAt: task.createdAt, updatedAt: now, deletedAt: now, sourceDeviceId: deviceId })),
          ...oldCategories.filter((category) => !nextCategoryIds.has(category.id)).map((category) => ({ key: `category:${category.id}`, entityType: 'category' as const, id: category.id, createdAt: category.createdAt, updatedAt: now, deletedAt: now, sourceDeviceId: deviceId }))
        ])
      })
      syncManager.markLocalChange()
    }
  }), [tasks, categories, quickItems, seeded])

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const context = useContext(AppDataContext)
  if (!context) throw new Error('useAppData must be used inside AppProvider')
  return context
}

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { Category, Task } from '../types/models'
import { categoryRepository, db, taskRepository } from '../repositories/localDatabase'
import { seedDevelopmentData } from '../repositories/seed'

interface AppData {
  tasks: Task[]
  categories: Category[]
  ready: boolean
  saveTask(task: Task): Promise<void>
  deleteTask(id: string): Promise<void>
  toggleTask(id: string): Promise<void>
  saveCategory(category: Category): Promise<void>
  deleteCategory(id: string, moveTo?: string): Promise<void>
  importData(tasks: Task[], categories: Category[]): Promise<void>
}

const AppDataContext = createContext<AppData | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [seeded, setSeeded] = useState(false)
  useEffect(() => { seedDevelopmentData().finally(() => setSeeded(true)) }, [])
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], [])
  const categories = useLiveQuery(() => db.categories.orderBy('sortOrder').toArray(), [], [])

  const value = useMemo<AppData>(() => ({
    tasks, categories, ready: seeded,
    saveTask: (task) => taskRepository.save(task),
    deleteTask: (id) => taskRepository.delete(id),
    toggleTask: async (id) => {
      const task = await db.tasks.get(id)
      if (!task) return
      const completed = task.status === 'open'
      await taskRepository.save({ ...task, status: completed ? 'completed' : 'open', completedAt: completed ? new Date().toISOString() : undefined, updatedAt: new Date().toISOString() })
    },
    saveCategory: (category) => categoryRepository.save(category),
    deleteCategory: async (id, moveTo) => {
      await db.transaction('rw', db.categories, db.tasks, async () => {
        const related = await db.tasks.where('categoryId').equals(id).toArray()
        if (moveTo) await db.tasks.bulkPut(related.map((task) => ({ ...task, categoryId: moveTo, updatedAt: new Date().toISOString() })))
        else await db.tasks.bulkDelete(related.map((task) => task.id))
        await db.categories.delete(id)
      })
    },
    importData: async (nextTasks, nextCategories) => {
      await db.transaction('rw', db.categories, db.tasks, async () => {
        await db.tasks.clear(); await db.categories.clear()
        await db.categories.bulkPut(nextCategories); await db.tasks.bulkPut(nextTasks)
      })
    }
  }), [tasks, categories, seeded])

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const context = useContext(AppDataContext)
  if (!context) throw new Error('useAppData must be used inside AppProvider')
  return context
}

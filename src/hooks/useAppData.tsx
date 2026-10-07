/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { Category, QuickItem, Task, Thought } from '../types/models'
import { categoryRepository, db, quickItemRepository, taskRepository, thoughtRepository } from '../repositories/localDatabase'
import { createQuickItem, reorderQuickItems, toggleQuickItemState } from '../domain/quickChecklist'
import { seedDevelopmentData } from '../repositories/seed'
import { celebrateTaskCompletion } from '../services/confetti'

interface AppData {
  tasks: Task[]
  categories: Category[]
  quickItems: QuickItem[]
  thoughts: Thought[]
  ready: boolean
  saveTask(task: Task): Promise<void>
  deleteTask(id: string): Promise<void>
  toggleTask(id: string): Promise<void>
  saveCategory(category: Category): Promise<void>
  deleteCategory(id: string, moveTo?: string): Promise<void>
  addQuickItem(text: string): Promise<void>
  toggleQuickItem(id: string): Promise<void>
  clearCompletedQuickItems(): Promise<void>
  reorderQuickItem(activeId: string, targetId: string): Promise<void>
  saveThought(thought: Thought): Promise<void>
  deleteThought(id: string): Promise<void>
  saveThoughts(thoughts: Thought[]): Promise<void>
  importData(tasks: Task[], categories: Category[], quickItems?: QuickItem[], thoughts?: Thought[]): Promise<void>
}

const AppDataContext = createContext<AppData | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [seeded, setSeeded] = useState(false)
  useEffect(() => { seedDevelopmentData().finally(() => setSeeded(true)) }, [])
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], [])
  const categories = useLiveQuery(() => db.categories.orderBy('sortOrder').toArray(), [], [])
  const quickItems = useLiveQuery(() => db.quickItems.orderBy('sortOrder').toArray(), [], [])
  const thoughts = useLiveQuery(() => db.thoughts.toArray(), [], [])

  const value = useMemo<AppData>(() => ({
    tasks, categories, quickItems, thoughts, ready: seeded,
    saveTask: (task) => taskRepository.save(task),
    deleteTask: (id) => taskRepository.delete(id),
    toggleTask: async (id) => {
      const task = await db.tasks.get(id)
      if (!task) return
      const completed = task.status === 'open'
      await taskRepository.save({ ...task, status: completed ? 'completed' : 'open', completedAt: completed ? new Date().toISOString() : undefined, updatedAt: new Date().toISOString() })
      if (completed) celebrateTaskCompletion()
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
    addQuickItem: async (text) => {
      const nextOrder = quickItems.reduce((maximum, item) => Math.max(maximum, item.sortOrder ?? -1), -1) + 1
      const item = createQuickItem(text, new Date(), crypto.randomUUID(), nextOrder)
      if (item) await quickItemRepository.save(item)
    },
    toggleQuickItem: async (id) => {
      const item = await db.quickItems.get(id)
      if (item) await quickItemRepository.save(toggleQuickItemState(item))
    },
    clearCompletedQuickItems: () => quickItemRepository.deleteCompleted(),
    reorderQuickItem: async (activeId, targetId) => {
      await db.quickItems.bulkPut(reorderQuickItems(quickItems, activeId, targetId))
    },
    saveThought: (thought) => thoughtRepository.save(thought),
    deleteThought: (id) => thoughtRepository.delete(id),
    saveThoughts: async (nextThoughts) => { await db.thoughts.bulkPut(nextThoughts) },
    importData: async (nextTasks, nextCategories, nextQuickItems = [], nextThoughts = []) => {
      await db.transaction('rw', db.categories, db.tasks, db.quickItems, db.thoughts, async () => {
        await db.tasks.clear(); await db.categories.clear(); await db.quickItems.clear(); await db.thoughts.clear()
        await db.categories.bulkPut(nextCategories); await db.tasks.bulkPut(nextTasks)
        await db.quickItems.bulkPut(nextQuickItems.map((item, sortOrder) => ({ ...item, sortOrder: item.sortOrder ?? sortOrder })))
        await db.thoughts.bulkPut(nextThoughts)
      })
    }
  }), [tasks, categories, quickItems, thoughts, seeded])

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const context = useContext(AppDataContext)
  if (!context) throw new Error('useAppData must be used inside AppProvider')
  return context
}

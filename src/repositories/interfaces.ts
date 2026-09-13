import type { Category, QuickItem, Task } from '../types/models'

export interface TaskRepository {
  list(): Promise<Task[]>
  save(task: Task): Promise<void>
  delete(id: string): Promise<void>
  replaceAll(tasks: Task[]): Promise<void>
}

export interface CategoryRepository {
  list(): Promise<Category[]>
  save(category: Category): Promise<void>
  delete(id: string): Promise<void>
  replaceAll(categories: Category[]): Promise<void>
}

export interface QuickItemRepository {
  list(): Promise<QuickItem[]>
  save(item: QuickItem): Promise<void>
  deleteCompleted(): Promise<void>
  replaceAll(items: QuickItem[]): Promise<void>
}

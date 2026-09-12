import type { Category, Task } from '../types/models'

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

import type { Task } from '../types/models'
import { durationFallbackMinutes } from './labels'

const urgencyWeight = { urgent: 0, normal: 1, someday: 2 } as const

export function taskMinutes(task: Task): number {
  return task.estimatedMinutes ?? durationFallbackMinutes[task.duration]
}

function dueWeight(task: Task, now = new Date()): number {
  if (!task.dueDate) return 3
  const due = new Date(`${task.dueDate}T23:59:59`)
  const days = Math.ceil((due.getTime() - now.getTime()) / 86_400_000)
  if (days < 0) return 0
  if (days === 0) return 1
  if (days <= 3) return 2
  return 3
}

export function compareByPriority(a: Task, b: Task, now = new Date()): number {
  return dueWeight(a, now) - dueWeight(b, now)
    || urgencyWeight[a.urgency] - urgencyWeight[b.urgency]
    || taskMinutes(a) - taskMinutes(b)
    || a.createdAt.localeCompare(b.createdAt)
}

export function sortTasks(tasks: Task[], mode: string, categoryName?: (id: string) => string): Task[] {
  const list = [...tasks]
  switch (mode) {
    case 'duration': return list.sort((a, b) => taskMinutes(a) - taskMinutes(b))
    case 'category': return list.sort((a, b) => (categoryName?.(a.categoryId) ?? '').localeCompare(categoryName?.(b.categoryId) ?? ''))
    case 'dueDate': return list.sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'))
    case 'createdAt': return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    case 'alphabetical': return list.sort((a, b) => a.title.localeCompare(b.title))
    default: return list.sort(compareByPriority)
  }
}

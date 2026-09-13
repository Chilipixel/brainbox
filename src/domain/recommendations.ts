import type { EnergyLevel, Task } from '../types/models'
import { compareByPriority, taskMinutes } from './ranking'

const open = (tasks: Task[]) => tasks.filter((task) => task.status === 'open')

export function getUrgentTasks(tasks: Task[]) {
  return open(tasks).filter((task) => task.urgency === 'urgent').sort(compareByPriority)
}

export function getBestTaskNow(tasks: Task[]) {
  return open(tasks).sort(compareByPriority)[0]
}

export function getTasksForAvailableTime(tasks: Task[], minutes: number) {
  const max = minutes >= 60 ? Number.POSITIVE_INFINITY : Math.max(minutes * 1.25, minutes + 5)
  return open(tasks)
    .filter((task) => taskMinutes(task) <= max)
    .sort(compareByPriority)
}

export function getBoredomTasks(tasks: Task[]) {
  return open(tasks).filter((task) => task.urgency === 'someday').sort((a, b) => taskMinutes(a) - taskMinutes(b))
}

export function getTasksForRandomTime(tasks: Task[], maxMinutes: number) {
  const candidates = open(tasks)
  return Number.isFinite(maxMinutes) ? candidates.filter((task) => taskMinutes(task) <= maxMinutes) : candidates
}

export type RandomMode = 'any' | 'important' | 'boredom'

export function filterTasksByAvailableEnergy(tasks: Task[], energyLevel?: EnergyLevel) {
  if (!energyLevel) return tasks
  const levels: EnergyLevel[] = energyLevel === 'low' ? ['low'] : energyLevel === 'medium' ? ['medium', 'low'] : ['high', 'medium', 'low']
  for (const level of levels) {
    const matching = tasks.filter((task) => task.energyLevel === level)
    if (matching.length) return matching
  }
  return tasks.filter((task) => !task.energyLevel)
}

export function getRandomTask(tasks: Task[], minutes: number, mode: RandomMode, energyLevel?: EnergyLevel, excludeId?: string, random = Math.random) {
  let candidates = getTasksForRandomTime(tasks, minutes)
  if (excludeId && candidates.length > 1) candidates = candidates.filter((task) => task.id !== excludeId)
  if (mode === 'boredom') {
    const someday = candidates.filter((task) => task.urgency === 'someday')
    if (someday.length) candidates = someday
  }
  candidates = filterTasksByAvailableEnergy(candidates, energyLevel)
  if (!candidates.length) return undefined
  const weights = candidates.map((task) => {
    if (mode === 'boredom') return task.urgency === 'someday' ? 8 : 1
    if (mode === 'important') return task.urgency === 'urgent' ? 8 : task.urgency === 'normal' ? 4 : 1
    return task.urgency === 'urgent' ? 4 : task.urgency === 'normal' ? 2 : 1
  })
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  let target = random() * total
  for (let index = 0; index < candidates.length; index += 1) {
    target -= weights[index]
    if (target <= 0) return candidates[index]
  }
  return candidates.at(-1)
}

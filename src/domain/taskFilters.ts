import type { EnergyLevel, Task } from '../types/models'

export type EnergyFilter = 'all' | 'none' | EnergyLevel

export function matchesEnergyFilter(task: Task, filter: string) {
  return filter === 'all' || (filter === 'none' ? !task.energyLevel : task.energyLevel === filter)
}

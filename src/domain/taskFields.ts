import type { EnergyLevel } from '../types/models'

const energyLevels: EnergyLevel[] = ['low', 'medium', 'high']

export function optionalDate(value: string) {
  const trimmed = value.trim()
  return trimmed || undefined
}

export function optionalEnergy(value: string): EnergyLevel | undefined {
  return energyLevels.includes(value as EnergyLevel) ? value as EnergyLevel : undefined
}

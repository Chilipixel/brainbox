import { BatteryFull, BatteryLow, BatteryMedium } from 'lucide-react'
import { energyLabels } from '../domain/labels'
import type { EnergyLevel } from '../types/models'

const icons = { low: BatteryLow, medium: BatteryMedium, high: BatteryFull }

export function EnergyLabel({ level }: { level: EnergyLevel }) {
  const Icon = icons[level]
  return <span className="energy-label"><Icon aria-hidden="true" />{energyLabels[level]}</span>
}

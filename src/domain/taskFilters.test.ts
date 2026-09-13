import { describe, expect, it } from 'vitest'
import { matchesEnergyFilter } from './taskFilters'
import type { Task } from '../types/models'

const task = (energyLevel?: Task['energyLevel']): Task => ({ id:'t', title:'Test', categoryId:'c', urgency:'normal', duration:'short', energyLevel, status:'open', createdAt:'2026-01-01', updatedAt:'2026-01-01' })

describe('Energiefilter', () => {
  it('filtert jede Energiestufe gezielt', () => {
    expect(matchesEnergyFilter(task('low'), 'low')).toBe(true)
    expect(matchesEnergyFilter(task('medium'), 'low')).toBe(false)
    expect(matchesEnergyFilter(task('high'), 'high')).toBe(true)
  })
  it('findet bestehende Aufgaben ohne Energieangabe', () => expect(matchesEnergyFilter(task(), 'none')).toBe(true))
})

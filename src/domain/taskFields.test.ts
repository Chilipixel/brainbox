import { describe, expect, it } from 'vitest'
import { optionalDate, optionalEnergy } from './taskFields'

describe('optionale Aufgabenfelder', () => {
  it('speichert ein gesetztes Datum', () => expect(optionalDate('2026-09-13')).toBe('2026-09-13'))
  it('entfernt ein gelöschtes oder leeres Datum vollständig', () => {
    expect(optionalDate('')).toBeUndefined()
    expect(optionalDate('   ')).toBeUndefined()
  })
  it('speichert nur gültige Energielevel', () => {
    expect(optionalEnergy('low')).toBe('low')
    expect(optionalEnergy('')).toBeUndefined()
  })
})

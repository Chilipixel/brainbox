import { describe, expect, it } from 'vitest'
import { getQuoteForDate, getQuoteIndexForDate } from './dailyQuote'

describe('täglicher Spruch', () => {
  it('liefert am gleichen lokalen Tag immer denselben Spruch', () => {
    expect(getQuoteForDate(new Date(2026, 8, 13, 0, 1))).toBe(getQuoteForDate(new Date(2026, 8, 13, 23, 59)))
  })

  it('liefert an aufeinanderfolgenden Tagen unterschiedliche Sprüche', () => {
    expect(getQuoteForDate(new Date(2026, 8, 13))).not.toBe(getQuoteForDate(new Date(2026, 8, 14)))
  })

  it('wechselt über einen Monatswechsel', () => {
    expect(getQuoteForDate(new Date(2026, 8, 30))).not.toBe(getQuoteForDate(new Date(2026, 9, 1)))
  })

  it('wechselt über einen Jahreswechsel', () => {
    expect(getQuoteForDate(new Date(2026, 11, 31))).not.toBe(getQuoteForDate(new Date(2027, 0, 1)))
  })

  it('behandelt den 29. Februar als eigenen Tag', () => {
    const before = getQuoteForDate(new Date(2028, 1, 28))
    const leapDay = getQuoteForDate(new Date(2028, 1, 29))
    const after = getQuoteForDate(new Date(2028, 2, 1))
    expect(leapDay).not.toBe(before)
    expect(leapDay).not.toBe(after)
  })

  it('liefert für viele Daten immer einen gültigen Index', () => {
    for (let day = 1; day <= 366; day += 1) {
      const index = getQuoteIndexForDate(new Date(2028, 0, day), 17)
      expect(index).toBeGreaterThanOrEqual(0)
      expect(index).toBeLessThan(17)
    }
  })

  it('funktioniert mit genau einem Spruch', () => {
    expect(getQuoteForDate(new Date(2026, 0, 1), ['Alles okay.'])).toBe('Alles okay.')
    expect(getQuoteForDate(new Date(2027, 11, 31), ['Alles okay.'])).toBe('Alles okay.')
  })
})

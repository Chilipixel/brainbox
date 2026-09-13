import { describe, expect, it } from 'vitest'
import { calendarMonthDays } from './calendar'

describe('Kalenderauswahl', () => {
  it('ordnet einen Monat ab Montag korrekt an', () => {
    const days = calendarMonthDays(new Date(2028, 1, 1))
    expect(days[0]).toBeNull()
    expect(days.filter((day) => day !== null)).toHaveLength(29)
  })
  it('enthält jeden Kalendertag genau einmal', () => {
    expect(calendarMonthDays(new Date(2026, 8, 1)).filter((day) => day !== null)).toEqual(Array.from({ length:30 }, (_, index) => index + 1))
  })
})

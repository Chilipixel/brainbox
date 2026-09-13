import { describe, expect, it } from 'vitest'
import { contrastRatio } from './contrast'

describe('Farbkontrast', () => {
  it('erfüllt für beide farbigen Empfehlungskarten mindestens WCAG AA', () => {
    expect(contrastRatio('#ffffff', '#9d3035')).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio('#ffffff', '#87500f')).toBeGreaterThanOrEqual(4.5)
  })
  it('hält den Daily Quote in Light und Dark Mode lesbar', () => {
    expect(contrastRatio('#17212b', '#e2f0ee')).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio('#edf2f5', '#203b39')).toBeGreaterThanOrEqual(4.5)
  })
})

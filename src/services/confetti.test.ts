import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { celebrateTaskCompletion } from './confetti'

function element() {
  return { className: '', setAttribute: vi.fn(), style: { setProperty: vi.fn() }, appendChild: vi.fn(), remove: vi.fn() }
}

describe('Konfettiregen', () => {
  const motion = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
  const body = { appendChild: vi.fn() }
  const createElement = vi.fn(element)

  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    motion.matches = false
    vi.stubGlobal('window', { matchMedia: vi.fn(() => motion), setTimeout, clearTimeout })
    vi.stubGlobal('document', { createElement, body })
  })
  afterEach(() => {
    vi.runAllTimers()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('erzeugt einen dekorativen Regen und entfernt ihn nach kurzer Zeit', () => {
    celebrateTaskCompletion()
    const rain = createElement.mock.results[0].value
    expect(rain.className).toBe('confetti-rain')
    expect(rain.setAttribute).toHaveBeenCalledWith('aria-hidden', 'true')
    expect(rain.appendChild).toHaveBeenCalledTimes(56)
    expect(body.appendChild).toHaveBeenCalledWith(rain)
    vi.advanceTimersByTime(3300)
    expect(rain.remove).toHaveBeenCalledOnce()
  })

  it('respektiert reduzierte Bewegung', () => {
    motion.matches = true
    celebrateTaskCompletion()
    expect(createElement).not.toHaveBeenCalled()
  })

  it('ersetzt einen laufenden Regen statt mehrere Effekte zu stapeln', () => {
    celebrateTaskCompletion()
    const first = createElement.mock.results[0].value
    celebrateTaskCompletion()
    expect(first.remove).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(1)
  })

  it('stoppt auch beim Umschalten der Bewegungseinstellung', () => {
    celebrateTaskCompletion()
    const rain = createElement.mock.results[0].value
    const cleanup = motion.addEventListener.mock.calls[0][1]
    cleanup()
    expect(rain.remove).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })
})

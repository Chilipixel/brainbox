import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { celebrateTaskCompletion, isConfettiEnabled, setConfettiEnabled } from './confetti'

function element() {
  return { className: '', setAttribute: vi.fn(), style: { setProperty: vi.fn() }, appendChild: vi.fn(), remove: vi.fn() }
}

describe('Konfettiregen', () => {
  const motion = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
  const body = { appendChild: vi.fn() }
  const createElement = vi.fn(element)
  const stored = new Map<string, string>()

  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    motion.matches = false
    stored.clear()
    vi.stubGlobal('localStorage', { getItem: (key: string) => stored.get(key) ?? null, setItem: (key: string, value: string) => stored.set(key, value) })
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

  it('ist standardmäßig aktiviert und speichert die Auswahl dauerhaft', () => {
    expect(isConfettiEnabled()).toBe(true)
    setConfettiEnabled(false)
    expect(stored.get('confetti-enabled')).toBe('false')
    expect(isConfettiEnabled()).toBe(false)
    celebrateTaskCompletion()
    expect(createElement).not.toHaveBeenCalled()
    setConfettiEnabled(true)
    expect(isConfettiEnabled()).toBe(true)
    celebrateTaskCompletion()
    expect(body.appendChild).toHaveBeenCalledOnce()
  })

  it('beendet beim Ausschalten sofort einen laufenden Regen', () => {
    celebrateTaskCompletion()
    const rain = createElement.mock.results[0].value
    setConfettiEnabled(false)
    expect(rain.remove).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
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

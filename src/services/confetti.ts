const colors = ['#a875ef', '#ee8db5', '#ffad65', '#ffd477', '#65b8ae', '#86b9ef']
let clearActiveRain: (() => void) | undefined

export function isConfettiEnabled() {
  return localStorage.getItem('confetti-enabled') !== 'false'
}

export function setConfettiEnabled(enabled: boolean) {
  localStorage.setItem('confetti-enabled', String(enabled))
  if (!enabled) clearActiveRain?.()
}

/** A short, decorative celebration; never blocks the task controls. */
export function celebrateTaskCompletion() {
  clearActiveRain?.()
  if (!isConfettiEnabled()) return
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (motion.matches) return

  const rain = document.createElement('div')
  rain.className = 'confetti-rain'
  rain.setAttribute('aria-hidden', 'true')
  for (let index = 0; index < 56; index++) {
    const piece = document.createElement('span')
    piece.style.left = `${Math.random() * 100}%`
    piece.style.backgroundColor = colors[index % colors.length]
    piece.style.setProperty('--drift', `${Math.random() * 160 - 80}px`)
    piece.style.setProperty('--spin', `${Math.random() * 900 - 450}deg`)
    piece.style.animationDuration = `${2000 + Math.random() * 800}ms`
    piece.style.animationDelay = `${Math.random() * 300}ms`
    rain.appendChild(piece)
  }
  document.body.appendChild(rain)

  const cleanup = () => {
    window.clearTimeout(timer)
    motion.removeEventListener('change', cleanup)
    rain.remove()
    if (clearActiveRain === cleanup) clearActiveRain = undefined
  }
  const timer = window.setTimeout(cleanup, 3300)
  motion.addEventListener('change', cleanup)
  clearActiveRain = cleanup
}

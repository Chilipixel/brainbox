import type { Duration, Urgency } from '../types/models'

export const urgencyLabels: Record<Urgency, string> = {
  urgent: 'Dringend', normal: 'Normal', someday: 'Irgendwann'
}

export const durationLabels: Record<Duration, string> = {
  short: 'Kurz', medium: 'Mittel', long: 'Lang'
}

export const durationFallbackMinutes: Record<Duration, number> = {
  short: 10, medium: 45, long: 90
}

export function formatDuration(duration: Duration, minutes?: number) {
  if (minutes) return minutes >= 60 ? `${Math.round(minutes / 15) / 4} Std.` : `ca. ${minutes} Min.`
  return duration === 'short' ? '< 15 Min.' : duration === 'medium' ? '15–60 Min.' : '1 Std.+'
}

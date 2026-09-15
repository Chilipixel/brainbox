import { CalendarDays, ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { calendarMonthDays } from '../domain/calendar'

const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

function parseDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return year && month && day ? new Date(year, month - 1, day) : new Date()
}

function dateValue(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function CalendarField({ value, onChange }: { value: string, onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(() => parseDate(value))
  const closeButton = useRef<HTMLButtonElement>(null)
  const days = useMemo(() => calendarMonthDays(month), [month])
  const selected = value ? parseDate(value) : undefined
  const today = new Date()

  useEffect(() => {
    if (!open) return
    closeButton.current?.focus({ preventScroll: true })
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open])

  function show() {
    setMonth(parseDate(value))
    setOpen(true)
  }

  return <>
    <button type="button" className={`calendar-trigger ${value ? '' : 'empty'}`} onClick={show} aria-haspopup="dialog"><span>{value ? parseDate(value).toLocaleDateString('de-DE') : 'Datum auswählen'}</span><CalendarDays aria-hidden="true" /></button>
    {open && <div className="calendar-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}>
      <section className="calendar-dialog" role="dialog" aria-modal="true" aria-labelledby="calendar-title">
        <div className="calendar-title-row"><strong id="calendar-title">Fälligkeitsdatum</strong><button ref={closeButton} type="button" onClick={() => setOpen(false)} aria-label="Kalender schließen"><X /></button></div>
        <div className="calendar-month-row"><button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Vorheriger Monat"><ChevronLeft /></button><strong>{month.toLocaleDateString('de-DE', { month:'long', year:'numeric' })}</strong><button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Nächster Monat"><ChevronRight /></button></div>
        <div className="calendar-weekdays" aria-hidden="true">{weekdays.map((day) => <span key={day}>{day}</span>)}</div>
        <div className="calendar-grid">{days.map((day, index) => day === null ? <span key={`empty-${index}`} /> : <button type="button" key={day} className={`${selected?.getFullYear() === month.getFullYear() && selected.getMonth() === month.getMonth() && selected.getDate() === day ? 'selected' : ''} ${today.getFullYear() === month.getFullYear() && today.getMonth() === month.getMonth() && today.getDate() === day ? 'today' : ''}`} onClick={() => { onChange(dateValue(month.getFullYear(), month.getMonth(), day)); setOpen(false) }} aria-label={new Date(month.getFullYear(), month.getMonth(), day).toLocaleDateString('de-DE', { day:'numeric', month:'long', year:'numeric' })}>{day}</button>)}</div>
        <div className="calendar-actions"><button type="button" className="calendar-clear" onClick={() => { onChange(''); setOpen(false) }} disabled={!value}><Trash2 /> Datum löschen</button><button type="button" onClick={() => setOpen(false)}>Abbrechen</button></div>
      </section>
    </div>}
  </>
}

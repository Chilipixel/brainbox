import { ArrowDown, ArrowRight, ArrowUp, CalendarDays, CheckCircle2, CircleDot, Clock3, Eye, EyeOff, Folder, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { DailyQuote } from '../components/DailyQuote'
import { PageHeader } from '../components/PageHeader'
import { QuickChecklist } from '../components/QuickChecklist'
import { energyLabels, formatDuration } from '../domain/labels'
import { getBestTaskNow, getBoredomTasks, getTasksForAvailableTime } from '../domain/recommendations'
import { useAppData } from '../hooks/useAppData'
import type { Task } from '../types/models'

type WidgetId = 'welcome' | 'quick' | 'now' | 'thirty' | 'week' | 'month' | 'boredom' | 'overview'
type WidgetPreference = { id: WidgetId, visible: boolean }

const widgetLabels: Record<WidgetId, string> = {
  welcome: 'Begrüßung', quick: 'Kurz notiert · Kleine Dinge', now: 'Jetzt sinnvoll', thirty: '30-Minuten-Empfehlung',
  week: 'Diese Woche', month: 'Dieser Monat', boredom: 'Bei Langeweile', overview: 'Überblick'
}
const defaultWidgets: WidgetPreference[] = (Object.keys(widgetLabels) as WidgetId[]).map((id) => ({ id, visible: true }))

function loadWidgets(): WidgetPreference[] {
  try {
    const stored = JSON.parse(localStorage.getItem('home-widgets-v1') ?? '[]') as WidgetPreference[]
    const valid = stored.filter((item) => item && item.id in widgetLabels && typeof item.visible === 'boolean')
    const missing = defaultWidgets.filter((item) => !valid.some((storedItem) => storedItem.id === item.id))
    return valid.length ? [...valid, ...missing] : defaultWidgets
  } catch { return defaultWidgets }
}

function greeting() {
  const hour = new Date().getHours()
  return hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Hallo' : 'Guten Abend'
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function HomePage() {
  const { tasks, categories } = useAppData()
  const navigate = useNavigate()
  const [widgets, setWidgets] = useState(loadWidgets)
  const [customizing, setCustomizing] = useState(false)
  useEffect(() => { localStorage.setItem('home-widgets-v1', JSON.stringify(widgets)) }, [widgets])

  const open = tasks.filter((task) => task.status === 'open')
  const best = getBestTaskNow(tasks)
  const thirty = getTasksForAvailableTime(tasks.filter((task) => task.id !== best?.id), 30)[0]
  const boredom = getBoredomTasks(tasks)
  const category = (id?: string) => categories.find((item) => item.id === id)
  const today = new Date()
  const userName = localStorage.getItem('user-name')?.trim()
  const todayKey = dateKey(today)
  const dayUntilSunday = (7 - today.getDay()) % 7
  const weekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayUntilSunday)
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const dueThisWeek = open.filter((task) => task.dueDate && task.dueDate >= todayKey && task.dueDate <= dateKey(weekEnd))
  const dueThisMonth = open.filter((task) => task.dueDate && task.dueDate >= dateKey(monthStart) && task.dueDate <= dateKey(monthEnd))
  const weekAgo = new Date(Date.now() - 7 * 86_400_000)
  const doneWeek = tasks.filter((task) => task.completedAt && new Date(task.completedAt) >= weekAgo).length

  const Recommendation = ({ task, tone }: { task: typeof best, tone: string }) => task ? (
    <button className={`recommendation ${tone}`} onClick={() => navigate(`/task/${task.id}`)}>
      <div className="recommendation-icon"><Clock3 /></div>
      <div><strong>{task.title}</strong><span>{category(task.categoryId)?.name} · {formatDuration(task.duration, task.estimatedMinutes)}{task.energyLevel ? ` · ${energyLabels[task.energyLevel]}` : ''}</span></div>
      <ArrowRight aria-hidden="true" />
    </button>
  ) : <EmptyState title="Alles erledigt" text="Lege eine Aufgabe an, wenn dir etwas einfällt." />

  const content: Record<WidgetId, ReactNode> = {
    welcome: <section className="welcome"><span>{greeting()}{userName ? `, ${userName}` : ''}</span><h2>Was möchtest du heute angehen?</h2><DailyQuote /></section>,
    quick: <QuickChecklist />,
    now: <section><div className="section-heading"><span>Jetzt sinnvoll</span><CircleDot /></div><Recommendation task={best} tone="red" /></section>,
    thirty: <section><div className="section-heading"><span>Wenn du 30 Minuten hast</span><Clock3 /></div><Recommendation task={thirty} tone="orange" /></section>,
    week: <DueWidget title="Diese Woche fällig" tasks={dueThisWeek} categoryName={(id) => category(id)?.name} onOpen={(id) => navigate(`/task/${id}`)} />,
    month: <DueWidget title="Diesen Monat fällig" tasks={dueThisMonth} categoryName={(id) => category(id)?.name} onOpen={(id) => navigate(`/task/${id}`)} />,
    boredom: <Link className="boredom-card" to="/random" state={{ mode: 'boredom' }}><div><span>Bei Langeweile</span><strong>{boredom.length} Ideen warten auf dich</strong></div><div className="bubble-count">{boredom.length}</div></Link>,
    overview: <section><div className="section-heading"><span>Dein Überblick</span></div><div className="stats-grid">
      <Link to="/all"><ListStat icon={<CheckCircle2 />} value={open.length} label="offene Aufgaben" /></Link>
      <Link to="/all?due=today"><ListStat icon={<CalendarDays />} value={open.filter((task) => task.dueDate === todayKey).length} label="heute fällig" /></Link>
      <Link to="/categories"><ListStat icon={<Folder />} value={categories.length} label="Kategorien" /></Link>
      <Link to="/completed"><ListStat icon={<CheckCircle2 />} value={doneWeek} label="diese Woche erledigt" /></Link>
    </div></section>
  }

  function moveWidget(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= widgets.length) return
    setWidgets((current) => { const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next })
  }

  function toggleWidget(id: WidgetId) {
    setWidgets((current) => current.map((item) => item.id === id ? { ...item, visible: !item.visible } : item))
  }

  return <>
    <PageHeader title="Brainbox" />
    <main className="page home-page">
      <div className="home-config-bar"><span>{widgets.filter((item) => item.visible).length} Bereiche sichtbar</span><button onClick={() => setCustomizing((value) => !value)} aria-expanded={customizing}><SlidersHorizontal /> Startseite anpassen</button></div>
      {customizing && <section className="widget-editor" aria-label="Startseite anpassen"><div className="widget-editor-title"><strong>Bereiche anordnen</strong><button onClick={() => setCustomizing(false)} aria-label="Anpassung schließen"><X /></button></div>
        {widgets.map((widget, index) => <div className="widget-editor-row" key={widget.id}><button onClick={() => toggleWidget(widget.id)} aria-label={`${widgetLabels[widget.id]} ${widget.visible ? 'ausblenden' : 'einblenden'}`}>{widget.visible ? <Eye /> : <EyeOff />}</button><span className={widget.visible ? '' : 'hidden-label'}>{widgetLabels[widget.id]}</span><button disabled={index === 0} onClick={() => moveWidget(index, -1)} aria-label={`${widgetLabels[widget.id]} nach oben`}><ArrowUp /></button><button disabled={index === widgets.length - 1} onClick={() => moveWidget(index, 1)} aria-label={`${widgetLabels[widget.id]} nach unten`}><ArrowDown /></button></div>)}
      </section>}
      {widgets.filter((widget) => widget.visible).map((widget) => <div className={`home-widget home-widget-${widget.id}`} key={widget.id}>{content[widget.id]}</div>)}
    </main>
  </>
}

function DueWidget({ title, tasks, categoryName, onOpen }: { title: string, tasks: Task[], categoryName: (id: string) => string | undefined, onOpen: (id: string) => void }) {
  const sorted = [...tasks].sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
  return <section className="due-widget"><div className="section-heading"><span>{title}</span><CalendarDays /></div><div className="due-card">
    <div className="due-summary"><strong>{tasks.length}</strong><span>{tasks.length === 1 ? 'Aufgabe' : 'Aufgaben'}</span></div>
    <div className="due-list">{sorted.slice(0, 3).map((task) => <button key={task.id} onClick={() => onOpen(task.id)}><span><strong>{task.title}</strong><small>{categoryName(task.categoryId)}</small></span><time>{new Date(`${task.dueDate}T12:00:00`).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}</time></button>)}{!tasks.length && <span className="due-empty">Nichts mit Termin</span>}</div>
  </div></section>
}

function ListStat({ icon, value, label }: { icon: ReactNode, value: number, label: string }) {
  return <div className="stat-card"><span>{icon}</span><strong>{value}</strong><small>{label}</small></div>
}

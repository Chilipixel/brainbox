import { useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { TaskRow } from '../components/TaskRow'
import { useAppData } from '../hooks/useAppData'

export function CompletedPage() {
  const { tasks, categories, toggleTask } = useAppData()
  const [period, setPeriod] = useState('week')
  const now = new Date()
  const since = period === 'today' ? new Date(now.getFullYear(), now.getMonth(), now.getDate()) : period === 'week' ? new Date(Date.now() - 7 * 86_400_000) : period === 'month' ? new Date(now.getFullYear(), now.getMonth(), 1) : new Date(0)
  const visible = tasks.filter((task) => task.status === 'completed' && task.completedAt && new Date(task.completedAt) >= since).sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
  return <><PageHeader title="Erledigt" back />
    <main className="page"><div className="completed-summary"><strong>{visible.length}</strong><span>Aufgaben erledigt</span></div><div className="period-tabs">{[['today','Heute'],['week','Woche'],['month','Monat'],['all','Alle']].map(([value,label]) => <button key={value} className={period === value ? 'active' : ''} onClick={() => setPeriod(value)}>{label}</button>)}</div>
      <div className="task-list">{visible.map((task) => <div key={task.id}><span className="completion-date">{new Date(task.completedAt!).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</span><TaskRow task={task} category={categories.find((category) => category.id === task.categoryId)} onToggle={() => toggleTask(task.id)} /></div>)}</div>
      {!visible.length && <EmptyState title="Noch nichts erledigt" text="Erledigte Aufgaben erscheinen hier." />}
    </main></>
}

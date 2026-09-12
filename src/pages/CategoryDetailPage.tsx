import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { TaskRow } from '../components/TaskRow'
import { urgencyLabels } from '../domain/labels'
import { sortTasks } from '../domain/ranking'
import { useAppData } from '../hooks/useAppData'
import type { Urgency } from '../types/models'

export function CategoryDetailPage() {
  const { id } = useParams()
  const { tasks, categories, toggleTask } = useAppData()
  const category = categories.find((item) => item.id === id)
  const [sort, setSort] = useState('priority')
  const ownTasks = tasks.filter((task) => task.categoryId === id && task.status === 'open')
  const groups: Urgency[] = ['urgent', 'normal', 'someday']

  return <><PageHeader title={category?.name ?? 'Kategorie'} back />
    <main className="page"><div className="detail-hero"><span className="large-category-icon" style={{ background: `${category?.color}20`, color: category?.color }}>{category?.icon}</span><div><span className="eyebrow">Kategorie</span><h2>{category?.name}</h2><p>{ownTasks.length} offene Aufgaben</p></div></div>
      <label className="sort-control">Sortierung<select value={sort} onChange={(e) => setSort(e.target.value)}><option value="priority">Priorität</option><option value="duration">Dauer</option><option value="alphabetical">Alphabetisch</option><option value="dueDate">Fälligkeit</option></select></label>
      {!ownTasks.length && <EmptyState title="Hier ist alles erledigt" text="Neue Aufgaben fügst du über das Plus hinzu." />}
      {groups.map((urgency) => { const group = sortTasks(ownTasks.filter((task) => task.urgency === urgency), sort); return group.length ? <section className="task-group" key={urgency}><div className={`group-title ${urgency}`}>{urgencyLabels[urgency]}<span>{group.length}</span></div><div className="task-list">{group.map((task) => <TaskRow key={task.id} task={task} category={category} onToggle={() => toggleTask(task.id)} />)}</div></section> : null })}
    </main></>
}

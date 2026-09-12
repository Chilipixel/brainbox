import { Calendar, Clock3, Edit3, Trash2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { formatDuration, urgencyLabels } from '../domain/labels'
import { useAppData } from '../hooks/useAppData'

export function TaskDetailPage() {
  const { id } = useParams()
  const { tasks, categories, toggleTask, deleteTask } = useAppData()
  const navigate = useNavigate()
  const task = tasks.find((item) => item.id === id)
  if (!task) return <><PageHeader title="Aufgabe" back /><main className="page"><EmptyState title="Aufgabe nicht gefunden" text="Sie wurde möglicherweise gelöscht." /></main></>
  const category = categories.find((item) => item.id === task.categoryId)
  async function remove() { if (window.confirm('Diese Aufgabe wirklich löschen?')) { await deleteTask(task!.id); navigate('/all') } }
  return <><PageHeader title="Aufgabe" back />
    <main className="page detail-page"><div className={`task-detail-card urgency-${task.urgency}`}><div className="detail-category"><span style={{ background: `${category?.color}20` }}>{category?.icon}</span>{category?.name}</div><h2>{task.title}</h2><div className="detail-badges"><span>{urgencyLabels[task.urgency]}</span><span><Clock3 />{formatDuration(task.duration, task.estimatedMinutes)}</span>{task.dueDate && <span><Calendar />{new Date(`${task.dueDate}T12:00:00`).toLocaleDateString('de-DE')}</span>}</div></div>
      {task.description && <section className="detail-section"><span className="eyebrow">Beschreibung</span><p>{task.description}</p></section>}
      {task.notes && <section className="detail-section"><span className="eyebrow">Notizen</span><p>{task.notes}</p></section>}
      <section className="detail-section metadata"><span>Erstellt</span><strong>{new Date(task.createdAt).toLocaleDateString('de-DE')}</strong>{task.completedAt && <><span>Erledigt</span><strong>{new Date(task.completedAt).toLocaleDateString('de-DE')}</strong></>}</section>
      <div className="detail-actions"><button className="primary-button" onClick={() => toggleTask(task.id)}>{task.status === 'open' ? '✓ Erledigt markieren' : '↶ Wieder öffnen'}</button><button className="secondary-button" onClick={() => navigate(`/task/${task.id}/edit`)}><Edit3 /> Bearbeiten</button><button className="danger-button" onClick={remove}><Trash2 /> Löschen</button></div>
    </main></>
}

import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { durationLabels, energyLabels, formatDuration, urgencyLabels } from '../domain/labels'
import { categoryEmoji } from '../domain/categoryDisplay'
import type { Category, Task } from '../types/models'

export function TaskRow({ task, category, onToggle, showUrgency = false }: { task: Task, category?: Category, onToggle: () => void, showUrgency?: boolean }) {
  const navigate = useNavigate()
  return <article className={`task-row urgency-${task.urgency}${task.status === 'completed' ? ' completed' : ''}`}>
    <button className="task-check" onClick={onToggle} aria-label={`${task.title} ${task.status === 'open' ? 'erledigen' : 'wieder öffnen'}`}>
      <span aria-hidden="true">{task.status === 'completed' ? '✓' : ''}</span>
    </button>
    <button className="task-main" onClick={() => navigate(`/task/${task.id}`)}>
      <strong>{task.title}</strong>
      <span><i className="category-emoji" aria-hidden="true">{categoryEmoji(category)}</i>{category?.name ?? 'Ohne Kategorie'} · {formatDuration(task.duration, task.estimatedMinutes)}{task.energyLevel ? ` · ${energyLabels[task.energyLevel]}` : ''}</span>
      {showUrgency && <small>{urgencyLabels[task.urgency]} · {durationLabels[task.duration]}</small>}
    </button>
    <ChevronRight className="row-chevron" aria-hidden="true" />
  </article>
}

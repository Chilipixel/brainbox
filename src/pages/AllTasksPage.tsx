import { Filter, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { TaskRow } from '../components/TaskRow'
import { sortTasks } from '../domain/ranking'
import { useAppData } from '../hooks/useAppData'

export function AllTasksPage() {
  const { tasks, categories, toggleTask } = useAppData()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('priority')
  const [category, setCategory] = useState('all')
  const [urgency, setUrgency] = useState('all')
  const [duration, setDuration] = useState('all')
  const [status, setStatus] = useState('open')
  const [due, setDue] = useState('all')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const getCategory = (id: string) => categories.find((item) => item.id === id)
  const visible = useMemo(() => sortTasks(tasks.filter((task) => {
    const haystack = `${task.title} ${task.description ?? ''}`.toLowerCase()
    return haystack.includes(query.toLowerCase()) && (category === 'all' || task.categoryId === category)
      && (urgency === 'all' || task.urgency === urgency) && (duration === 'all' || task.duration === duration)
      && (status === 'all' || task.status === status) && (due === 'all' || (due === 'with' ? !!task.dueDate : !task.dueDate))
  }), sort, (id) => categories.find((item) => item.id === id)?.name ?? ''), [tasks, query, category, urgency, duration, status, due, sort, categories])
  const filters = [category, urgency, duration, status, due].filter((item, index) => item !== (index === 3 ? 'open' : 'all')).length

  return <><PageHeader title="Alle Aufgaben" />
    <main className="page all-page"><div className="search-row"><label className="search-box"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Aufgaben durchsuchen" />{query && <button onClick={() => setQuery('')} aria-label="Suche löschen"><X /></button>}</label><button className={`filter-button ${filters ? 'active' : ''}`} onClick={() => setFiltersOpen(!filtersOpen)} aria-label="Filter"><Filter />{filters > 0 && <span>{filters}</span>}</button></div>
      {filtersOpen && <div className="filters-panel">
        <Select label="Kategorie" value={category} onChange={setCategory} options={[['all', 'Alle'], ...categories.map((c) => [c.id, c.name])]} />
        <Select label="Dringlichkeit" value={urgency} onChange={setUrgency} options={[["all","Alle"],["urgent","Dringend"],["normal","Normal"],["someday","Irgendwann"]]} />
        <Select label="Dauer" value={duration} onChange={setDuration} options={[["all","Alle"],["short","Kurz"],["medium","Mittel"],["long","Lang"]]} />
        <Select label="Status" value={status} onChange={setStatus} options={[["open","Offen"],["completed","Erledigt"],["all","Alle"]]} />
        <Select label="Termin" value={due} onChange={setDue} options={[["all","Alle"],["with","Mit Fälligkeit"],["without","Ohne Fälligkeit"]]} />
      </div>}
      <div className="list-toolbar"><span>{visible.length} {visible.length === 1 ? 'Aufgabe' : 'Aufgaben'}</span><select aria-label="Sortierung" value={sort} onChange={(e) => setSort(e.target.value)}><option value="priority">Nach Priorität</option><option value="duration">Nach Dauer</option><option value="category">Nach Kategorie</option><option value="dueDate">Nach Fälligkeit</option><option value="createdAt">Nach Erstellung</option><option value="alphabetical">Alphabetisch</option></select></div>
      <div className="task-list">{visible.map((task) => <TaskRow key={task.id} task={task} category={getCategory(task.categoryId)} onToggle={() => toggleTask(task.id)} showUrgency />)}</div>
      {!visible.length && <EmptyState title="Nichts gefunden" text="Passe deine Suche oder Filter an." />}
    </main></>
}

function Select({ label, value, onChange, options }: { label: string, value: string, onChange: (value: string) => void, options: string[][] }) {
  return <label>{label}<select value={value} onChange={(e) => onChange(e.target.value)}>{options.map(([key, text]) => <option value={key} key={key}>{text}</option>)}</select></label>
}

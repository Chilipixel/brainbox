import { BatteryFull, BatteryLow, BatteryMedium, Check, ListPlus, Plus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { EmojiPicker } from '../components/EmojiPicker'
import { categoryEmoji } from '../domain/categoryDisplay'
import { appendChecklistLine } from '../domain/noteChecklist'
import { optionalDate, optionalEnergy } from '../domain/taskFields'
import { useAppData } from '../hooks/useAppData'
import type { Duration, EnergyLevel, Urgency } from '../types/models'

const colors = ['#5778d3', '#e58b45', '#8357c5', '#289b91', '#d05c73', '#597a8f']

export function TaskFormPage() {
  const { id } = useParams()
  const { tasks, categories, saveTask, saveCategory } = useAppData()
  const existing = tasks.find((task) => task.id === id)
  const navigate = useNavigate()
  const draftKey = id ? `task-draft-${id}` : 'task-draft-new'
  const draft = !existing ? JSON.parse(sessionStorage.getItem(draftKey) ?? 'null') as Record<string, string> | null : null
  const [title, setTitle] = useState(existing?.title ?? draft?.title ?? '')
  const [description, setDescription] = useState(existing?.description ?? existing?.notes ?? draft?.description ?? '')
  const [urgency, setUrgency] = useState<Urgency>(existing?.urgency ?? (draft?.urgency as Urgency) ?? 'normal')
  const [duration, setDuration] = useState<Duration>(existing?.duration ?? (draft?.duration as Duration) ?? 'medium')
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | ''>(existing?.energyLevel ?? (draft?.energyLevel as EnergyLevel) ?? '')
  const [minutes, setMinutes] = useState(existing?.estimatedMinutes?.toString() ?? draft?.minutes ?? '')
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? draft?.categoryId ?? categories[0]?.id ?? '')
  const [dueDate, setDueDate] = useState(existing?.dueDate ?? draft?.dueDate ?? '')
  const [newCategory, setNewCategory] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [categoryEmojiValue, setCategoryEmojiValue] = useState('')
  const descriptionInput = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    sessionStorage.setItem(draftKey, JSON.stringify({ title, description, urgency, duration, energyLevel, minutes, categoryId, dueDate }))
  }, [draftKey, title, description, urgency, duration, energyLevel, minutes, categoryId, dueDate])
  useEffect(() => { if (!categoryId && categories[0]) setCategoryId(categories[0].id) }, [categories, categoryId])

  async function createCategory() {
    if (!categoryName.trim()) return
    const category = { id: crypto.randomUUID(), name: categoryName.trim(), emoji: categoryEmojiValue.trim() || undefined, icon: '◌', color: colors[categories.length % colors.length], createdAt: new Date().toISOString(), sortOrder: categories.length }
    await saveCategory(category); setCategoryId(category.id); setCategoryName(''); setCategoryEmojiValue(''); setNewCategory(false)
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!title.trim() || !categoryId) return
    const now = new Date().toISOString()
    await saveTask({
      id: existing?.id ?? crypto.randomUUID(), title: title.trim(), description: description.trim() || undefined,
      categoryId, urgency, duration, energyLevel: optionalEnergy(energyLevel), estimatedMinutes: minutes ? Number(minutes) : undefined,
      dueDate: optionalDate(dueDate), notes: undefined, createdAt: existing?.createdAt ?? now,
      updatedAt: now, completedAt: existing?.completedAt, status: existing?.status ?? 'open'
    })
    sessionStorage.removeItem(draftKey); navigate(existing ? `/task/${existing.id}` : '/')
  }

  return <>
    <PageHeader title={existing ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'} back action={<button className="save-top" type="submit" form="task-form">Speichern</button>} />
    <main className="page form-page"><form id="task-form" onSubmit={submit}>
      <label className="field-label" htmlFor="title">Was möchtest du erledigen?</label>
      <input id="title" className="title-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Aufgabe eingeben …" autoFocus required />
      <label className="field-label" htmlFor="description">Beschreibung / Notizen <small>optional</small></label>
      <textarea ref={descriptionInput} id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details, Links oder Gedanken …" />
      <button type="button" className="notes-checklist-add" onClick={() => { setDescription((value) => appendChecklistLine(value)); requestAnimationFrame(() => descriptionInput.current?.focus()) }}><ListPlus /> Checklistenpunkt hinzufügen</button>
      <fieldset><legend>Wie dringend ist es?</legend><div className="choice-grid urgency-choices">
        <Choice active={urgency === 'urgent'} onClick={() => setUrgency('urgent')} title="Dringend" subtitle="Sollte bald erledigt werden" tone="urgent" />
        <Choice active={urgency === 'normal'} onClick={() => setUrgency('normal')} title="Normal" subtitle="Wäre gut, es zu erledigen" tone="normal" />
        <Choice active={urgency === 'someday'} onClick={() => setUrgency('someday')} title="Irgendwann" subtitle="Kein Zeitdruck" tone="someday" />
      </div></fieldset>
      <fieldset><legend>Wie lange dauert es?</legend><div className="choice-grid duration-choices">
        <Choice active={duration === 'short'} onClick={() => setDuration('short')} title="Kurz" subtitle="< 15 Minuten" />
        <Choice active={duration === 'medium'} onClick={() => setDuration('medium')} title="Mittel" subtitle="15–60 Minuten" />
        <Choice active={duration === 'long'} onClick={() => setDuration('long')} title="Lang" subtitle="> 60 Minuten" />
      </div></fieldset>
      <fieldset><legend>Wie viel Energie braucht es? <small>optional</small></legend><div className="energy-choices">
        <button type="button" className={!energyLevel ? 'active' : ''} onClick={() => setEnergyLevel('')} aria-pressed={!energyLevel}>Keine Angabe</button>
        <button type="button" className={energyLevel === 'low' ? 'active' : ''} onClick={() => setEnergyLevel('low')} aria-pressed={energyLevel === 'low'}><BatteryLow />Wenig</button>
        <button type="button" className={energyLevel === 'medium' ? 'active' : ''} onClick={() => setEnergyLevel('medium')} aria-pressed={energyLevel === 'medium'}><BatteryMedium />Mittel</button>
        <button type="button" className={energyLevel === 'high' ? 'active' : ''} onClick={() => setEnergyLevel('high')} aria-pressed={energyLevel === 'high'}><BatteryFull />Hoch</button>
      </div></fieldset>
      <div className="two-fields">
        <label>Genauer <small>Minuten</small><input inputMode="numeric" min="1" type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="z. B. 45" /></label>
        <label>Fälligkeitsdatum <small>optional</small><span className="date-input-wrap"><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />{dueDate && <button type="button" onClick={() => setDueDate('')} aria-label="Fälligkeitsdatum entfernen"><X /></button>}</span></label>
      </div>
      <fieldset><legend>Kategorie</legend><div className="category-pills">
        {categories.map((category) => <button type="button" key={category.id} className={categoryId === category.id ? 'selected' : ''} onClick={() => setCategoryId(category.id)}><span style={{ background: category.color }} aria-hidden="true">{categoryEmoji(category) || '·'}</span>{category.name}{categoryId === category.id && <Check />}</button>)}
        <button type="button" className="new-category-pill" onClick={() => setNewCategory(true)}><Plus /> Neu</button>
      </div>
      {newCategory && <div className="inline-create"><input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Name der Kategorie" /><EmojiPicker value={categoryEmojiValue} onChange={setCategoryEmojiValue} /><button type="button" onClick={createCategory}>Anlegen</button></div>}</fieldset>
      <button className="primary-button form-submit">Aufgabe speichern</button>
    </form></main>
  </>
}

function Choice({ active, onClick, title, subtitle, tone = '' }: { active: boolean, onClick: () => void, title: string, subtitle: string, tone?: string }) {
  return <button type="button" className={`choice ${tone} ${active ? 'active' : ''}`} onClick={onClick} aria-pressed={active}><span className="choice-dot">{active && <Check />}</span><strong>{title}</strong><small>{subtitle}</small></button>
}

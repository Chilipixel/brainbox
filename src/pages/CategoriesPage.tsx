import { ChevronDown, ChevronRight, ChevronUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { EmojiPicker } from '../components/EmojiPicker'
import { PageHeader } from '../components/PageHeader'
import { categoryEmoji, withCategoryEmoji } from '../domain/categoryDisplay'
import { useAppData } from '../hooks/useAppData'

const palette = ['#e58b45', '#5778d3', '#8357c5', '#289b91', '#d05c73', '#597a8f']

export function CategoriesPage() {
  const { tasks, categories, saveCategory, deleteCategory } = useAppData()
  const navigate = useNavigate()
  const [editing, setEditing] = useState<string | 'new' | null>(null)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')

  async function save() {
    if (!name.trim()) return
    const current = categories.find((category) => category.id === editing)
    await saveCategory(current ? withCategoryEmoji({ ...current, name: name.trim() }, emoji) : { id: crypto.randomUUID(), name: name.trim(), emoji: emoji.trim() || undefined, icon: '◌', color: palette[categories.length % palette.length], createdAt: new Date().toISOString(), sortOrder: categories.length })
    setEditing(null); setName(''); setEmoji('')
  }

  async function remove(id: string) {
    const related = tasks.filter((task) => task.categoryId === id).length
    const others = categories.filter((category) => category.id !== id)
    if (related && others.length) {
      const targetName = window.prompt(`${related} Aufgabe(n) gehören dazu. In welche Kategorie verschieben?`, others[0].name)
      if (targetName === null) return
      const target = others.find((category) => category.name.toLowerCase() === targetName.toLowerCase())
      if (!target) return void window.alert('Kategorie nicht gefunden.')
      await deleteCategory(id, target.id)
    } else if (window.confirm(related ? 'Kategorie und alle enthaltenen Aufgaben löschen?' : 'Kategorie wirklich löschen?')) await deleteCategory(id)
  }

  async function move(index: number, direction: -1 | 1) {
    const other = categories[index + direction]
    const current = categories[index]
    if (!other || !current) return
    await Promise.all([saveCategory({ ...current, sortOrder: other.sortOrder }), saveCategory({ ...other, sortOrder: current.sortOrder })])
  }

  return <><PageHeader title="Kategorien" />
    <main className="page"><div className="page-title-row"><div><span className="eyebrow">Deine Bereiche</span><h2>Alles an seinem Platz</h2></div><button className="compact-add" onClick={() => { setEditing('new'); setName(''); setEmoji('') }}><Plus /> Neu</button></div>
      {editing && <div className="edit-panel"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Kategoriename" autoFocus /><EmojiPicker value={emoji} onChange={setEmoji} /><button onClick={save}>Speichern</button><button onClick={() => { setEditing(null); setEmoji('') }}>Abbrechen</button></div>}
      <div className="category-list">{categories.length ? categories.map((category, index) => {
        const open = tasks.filter((task) => task.categoryId === category.id && task.status === 'open')
        const count = (urgency: string) => open.filter((task) => task.urgency === urgency).length
        return <article className="category-card" key={category.id}>
          <button className="category-open" onClick={() => navigate(`/category/${category.id}`)}>
            <span className="category-icon" style={{ background: `${category.color}1f`, color: category.color }} aria-hidden="true">{categoryEmoji(category) || '·'}</span>
            <span className="category-info"><strong>{category.name}</strong><small>{open.length} {open.length === 1 ? 'Aufgabe' : 'Aufgaben'}</small>
              <span className="urgency-dots"><i className="red" />{count('urgent')}<i className="orange" />{count('normal')}<i className="green" />{count('someday')}</span>
            </span><ChevronRight />
          </button>
          <div className="category-actions"><button disabled={index === 0} onClick={() => move(index, -1)} aria-label={`${category.name} nach oben`}><ChevronUp /></button><button disabled={index === categories.length - 1} onClick={() => move(index, 1)} aria-label={`${category.name} nach unten`}><ChevronDown /></button><button onClick={() => { setEditing(category.id); setName(category.name); setEmoji(categoryEmoji(category)) }} aria-label={`${category.name} bearbeiten`}><Pencil /></button><button onClick={() => remove(category.id)} aria-label={`${category.name} löschen`}><Trash2 /></button></div>
        </article>
      }) : <EmptyState title="Noch keine Kategorien" text="Lege deine erste Kategorie an." />}</div>
    </main></>
}

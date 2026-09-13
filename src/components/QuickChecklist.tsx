import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useAppData } from '../hooks/useAppData'

export function QuickChecklist() {
  const { quickItems, addQuickItem, toggleQuickItem, clearCompletedQuickItems } = useAppData()
  const [text, setText] = useState('')
  const completedCount = quickItems.filter((item) => item.completed).length

  async function add(event: React.FormEvent) {
    event.preventDefault()
    if (!text.trim()) return
    await addQuickItem(text)
    setText('')
  }

  return <section className="quick-checklist" aria-labelledby="quick-checklist-title">
    <div className="quick-checklist-heading"><div><span className="eyebrow">Kurz notiert</span><h3 id="quick-checklist-title">Kleine Dinge</h3></div><button type="button" onClick={clearCompletedQuickItems} disabled={!completedCount}><Trash2 /> Erledigte löschen</button></div>
    <form onSubmit={add}><input value={text} onChange={(event) => setText(event.target.value)} placeholder="Was möchtest du kurz festhalten?" aria-label="Neuer Checklisten-Eintrag" /><button aria-label="Eintrag hinzufügen"><Plus /></button></form>
    {quickItems.length ? <div className="quick-items">{quickItems.map((item) => <label key={item.id} className={item.completed ? 'completed' : ''}><input type="checkbox" checked={item.completed} onChange={() => toggleQuickItem(item.id)} /><span>{item.text}</span></label>)}</div> : <p className="quick-empty">Noch nichts notiert.</p>}
  </section>
}

import { GripVertical, Plus, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { useAppData } from '../hooks/useAppData'

export function QuickChecklist() {
  const { quickItems, addQuickItem, toggleQuickItem, clearCompletedQuickItems, reorderQuickItem } = useAppData()
  const [text, setText] = useState('')
  const [dragging, setDragging] = useState<string>()
  const dragTarget = useRef<string>()
  const completedCount = quickItems.filter((item) => item.completed).length

  async function add(event: React.FormEvent) {
    event.preventDefault()
    if (!text.trim()) return
    await addQuickItem(text)
    setText('')
  }

  function moveWithKeyboard(id: string, direction: -1 | 1) {
    const index = quickItems.findIndex((item) => item.id === id)
    const target = quickItems[index + direction]
    if (target) void reorderQuickItem(id, target.id)
  }

  function updateDragTarget(clientX: number, clientY: number) {
    const target = document.elementFromPoint(clientX, clientY)?.closest<HTMLElement>('[data-quick-id]')?.dataset.quickId
    if (target) dragTarget.current = target
  }

  return <section className="quick-checklist" aria-labelledby="quick-checklist-title">
    <div className="quick-checklist-heading"><div><span className="eyebrow">Kurz notiert</span><h3 id="quick-checklist-title">Kleine Dinge</h3></div><button type="button" onClick={clearCompletedQuickItems} disabled={!completedCount}><Trash2 /> Erledigte löschen</button></div>
    <form onSubmit={add}><input value={text} onChange={(event) => setText(event.target.value)} placeholder="Was möchtest du kurz festhalten?" aria-label="Neuer Checklisten-Eintrag" /><button aria-label="Eintrag hinzufügen"><Plus /></button></form>
    {quickItems.length ? <div className="quick-items">{quickItems.map((item) => <div data-quick-id={item.id} key={item.id} className={`quick-item${item.completed ? ' completed' : ''}${dragging === item.id ? ' dragging' : ''}`}>
      <button type="button" className="quick-drag" aria-label={`${item.text} verschieben`} onKeyDown={(event) => { if (event.key === 'ArrowUp') { event.preventDefault(); moveWithKeyboard(item.id, -1) } if (event.key === 'ArrowDown') { event.preventDefault(); moveWithKeyboard(item.id, 1) } }} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); dragTarget.current = item.id; setDragging(item.id) }} onPointerMove={(event) => { if (dragging === item.id) updateDragTarget(event.clientX, event.clientY) }} onPointerUp={(event) => { updateDragTarget(event.clientX, event.clientY); const target = dragTarget.current; setDragging(undefined); if (target && target !== item.id) void reorderQuickItem(item.id, target) }} onPointerCancel={() => setDragging(undefined)}><GripVertical /></button>
      <label><input type="checkbox" checked={item.completed} onChange={() => toggleQuickItem(item.id)} /><span>{item.text}</span></label>
    </div>)}</div> : <p className="quick-empty">Noch nichts notiert.</p>}
  </section>
}

import { GripVertical, Plus, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { useAppData } from '../hooks/useAppData'

export function QuickChecklist() {
  const { quickItems, addQuickItem, toggleQuickItem, clearCompletedQuickItems, reorderQuickItem } = useAppData()
  const [text, setText] = useState('')
  const [dragging, setDragging] = useState<{ id: string, x: number, y: number }>()
  const dragTarget = useRef<string>()
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>()
  const gesture = useRef<{ id: string, startX: number, startY: number, active: boolean }>()
  const suppressClick = useRef<string>()
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

  function updateDragTarget(clientX: number, clientY: number, activeId: string) {
    const target = document.elementsFromPoint(clientX, clientY).map((element) => element.closest<HTMLElement>('[data-quick-id]')?.dataset.quickId).find((id) => id && id !== activeId)
    if (target) dragTarget.current = target
  }

  function clearLongPress() {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
    longPressTimer.current = undefined
  }

  function startLongPress(event: React.PointerEvent<HTMLDivElement>, id: string) {
    if (event.button !== 0) return
    event.preventDefault()
    const element = event.currentTarget
    gesture.current = { id, startX:event.clientX, startY:event.clientY, active:false }
    dragTarget.current = id
    clearLongPress()
    longPressTimer.current = setTimeout(() => {
      if (gesture.current?.id !== id) return
      gesture.current.active = true
      element.setPointerCapture(event.pointerId)
      setDragging({ id, x:0, y:0 })
      navigator.vibrate?.(20)
    }, 450)
  }

  function moveLongPress(event: React.PointerEvent<HTMLDivElement>, id: string) {
    const current = gesture.current
    if (!current || current.id !== id) return
    if (!current.active) {
      if (Math.hypot(event.clientX - current.startX, event.clientY - current.startY) > 14) {
        clearLongPress()
        gesture.current = undefined
      }
      return
    }
    event.preventDefault()
    setDragging({ id, x:event.clientX-current.startX, y:event.clientY-current.startY })
    updateDragTarget(event.clientX, event.clientY, id)
  }

  function finishLongPress(event: React.PointerEvent<HTMLDivElement>, id: string) {
    clearLongPress()
    const current = gesture.current
    gesture.current = undefined
    if (!current?.active || current.id !== id) return
    event.preventDefault()
    updateDragTarget(event.clientX, event.clientY, id)
    const target = dragTarget.current
    suppressClick.current = id
    setDragging(undefined)
    if (target && target !== id) void reorderQuickItem(id, target)
    window.setTimeout(() => { if (suppressClick.current === id) suppressClick.current = undefined }, 0)
  }

  function cancelLongPress() {
    clearLongPress()
    gesture.current = undefined
    setDragging(undefined)
  }

  return <section className="quick-checklist" aria-labelledby="quick-checklist-title">
    <div className="quick-checklist-heading"><div><span className="eyebrow">Kurz notiert</span><h3 id="quick-checklist-title">Kleine Dinge</h3></div><button type="button" onClick={clearCompletedQuickItems} disabled={!completedCount}><Trash2 /> Erledigte löschen</button></div>
    <form onSubmit={add}><input value={text} onChange={(event) => setText(event.target.value)} placeholder="Was möchtest du kurz festhalten?" aria-label="Neuer Checklisten-Eintrag" /><button aria-label="Eintrag hinzufügen"><Plus /></button></form>
    {quickItems.length ? <div className="quick-items">{quickItems.map((item) => <div data-quick-id={item.id} key={item.id} className={`quick-item${item.completed ? ' completed' : ''}${dragging?.id === item.id ? ' dragging' : ''}`} style={dragging?.id === item.id ? { transform:`translate3d(${dragging.x}px, ${dragging.y}px, 0)` } : undefined} onClickCapture={(event) => { if (suppressClick.current === item.id) { event.preventDefault(); event.stopPropagation() } }}>
      <label className="quick-check"><input type="checkbox" checked={item.completed} onChange={() => toggleQuickItem(item.id)} aria-label={`${item.text} erledigt`} /></label><div className="quick-drag-area" tabIndex={0} aria-label={`${item.text}. Zum Sortieren lange gedrückt halten.`} onContextMenu={(event) => event.preventDefault()} onDragStart={(event) => event.preventDefault()} onKeyDown={(event) => { if (!event.altKey) return; if (event.key === 'ArrowUp') { event.preventDefault(); moveWithKeyboard(item.id, -1) } if (event.key === 'ArrowDown') { event.preventDefault(); moveWithKeyboard(item.id, 1) } }} onPointerDown={(event) => startLongPress(event, item.id)} onPointerMove={(event) => moveLongPress(event, item.id)} onPointerUp={(event) => finishLongPress(event, item.id)} onPointerCancel={cancelLongPress}><span>{item.text}</span><GripVertical className="quick-grip" aria-hidden="true" /></div>
    </div>)}</div> : <p className="quick-empty">Noch nichts notiert.</p>}
  </section>
}

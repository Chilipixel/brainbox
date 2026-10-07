import { ArrowUpDown, Grip, Plus, Search, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { arrangeThoughts, matchesThought, parseTags, thoughtColors, type ThoughtSort } from '../domain/thoughts'
import { useAppData } from '../hooks/useAppData'
import type { Thought, ThoughtColor } from '../types/models'

const boardWidth = 1800
const boardHeight = 1200
type Draft = { id?: string, title: string, content: string, color: ThoughtColor, tags: string, x: number, y: number, zIndex: number, manualX?: number, manualY?: number, manualZIndex?: number, createdAt?: string }
const colorLabels: Record<ThoughtColor, string> = { yellow:'Gelb', red:'Rot', pink:'Rosa', purple:'Lila', blue:'Blau', green:'Grün', orange:'Orange' }

export function ThoughtsPage() {
  const { thoughts, saveThought, deleteThought, saveThoughts } = useAppData()
  const [query, setQuery] = useState('')
  const [colorFilter, setColorFilter] = useState<ThoughtColor | 'all'>('all')
  const [searchOpen, setSearchOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>()
  const [dragPosition, setDragPosition] = useState<{ id: string, x: number, y: number }>()
  const scroller = useRef<HTMLDivElement>(null)
  const board = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: string, offsetX: number, offsetY: number }>()
  const visible = thoughts.filter((thought) => matchesThought(thought, query) && (colorFilter === 'all' || thought.color === colorFilter))
  const maxZ = thoughts.reduce((maximum, thought) => Math.max(maximum, thought.zIndex), 0)

  useEffect(() => {
    if (!draft) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setDraft(undefined) }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [draft])

  function openNew() {
    const view = scroller.current
    const x = Math.max(20, Math.min(boardWidth - 240, (view?.scrollLeft ?? 0) + (view?.clientWidth ?? 440) / 2 - 110 + (thoughts.length % 4) * 18))
    const y = Math.max(20, Math.min(boardHeight - 200, (view?.scrollTop ?? 0) + (view?.clientHeight ?? 500) / 2 - 90 + (thoughts.length % 4) * 18))
    setDraft({ title:'', content:'', color:'yellow', tags:'', x, y, zIndex:maxZ + 1 })
  }

  function openEdit(thought: Thought) {
    const front = { ...thought, zIndex:maxZ + 1 }
    void saveThought(front)
    setDraft({ ...front, title:front.title ?? '', tags:front.tags.join(', ') })
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!draft?.content.trim()) return
    const now = new Date().toISOString()
    await saveThought({ id:draft.id ?? crypto.randomUUID(), title:draft.title.trim() || undefined, content:draft.content.trim(), color:draft.color, tags:parseTags(draft.tags), x:draft.x, y:draft.y, zIndex:draft.zIndex, manualX:draft.manualX ?? draft.x, manualY:draft.manualY ?? draft.y, manualZIndex:draft.manualZIndex ?? draft.zIndex, createdAt:draft.createdAt ?? now, updatedAt:now })
    setDraft(undefined)
  }

  function pointerPosition(event: React.PointerEvent) {
    const rect = board.current?.getBoundingClientRect()
    if (!rect || !drag.current) return
    return { x:Math.max(8, Math.min(boardWidth - 228, event.clientX - rect.left - drag.current.offsetX)), y:Math.max(8, Math.min(boardHeight - 188, event.clientY - rect.top - drag.current.offsetY)) }
  }

  async function moveByKeyboard(thought: Thought, x: number, y: number) {
    const nextX = Math.max(8, Math.min(boardWidth - 228, x)); const nextY = Math.max(8, Math.min(boardHeight - 188, y)); const nextZ = maxZ + 1
    await saveThought({ ...thought, x:nextX, y:nextY, zIndex:nextZ, manualX:nextX, manualY:nextY, manualZIndex:nextZ, updatedAt:new Date().toISOString() })
  }

  function applySort(sort: ThoughtSort) {
    void saveThoughts(arrangeThoughts(thoughts, sort))
  }

  async function removeThought() {
    if (!draft?.id || !window.confirm('Dieses Post-it wirklich löschen?')) return
    await deleteThought(draft.id)
    setDraft(undefined)
  }

  return <><PageHeader title="Thoughts" workspaceSwitch />
    <main className="thoughts-page">
      <div className="thoughts-scroll" ref={scroller} tabIndex={0} aria-label="Thoughts-Pinnwand"><div className="thoughts-board" ref={board} style={{ width:boardWidth, height:boardHeight }}>
        {visible.map((thought) => { const position = dragPosition?.id === thought.id ? dragPosition : thought; return <article key={thought.id} className={`thought-card thought-${thought.color}`} style={{ left:position.x, top:position.y, zIndex:thought.zIndex }} onClick={() => openEdit(thought)}>
          <button type="button" className="thought-drag" aria-label={`${thought.title || 'Post-it'} verschieben`} onClick={(event) => event.stopPropagation()} onKeyDown={(event) => { const step = event.shiftKey ? 2 : 16; if (event.key === 'ArrowLeft') void moveByKeyboard(thought, thought.x-step, thought.y); else if (event.key === 'ArrowRight') void moveByKeyboard(thought, thought.x+step, thought.y); else if (event.key === 'ArrowUp') void moveByKeyboard(thought, thought.x, thought.y-step); else if (event.key === 'ArrowDown') void moveByKeyboard(thought, thought.x, thought.y+step); else return; event.preventDefault() }} onPointerDown={(event) => { event.stopPropagation(); const rect = event.currentTarget.parentElement!.getBoundingClientRect(); drag.current = { id:thought.id, offsetX:event.clientX-rect.left, offsetY:event.clientY-rect.top }; event.currentTarget.setPointerCapture(event.pointerId); setDragPosition({ id:thought.id, x:thought.x, y:thought.y }) }} onPointerMove={(event) => { if (drag.current?.id !== thought.id) return; const next = pointerPosition(event); if (next) setDragPosition({ id:thought.id, ...next }) }} onPointerUp={(event) => { if (drag.current?.id !== thought.id) return; const next = pointerPosition(event) ?? { x:thought.x, y:thought.y }; const nextZ=maxZ+1; drag.current=undefined; setDragPosition(undefined); void saveThought({ ...thought, ...next, zIndex:nextZ, manualX:next.x, manualY:next.y, manualZIndex:nextZ, updatedAt:new Date().toISOString() }) }} onPointerCancel={() => { drag.current=undefined; setDragPosition(undefined) }}><Grip /></button>
          {thought.title && <h2>{thought.title}</h2>}<p>{thought.content}</p>{thought.tags.length > 0 && <div className="thought-tags">{thought.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>}
        </article> })}
        {!visible.length && <div className="thoughts-empty">{thoughts.length ? 'Keine passenden Gedanken gefunden.' : 'Deine Wand ist noch leer. Klebe deinen ersten Gedanken auf.'}</div>}
      </div></div>
    </main>
    <nav className="thoughts-nav" aria-label="Thoughts-Werkzeuge">
      {searchOpen && <div className="thoughts-search-popover" role="search"><div className="thoughts-search-row"><Search /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Gedanken und Tags suchen …" aria-label="Thoughts durchsuchen" /><button type="button" onClick={() => { setQuery(''); setColorFilter('all'); setSearchOpen(false) }} aria-label="Suche schließen und Filter löschen"><X /></button></div><div className="thought-filter-colors" aria-label="Nach Farbe filtern"><button type="button" className={colorFilter === 'all' ? 'selected' : ''} onClick={() => setColorFilter('all')}>Alle</button>{thoughtColors.map((color) => <button type="button" key={color} className={`thought-filter-chip thought-${color}${colorFilter === color ? ' selected' : ''}`} onClick={() => setColorFilter(color)} aria-label={`Post-its in ${colorLabels[color]}`} aria-pressed={colorFilter === color}><span>{colorLabels[color]}</span></button>)}</div></div>}
      <button type="button" className={query || colorFilter !== 'all' ? 'active' : ''} onClick={() => setSearchOpen((open) => !open)}><Search /><span>{query || colorFilter !== 'all' ? 'Gefiltert' : 'Suchen'}</span></button>
      <button type="button" className="thoughts-add" onClick={openNew} aria-label="Neues Post-it"><Plus /></button>
      <label className="thoughts-sort"><ArrowUpDown /><span>Sortieren</span><select defaultValue="" aria-label="Post-its sortieren" onChange={(event) => { if (!event.target.value) return; applySort(event.target.value as ThoughtSort); event.target.value = '' }}><option value="" disabled>Kriterium wählen</option><option value="manual">Keine Sortierung · eigene Anordnung</option><option value="updated">Zuletzt geändert</option><option value="created">Neu erstellt</option><option value="title">Titel A–Z</option><option value="color">Farbe</option></select></label>
    </nav>
    {draft && <div className="thought-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDraft(undefined) }}><form className="thought-modal" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="thought-dialog-title"><div className="thought-modal-title"><h2 id="thought-dialog-title">{draft.id ? 'Post-it bearbeiten' : 'Neuer Gedanke'}</h2>{draft.id && <button type="button" className="thought-delete-icon" onClick={removeThought} aria-label="Post-it löschen"><Trash2 /></button>}<button type="button" onClick={() => setDraft(undefined)} aria-label="Schließen"><X /></button></div>
      <label>Überschrift <small>optional</small><input value={draft.title} onChange={(event) => setDraft({ ...draft, title:event.target.value })} /></label>
      <label>Inhalt<textarea autoFocus required value={draft.content} onChange={(event) => setDraft({ ...draft, content:event.target.value })} /></label>
      <fieldset><legend>Farbe</legend><div className="thought-colors">{thoughtColors.map((color) => <button key={color} type="button" className={`thought-color thought-${color}${draft.color === color ? ' selected' : ''}`} onClick={() => setDraft({ ...draft, color })} aria-label={`Farbe ${color}`} aria-pressed={draft.color === color} />)}</div></fieldset>
      <label>Tags <small>optional, mit Komma trennen</small><input value={draft.tags} onChange={(event) => setDraft({ ...draft, tags:event.target.value })} placeholder="Idee, später, Zuhause" /></label>
      <div className="thought-modal-actions"><button className="primary-button">Speichern</button></div>
    </form></div>}
  </>
}

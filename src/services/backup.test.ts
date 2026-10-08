import { describe, expect, it } from 'vitest'
import { createBackup, validateBackup } from './backup'
import type { Category, Task, Thought } from '../types/models'

const category: Category = { id:'c', name:'Privat', icon:'◌', color:'#000', createdAt:'2025-01-01', sortOrder:0 }
const task: Task = { id:'t', title:'Test', categoryId:'c', urgency:'normal', duration:'short', createdAt:'2025-01-01', updatedAt:'2025-01-01', status:'open' }

describe('Backup-Validierung', () => {
  it('akzeptiert eigene Exporte', () => expect(validateBackup(createBackup([task],[category]))).toBe(true))
  it('weist unbekannte Kategorien zurück', () => expect(validateBackup({ ...createBackup([{...task,categoryId:'missing'}],[category]) })).toBe(false))
  it('weist falsche Enum-Werte zurück', () => expect(validateBackup({ ...createBackup([task],[category]), tasks:[{...task,urgency:'panic'}] })).toBe(false))
  it('akzeptiert optionale Energie-, Emoji- und Checklisten-Daten', () => {
    const value = createBackup([{ ...task, energyLevel:'medium' }], [{ ...category, emoji:'🏠' }], [{ id:'q', text:'Paket holen', completed:true, createdAt:'2026-01-01' }])
    expect(validateBackup(value)).toBe(true)
  })
  it('akzeptiert alte Backups ohne neue optionale Felder', () => {
    const value = createBackup([task], [category])
    value.version = 1; delete value.quickItems; delete value.thoughts
    expect(validateBackup(value)).toBe(true)
  })
  it('exportiert und validiert Thoughts sowie Kurznotiz-Reihenfolgen', () => {
    const thought: Thought = { id:'n', content:'Gedanke', color:'blue', tags:['Idee'], x:20, y:30, zIndex:1, width:260, height:210, collapsed:true, createdAt:'2026-01-01', updatedAt:'2026-01-02' }
    const value = createBackup([task], [category], [{ id:'q', text:'Kurz', completed:false, createdAt:'2026-01-01', sortOrder:0 }], [thought])
    expect(value.version).toBe(2); expect(validateBackup(value)).toBe(true); expect(value.thoughts).toEqual([thought])
  })
  it('weist einen ungültigen Einklappstatus zurück', () => {
    const value = createBackup([task], [category], [], [{ id:'n', content:'Gedanke', color:'blue', tags:[], x:20, y:30, zIndex:1, createdAt:'2026-01-01', updatedAt:'2026-01-02' }])
    value.thoughts![0] = { ...value.thoughts![0], collapsed:'yes' } as unknown as Thought
    expect(validateBackup(value)).toBe(false)
  })
})

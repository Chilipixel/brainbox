import { describe, expect, it } from 'vitest'
import { createBackup, validateBackup } from './backup'
import type { Category, Task } from '../types/models'

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
    delete value.quickItems
    expect(validateBackup(value)).toBe(true)
  })
})

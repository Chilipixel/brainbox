import { describe, expect, it } from 'vitest'
import { createQuickItem, removeCompletedQuickItems, reorderQuickItems, toggleQuickItemState } from './quickChecklist'

describe('Startseiten-Checkliste', () => {
  it('erstellt einen offenen Eintrag', () => expect(createQuickItem('  Müll rausbringen ', new Date('2026-01-01'), 'q1')).toMatchObject({ id:'q1', text:'Müll rausbringen', completed:false }))
  it('lässt einen abgehakten Eintrag sichtbar und markiert', () => {
    const item = createQuickItem('Paket runterbringen', new Date('2026-01-01'), 'q1')!
    expect(toggleQuickItemState(item)).toEqual({ ...item, completed:true })
  })
  it('löscht nur erledigte Einträge', () => {
    const open = createQuickItem('Offen', new Date('2026-01-01'), 'q1')!
    const done = toggleQuickItemState(createQuickItem('Fertig', new Date('2026-01-01'), 'q2')!)
    expect(removeCompletedQuickItems([open, done])).toEqual([open])
  })
  it('ordnet Einträge dauerhaft neu und nummeriert lückenlos', () => {
    const first = createQuickItem('Eins', new Date('2026-01-01'), 'q1', 0)!
    const second = createQuickItem('Zwei', new Date('2026-01-02'), 'q2', 1)!
    const third = createQuickItem('Drei', new Date('2026-01-03'), 'q3', 2)!
    expect(reorderQuickItems([first, second, third], 'q3', 'q1').map(({ id, sortOrder }) => [id, sortOrder])).toEqual([['q3',0],['q1',1],['q2',2]])
  })
})

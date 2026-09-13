import { describe, expect, it } from 'vitest'
import { appendChecklistLine, parseNoteLines, toggleChecklistLine } from './noteChecklist'

describe('Checklisten in Aufgabennotizen', () => {
  it('mischt normalen Text und Checklistenpunkte', () => {
    expect(parseNoteLines('Hinweis\n☐ Prüfen\n☑ Bestellt')).toEqual([{ text:'Hinweis' }, { text:'Prüfen', checked:false }, { text:'Bestellt', checked:true }])
  })
  it('hakt einen Eintrag ab und wieder auf', () => {
    const checked = toggleChecklistLine('☐ Schrauben bestellen', 0)
    expect(checked).toBe('☑ Schrauben bestellen')
    expect(toggleChecklistLine(checked, 0)).toBe('☐ Schrauben bestellen')
  })
  it('fügt einen neuen Checklistenpunkt hinzu', () => expect(appendChecklistLine('Notiz')).toBe('Notiz\n☐ '))
})

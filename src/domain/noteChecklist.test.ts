import { describe, expect, it } from 'vitest'
import { appendChecklistLine, parseNoteLines, toggleChecklistLine, toggleChecklistSelection } from './noteChecklist'

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

  it('wandelt ohne Markierung die Cursorzeile um und erhält die Cursorposition im Text', () => {
    expect(toggleChecklistSelection('Notiz', 2, 2)).toEqual({ value:'☐ Notiz', selectionStart:4, selectionEnd:4 })
    expect(toggleChecklistSelection('Milch\nPaket\nWerkzeug', 8, 8).value).toBe('Milch\n☐ Paket\nWerkzeug')
  })
  it('entfernt ohne Markierung auch abgehakte Checkboxen und erhält den Text', () => {
    expect(toggleChecklistSelection('☑ Paket', 4, 4)).toEqual({ value:'Paket', selectionStart:2, selectionEnd:2 })
    const next = toggleChecklistSelection('Paket', 2, 2)
    expect(toggleChecklistSelection(next.value, next.selectionStart, next.selectionEnd).value).toBe('Paket')
  })
  it('erzeugt einen neuen Punkt in einer leeren Cursorzeile', () => {
    expect(toggleChecklistSelection('', 0, 0)).toEqual({ value:'☐ ', selectionStart:2, selectionEnd:2 })
    expect(toggleChecklistSelection('Milch\n\nPaket', 6, 6).value).toBe('Milch\n☐ \nPaket')
    expect(toggleChecklistSelection('Milch\n', 6, 6).value).toBe('Milch\n☐ ')
  })
  it('behandelt den Cursor am Zeilenanfang und Zeilenende korrekt', () => {
    expect(toggleChecklistSelection('Milch\nPaket', 6, 6).value).toBe('Milch\n☐ Paket')
    expect(toggleChecklistSelection('Milch\nPaket', 5, 5).value).toBe('☐ Milch\nPaket')
    expect(toggleChecklistSelection('\nPaket', 0, 0).value).toBe('☐ \nPaket')
  })
  it('wandelt eine vollständig markierte Zeile um', () => {
    expect(toggleChecklistSelection('Milch kaufen', 0, 12).value).toBe('☐ Milch kaufen')
  })
  it('berücksichtigt bei einer Teilmarkierung die vollständige Zeile', () => {
    expect(toggleChecklistSelection('Milch kaufen\nPaket wegbringen\nWerkzeug bestellen', 16, 20).value).toBe('Milch kaufen\n☐ Paket wegbringen\nWerkzeug bestellen')
  })
  it('wandelt mehrere berührte Zeilen einzeln und in Reihenfolge um', () => {
    const value = 'Milch kaufen\nPaket wegbringen\nWerkzeug bestellen'
    expect(toggleChecklistSelection(value, 4, value.length - 3).value).toBe('☐ Milch kaufen\n☐ Paket wegbringen\n☐ Werkzeug bestellen')
  })
  it('nimmt die nächste Zeile bei einem exklusiven Auswahlende nicht mit', () => {
    expect(toggleChecklistSelection('Milch\nPaket', 0, 6).value).toBe('☐ Milch\nPaket')
  })
  it('entfernt Checkboxen einer reinen Checklistenauswahl', () => {
    const value = '☐ Milch\n☑ Paket'
    expect(toggleChecklistSelection(value, 0, value.length).value).toBe('Milch\nPaket')
  })
  it('bringt gemischte Zeilen in den Checklisten-Zustand ohne doppelte Marker', () => {
    const value = 'Milch\n☑ Paket\n☐ Werkzeug'
    const next = toggleChecklistSelection(value, 0, value.length)
    expect(next.value).toBe('☐ Milch\n☑ Paket\n☐ Werkzeug')
    expect(parseNoteLines(next.value)[1]).toEqual({ text:'Paket', checked:true })
  })
  it('lässt leere Zeilen und Leerraum unverändert', () => {
    const value = '\nMilch\n   \n\nPaket\n'
    expect(toggleChecklistSelection(value, 0, value.length).value).toBe('\n☐ Milch\n   \n\n☐ Paket\n')
    expect(toggleChecklistSelection('  \n', 0, 3).value).toBe('  \n')
  })
  it('erhält Leerraum und Checkbox-Status außerhalb der Auswahl', () => {
    expect(toggleChecklistSelection('☑ Fertig\n  Milch  \n☐ Später', 12, 15).value).toBe('☑ Fertig\n☐   Milch  \n☐ Später')
  })
  it('erlaubt das erneute Umschalten mit der zurückgegebenen Auswahl', () => {
    const original = 'Milch\nPaket'
    const next = toggleChecklistSelection(original, 0, original.length)
    expect(toggleChecklistSelection(next.value, next.selectionStart, next.selectionEnd).value).toBe(original)
  })
  it('erhält den Text beim Abhaken eines umgewandelten Eintrags', () => {
    const next = toggleChecklistSelection('Milch\nPaket', 0, 11).value
    expect(toggleChecklistLine(next, 1)).toBe('☐ Milch\n☑ Paket')
  })
})

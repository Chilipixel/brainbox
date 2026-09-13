import { describe, expect, it } from 'vitest'
import type { SyncCategory, SyncEnvelope, SyncTask } from './types'
import { mergeEnvelopes } from './merge'
import { parseSyncEnvelope } from './validation'
import { SyncDataError } from './types'

const date = (minute: number) => `2026-01-01T12:${String(minute).padStart(2, '0')}:00.000Z`
const task = (id: string, minute: number, device = 'device-a', extra: Partial<SyncTask> = {}): SyncTask => ({
  id, title: id, categoryId: 'category', urgency: 'normal', duration: 'short', status: 'open',
  createdAt: date(0), updatedAt: date(minute), sourceDeviceId: device, ...extra
})
const category = (id: string, minute: number, device = 'device-a', extra: Partial<SyncCategory> = {}): SyncCategory => ({
  id, name: id, icon: '◌', color: '#000000', sortOrder: 0, createdAt: date(0), updatedAt: date(minute), sourceDeviceId: device, ...extra
})
const envelope = (tasks: SyncTask[] = [], categories: SyncCategory[] = [], device = 'device-a'): SyncEnvelope => ({
  schemaVersion: 1, syncFormatVersion: 1, updatedAt: date(30), sourceDeviceId: device, tasks, categories,
  settings: { userName: 'Alex', updatedAt: date(0), sourceDeviceId: device }
})

describe('sicherer Cloud-Merge', () => {
  it('übernimmt eine lokale Aufgabe bei leerer Cloud', () => expect(mergeEnvelopes(envelope([task('local', 1)]), envelope([], [], 'cloud')).tasks.map((item) => item.id)).toEqual(['local']))
  it('übernimmt eine Cloud-Aufgabe bei leerer lokaler DB', () => expect(mergeEnvelopes(envelope([]), envelope([task('cloud', 1)], [], 'cloud')).tasks.map((item) => item.id)).toEqual(['cloud']))
  it('behält bei gleicher ID die neuere lokale Aufgabe', () => expect(mergeEnvelopes(envelope([task('same', 5, 'local', { title: 'neu lokal' })]), envelope([task('same', 2, 'cloud')], [], 'cloud')).tasks[0].title).toBe('neu lokal'))
  it('übernimmt bei gleicher ID die neuere Cloud-Aufgabe', () => expect(mergeEnvelopes(envelope([task('same', 2)]), envelope([task('same', 5, 'cloud', { title: 'neu cloud' })], [], 'cloud')).tasks[0].title).toBe('neu cloud'))
  it('lässt eine lokale Löschung gegen einen alten Cloud-Eintrag gewinnen', () => expect(mergeEnvelopes(envelope([task('same', 6, 'local', { deletedAt: date(6) })]), envelope([task('same', 2, 'cloud')], [], 'cloud')).tasks[0].deletedAt).toBe(date(6)))
  it('lässt eine Cloud-Löschung gegen einen alten lokalen Eintrag gewinnen', () => expect(mergeEnvelopes(envelope([task('same', 2)]), envelope([task('same', 7, 'cloud', { deletedAt: date(7) })], [], 'cloud')).tasks[0].deletedAt).toBe(date(7)))
  it('vereinigt unterschiedliche neue Aufgaben beider Geräte', () => expect(mergeEnvelopes(envelope([task('a', 1)]), envelope([task('b', 1)], [], 'cloud')).tasks.map((item) => item.id)).toEqual(['a', 'b']))
  it('vereinigt unterschiedliche Kategorien samt Reihenfolge', () => expect(mergeEnvelopes(envelope([], [category('a', 1)]), envelope([], [category('b', 1, 'cloud', { sortOrder: 1 })], 'cloud')).categories.map((item) => item.id)).toEqual(['a', 'b']))
  it('erzeugt bei wiederholtem Sync keine Duplikate', () => { const first = mergeEnvelopes(envelope([task('a', 1)]), envelope([task('a', 1)])); expect(mergeEnvelopes(first, first).tasks).toHaveLength(1) })
  it('entscheidet identische Zeitstempel deterministisch per Device-ID', () => expect(mergeEnvelopes(envelope([task('same', 1, 'a')]), envelope([task('same', 1, 'z', { title: 'z gewinnt' })], [], 'z')).tasks[0].title).toBe('z gewinnt'))
  it('bevorzugt bei exakt gleichem Änderungszeitpunkt die Löschung', () => expect(mergeEnvelopes(envelope([task('same', 1, 'z')]), envelope([task('same', 1, 'a', { deletedAt: date(1) })], [], 'a')).tasks[0].deletedAt).toBe(date(1)))
})

describe('Cloud-Validierung und Migration', () => {
  it('weist eine ungültige Cloud-Datei zurück', () => expect(() => parseSyncEnvelope({ schemaVersion: 1 })).toThrow(SyncDataError))
  it('migriert die ältere Schema-Version 0 und ergänzt alte Metadaten', () => {
    const oldTask = { ...task('legacy', 1) } as Record<string, unknown>; delete oldTask.sourceDeviceId
    const old = { ...envelope([oldTask as unknown as SyncTask]), schemaVersion: 0 }; delete (old as Partial<SyncEnvelope>).syncFormatVersion
    expect(parseSyncEnvelope(old).tasks[0].sourceDeviceId).toBe('device-a')
  })
  it('überschreibt keine unbekannte neuere Schema-Version', () => expect(() => parseSyncEnvelope({ ...envelope(), schemaVersion: 2 })).toThrow('neueren App-Version'))
})

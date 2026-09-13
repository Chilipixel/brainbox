import { describe, expect, it } from 'vitest'
import { MemorySyncProvider } from './MemorySyncProvider'
import { SyncEngine, type SyncStorage } from './SyncEngine'
import { SyncApiError, type SyncEnvelope } from './types'

const base = (ids: string[] = []): SyncEnvelope => ({
  schemaVersion: 1, syncFormatVersion: 1, updatedAt: '2026-01-01T00:00:00.000Z', sourceDeviceId: 'local',
  tasks: ids.map((id) => ({ id, title: id, categoryId: 'c', urgency: 'normal', duration: 'short', status: 'open', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:01:00.000Z', sourceDeviceId: 'local' })),
  categories: [], settings: { updatedAt: '1970-01-01T00:00:00.000Z', sourceDeviceId: 'local' }
})

function storage(initial: SyncEnvelope) {
  let value = structuredClone(initial)
  const adapter: SyncStorage = { snapshot: async () => structuredClone(value), apply: async (next) => { value = structuredClone(next) } }
  return { adapter, get: () => value, set: (next: SyncEnvelope) => { value = next } }
}

describe('SyncEngine', () => {
  it('holt Offline-Änderungen beim nächsten erfolgreichen Sync nach', async () => {
    const local = storage(base(['offline']))
    const provider = new MemorySyncProvider(); provider.authorized = true; provider.error = new SyncApiError('offline', undefined, true)
    const engine = new SyncEngine(provider, local.adapter); engine.markLocalChange()
    await expect(engine.sync()).rejects.toThrow('offline')
    provider.error = undefined
    await engine.sync()
    expect(provider.envelope?.tasks[0].id).toBe('offline')
  })

  it('erhält eine Änderung, die während eines laufenden Syncs erfolgt', async () => {
    const local = storage(base(['first']))
    let release!: () => void
    const gate = new Promise<void>((resolve) => { release = resolve })
    class DelayedProvider extends MemorySyncProvider { override async read() { await gate; return super.read() } }
    const provider = new DelayedProvider(); provider.authorized = true
    const engine = new SyncEngine(provider, local.adapter)
    const syncing = engine.sync()
    local.set(base(['first', 'during'])); engine.markLocalChange(); release()
    await syncing
    expect(provider.envelope?.tasks.map((item) => item.id)).toEqual(['first', 'during'])
    expect(provider.reads).toBe(2)
  })

  it('gibt Auth-Fehler weiter, ohne lokale Daten anzutasten', async () => {
    const local = storage(base(['safe']))
    const provider = new MemorySyncProvider(); provider.error = new SyncApiError('Anmeldung erforderlich.', 401)
    await expect(new SyncEngine(provider, local.adapter).sync()).rejects.toMatchObject({ status: 401 })
    expect(local.get().tasks[0].id).toBe('safe')
  })

  it('gibt API-Fehler weiter, ohne lokale Daten anzutasten', async () => {
    const local = storage(base(['safe']))
    const provider = new MemorySyncProvider(); provider.error = new SyncApiError('Drive nicht erreichbar', 503, true)
    await expect(new SyncEngine(provider, local.adapter).sync()).rejects.toThrow('Drive nicht erreichbar')
    expect(local.get().tasks[0].id).toBe('safe')
  })
})

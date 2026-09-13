import { mergeEnvelopes } from './merge'
import type { SyncEnvelope, SyncProvider, SyncResult } from './types'

export interface SyncStorage {
  snapshot(): Promise<SyncEnvelope>
  apply(envelope: SyncEnvelope): Promise<void>
}

export class SyncEngine {
  private revision = 0
  private running?: Promise<SyncResult>

  constructor(private readonly provider: SyncProvider, private readonly storage: SyncStorage) {}

  markLocalChange() { this.revision += 1 }

  sync(): Promise<SyncResult> {
    if (this.running) return this.running
    this.running = this.run().finally(() => { this.running = undefined })
    return this.running
  }

  private async run(): Promise<SyncResult> {
    let changed = false
    while (true) {
      const revisionAtStart = this.revision
      const local = await this.storage.snapshot()
      const cloud = await this.provider.read()
      const merged = mergeEnvelopes(local, cloud.envelope)

      // A local save completed while Drive was loading. Snapshot again instead of
      // applying a merge that did not contain that save.
      if (revisionAtStart !== this.revision) continue
      await this.storage.apply(merged)
      await this.provider.write(merged, cloud.fileId)
      changed = true
      if (revisionAtStart === this.revision) return { ok: true, changed, lastSyncedAt: merged.updatedAt }
    }
  }
}

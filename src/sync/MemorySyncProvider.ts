import { parseSyncEnvelope } from './validation'
import type { ProviderSnapshot, SyncEnvelope, SyncProvider } from './types'

export class MemorySyncProvider implements SyncProvider {
  authorized = false
  envelope?: SyncEnvelope
  reads = 0
  writes = 0
  error?: Error

  constructor(initial?: SyncEnvelope) { this.envelope = initial ? structuredClone(initial) : undefined }
  async connect() { this.authorized = true }
  async disconnect() { this.authorized = false }
  isAuthorized() { return this.authorized }
  async read(): Promise<ProviderSnapshot> {
    this.reads += 1
    if (this.error) throw this.error
    return this.envelope ? { fileId: 'memory-file', envelope: parseSyncEnvelope(structuredClone(this.envelope)) } : {}
  }
  async write(envelope: SyncEnvelope): Promise<string> {
    this.writes += 1
    if (this.error) throw this.error
    this.envelope = structuredClone(envelope)
    return 'memory-file'
  }
}

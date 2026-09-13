import type { Category, Task } from '../types/models'

export const SYNC_SCHEMA_VERSION = 1
export const SYNC_FORMAT_VERSION = 1

export type SyncState = 'disconnected' | 'connecting' | 'syncing' | 'synced' | 'offline' | 'needs-auth' | 'error'

export interface SyncRecordMeta {
  id: string
  createdAt: string
  updatedAt: string
  sourceDeviceId: string
  deletedAt?: string
}

export type SyncTask = Partial<Task> & SyncRecordMeta
export type SyncCategory = Partial<Category> & SyncRecordMeta

export interface SyncedSettings {
  userName?: string
  updatedAt: string
  sourceDeviceId: string
}

export interface SyncEnvelope {
  schemaVersion: number
  syncFormatVersion: number
  updatedAt: string
  sourceDeviceId: string
  tasks: SyncTask[]
  categories: SyncCategory[]
  settings: SyncedSettings
}

export interface SyncStatus {
  state: SyncState
  connected: boolean
  lastSyncedAt?: string
  message?: string
  pending: boolean
}

export interface ProviderSnapshot {
  fileId?: string
  envelope?: SyncEnvelope
}

export interface SyncProvider {
  connect(): Promise<void>
  disconnect(): Promise<void>
  read(): Promise<ProviderSnapshot>
  write(envelope: SyncEnvelope, fileId?: string): Promise<string>
  isAuthorized(): boolean
}

export interface SyncResult {
  ok: boolean
  changed: boolean
  lastSyncedAt?: string
}

export class SyncDataError extends Error {
  constructor(message: string, public readonly code: 'invalid' | 'newer-schema') {
    super(message)
    this.name = 'SyncDataError'
  }
}

export class SyncApiError extends Error {
  constructor(message: string, public readonly status?: number, public readonly retryable = false) {
    super(message)
    this.name = 'SyncApiError'
  }
}

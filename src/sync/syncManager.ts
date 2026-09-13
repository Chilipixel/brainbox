import { GoogleDriveSyncProvider } from './GoogleDriveSyncProvider'
import { googleAuthService } from './GoogleAuthService'
import { applyMergedEnvelope, createLocalEnvelope } from './localSyncStore'
import { SyncEngine } from './SyncEngine'
import type { SyncStatus } from './types'
import { SyncApiError } from './types'

const LAST_SYNC_KEY = 'brainbox-sync-last-success'
const PENDING_KEY = 'brainbox-sync-pending'
type Listener = () => void

export class BrowserSyncManager {
  private readonly provider = new GoogleDriveSyncProvider()
  private readonly engine = new SyncEngine(this.provider, { snapshot: createLocalEnvelope, apply: applyMergedEnvelope })
  private listeners = new Set<Listener>()
  private debounceTimer?: number
  private retryTimer?: number
  private retryAttempt = 0
  private initialized = false
  private status: SyncStatus = {
    state: googleAuthService.isConnected() ? 'needs-auth' : 'disconnected',
    connected: googleAuthService.isConnected(),
    lastSyncedAt: localStorage.getItem(LAST_SYNC_KEY) || undefined,
    pending: localStorage.getItem(PENDING_KEY) === 'true'
  }

  getSnapshot = () => this.status
  subscribe = (listener: Listener) => { this.listeners.add(listener); return () => this.listeners.delete(listener) }
  private update(next: Partial<SyncStatus>) { this.status = { ...this.status, ...next }; this.listeners.forEach((listener) => listener()) }

  initialize() {
    if (this.initialized) return
    this.initialized = true
    void googleAuthService.initialize().catch(() => this.update({ state: 'error', message: 'Google-Anmeldung konnte nicht geladen werden.' }))
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)
    document.addEventListener('visibilitychange', this.handleVisibility)
    if (this.status.connected && this.provider.isAuthorized()) void this.syncNow()
  }

  private handleOnline = () => { if (this.status.connected && this.provider.isAuthorized()) void this.syncNow() }
  private handleOffline = () => { if (this.status.connected) this.update({ state: 'offline', message: undefined, pending: true }) }
  private handleVisibility = () => { if (document.visibilityState === 'visible' && this.status.connected && this.provider.isAuthorized() && this.status.pending) void this.syncNow() }

  async connect() {
    this.update({ state: 'connecting', connected: true, message: undefined })
    try {
      await this.provider.connect()
      this.update({ connected: true, state: 'syncing', pending: true })
      localStorage.setItem(PENDING_KEY, 'true')
      await this.syncNow()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google-Anmeldung wurde nicht abgeschlossen.'
      this.update({ connected: googleAuthService.isConnected(), state: googleAuthService.isConnected() ? 'needs-auth' : 'error', message })
      throw error
    }
  }

  async disconnect() {
    window.clearTimeout(this.debounceTimer); window.clearTimeout(this.retryTimer)
    await this.provider.disconnect()
    localStorage.removeItem(PENDING_KEY)
    this.update({ state: 'disconnected', connected: false, pending: false, message: undefined })
  }

  markLocalChange() {
    this.engine.markLocalChange()
    localStorage.setItem(PENDING_KEY, 'true')
    this.update({ pending: true, ...(this.status.connected && !navigator.onLine ? { state: 'offline' as const } : {}) })
    if (!this.status.connected || !this.provider.isAuthorized() || !navigator.onLine) return
    window.clearTimeout(this.debounceTimer)
    this.debounceTimer = window.setTimeout(() => void this.syncNow(), 4000)
  }

  async syncNow() {
    if (!this.status.connected) return
    if (!navigator.onLine) { this.update({ state: 'offline', pending: true, message: undefined }); return }
    if (!this.provider.isAuthorized()) {
      this.update({ state: 'needs-auth', pending: true, message: 'Bitte melde dich erneut bei Google an.' })
      return
    }
    this.update({ state: 'syncing', message: undefined })
    try {
      const result = await this.engine.sync()
      const lastSyncedAt = result.lastSyncedAt || new Date().toISOString()
      localStorage.setItem(LAST_SYNC_KEY, lastSyncedAt); localStorage.removeItem(PENDING_KEY)
      this.retryAttempt = 0
      this.update({ state: 'synced', connected: true, lastSyncedAt, pending: false, message: undefined })
    } catch (error) {
      if (error instanceof SyncApiError && error.status === 401) this.update({ state: 'needs-auth', pending: true, message: 'Bitte melde dich erneut bei Google an.' })
      else if (!navigator.onLine) this.update({ state: 'offline', pending: true, message: undefined })
      else {
        this.update({ state: 'error', pending: true, message: error instanceof Error ? error.message : 'Synchronisierung fehlgeschlagen.' })
        if (error instanceof SyncApiError && error.retryable) this.scheduleRetry()
      }
    }
  }

  private scheduleRetry() {
    window.clearTimeout(this.retryTimer)
    const delay = Math.min(5 * 60_000, 2_000 * 2 ** this.retryAttempt++)
    this.retryTimer = window.setTimeout(() => void this.syncNow(), delay)
  }
}

export const syncManager = new BrowserSyncManager()

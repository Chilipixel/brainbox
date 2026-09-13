import { useEffect, useSyncExternalStore } from 'react'
import { syncManager } from '../sync/syncManager'

export function useSync() {
  useEffect(() => syncManager.initialize(), [])
  const status = useSyncExternalStore(syncManager.subscribe, syncManager.getSnapshot)
  return {
    status,
    configured: Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()),
    connect: () => syncManager.connect(),
    disconnect: () => syncManager.disconnect(),
    syncNow: () => syncManager.syncNow()
  }
}

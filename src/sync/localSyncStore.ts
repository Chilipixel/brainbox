import { db } from '../repositories/localDatabase'
import type { Category, SyncTombstone, Task } from '../types/models'
import type { SyncCategory, SyncEnvelope, SyncTask, SyncedSettings } from './types'
import { SYNC_FORMAT_VERSION, SYNC_SCHEMA_VERSION } from './types'

const DEVICE_ID_KEY = 'brainbox-sync-device-id'
const USER_NAME_UPDATED_KEY = 'brainbox-sync-user-name-updated-at'
const USER_NAME_DEVICE_KEY = 'brainbox-sync-user-name-device-id'
export const SETTINGS_CHANGED_EVENT = 'brainbox-settings-changed'

export function getDeviceId(): string {
  const stored = localStorage.getItem(DEVICE_ID_KEY)
  if (stored) return stored
  const id = crypto.randomUUID()
  localStorage.setItem(DEVICE_ID_KEY, id)
  return id
}

export function touchSyncedUserName(userName: string) {
  const now = new Date().toISOString()
  localStorage.setItem('user-name', userName)
  localStorage.setItem(USER_NAME_UPDATED_KEY, now)
  localStorage.setItem(USER_NAME_DEVICE_KEY, getDeviceId())
  window.dispatchEvent(new Event(SETTINGS_CHANGED_EVENT))
}

function localSettings(): SyncedSettings {
  const deviceId = getDeviceId()
  const userName = localStorage.getItem('user-name')?.trim() || undefined
  let updatedAt = localStorage.getItem(USER_NAME_UPDATED_KEY)
  if (!updatedAt) {
    updatedAt = userName ? new Date().toISOString() : new Date(0).toISOString()
    localStorage.setItem(USER_NAME_UPDATED_KEY, updatedAt)
    localStorage.setItem(USER_NAME_DEVICE_KEY, deviceId)
  }
  return { userName, updatedAt, sourceDeviceId: localStorage.getItem(USER_NAME_DEVICE_KEY) || deviceId }
}

function taskRecord(task: Task, deviceId: string): SyncTask {
  return { ...task, sourceDeviceId: task.sourceDeviceId || deviceId }
}

function categoryRecord(category: Category, deviceId: string): SyncCategory {
  return { ...category, updatedAt: category.updatedAt || category.createdAt, sourceDeviceId: category.sourceDeviceId || deviceId }
}

function tombstoneRecord(tombstone: SyncTombstone): SyncTask | SyncCategory {
  return { id: tombstone.id, createdAt: tombstone.createdAt, updatedAt: tombstone.updatedAt, deletedAt: tombstone.deletedAt, sourceDeviceId: tombstone.sourceDeviceId }
}

export async function createLocalEnvelope(now = new Date().toISOString()): Promise<SyncEnvelope> {
  const deviceId = getDeviceId()
  const [tasks, categories, tombstones] = await Promise.all([db.tasks.toArray(), db.categories.toArray(), db.syncTombstones.toArray()])
  return {
    schemaVersion: SYNC_SCHEMA_VERSION,
    syncFormatVersion: SYNC_FORMAT_VERSION,
    updatedAt: now,
    sourceDeviceId: deviceId,
    tasks: [...tasks.map((task) => taskRecord(task, deviceId)), ...tombstones.filter((item) => item.entityType === 'task').map(tombstoneRecord)],
    categories: [...categories.map((category) => categoryRecord(category, deviceId)), ...tombstones.filter((item) => item.entityType === 'category').map(tombstoneRecord)],
    settings: localSettings()
  }
}

export async function applyMergedEnvelope(envelope: SyncEnvelope): Promise<void> {
  const activeTasks = envelope.tasks.filter((task) => !task.deletedAt) as Task[]
  const activeCategories = envelope.categories.filter((category) => !category.deletedAt) as Category[]
  const tombstones: SyncTombstone[] = [
    ...envelope.tasks.filter((task) => task.deletedAt).map((task) => ({ key: `task:${task.id}`, entityType: 'task' as const, id: task.id, createdAt: task.createdAt, updatedAt: task.updatedAt, deletedAt: task.deletedAt!, sourceDeviceId: task.sourceDeviceId })),
    ...envelope.categories.filter((category) => category.deletedAt).map((category) => ({ key: `category:${category.id}`, entityType: 'category' as const, id: category.id, createdAt: category.createdAt, updatedAt: category.updatedAt, deletedAt: category.deletedAt!, sourceDeviceId: category.sourceDeviceId }))
  ]

  await db.transaction('rw', db.tasks, db.categories, db.syncTombstones, async () => {
    await Promise.all([db.tasks.clear(), db.categories.clear(), db.syncTombstones.clear()])
    await db.categories.bulkPut(activeCategories)
    await db.tasks.bulkPut(activeTasks)
    await db.syncTombstones.bulkPut(tombstones)
  })

  const current = localSettings()
  if (envelope.settings.updatedAt !== current.updatedAt || envelope.settings.sourceDeviceId !== current.sourceDeviceId) {
    if (envelope.settings.userName) localStorage.setItem('user-name', envelope.settings.userName)
    else localStorage.removeItem('user-name')
    localStorage.setItem(USER_NAME_UPDATED_KEY, envelope.settings.updatedAt)
    localStorage.setItem(USER_NAME_DEVICE_KEY, envelope.settings.sourceDeviceId)
    window.dispatchEvent(new Event(SETTINGS_CHANGED_EVENT))
  }
}

export async function recordDeletion(entityType: SyncTombstone['entityType'], entity: { id: string, createdAt: string }) {
  const now = new Date().toISOString()
  await db.syncTombstones.put({ key: `${entityType}:${entity.id}`, entityType, id: entity.id, createdAt: entity.createdAt, updatedAt: now, deletedAt: now, sourceDeviceId: getDeviceId() })
}

import type { SyncCategory, SyncEnvelope, SyncRecordMeta, SyncTask, SyncedSettings } from './types'
import { SYNC_FORMAT_VERSION, SYNC_SCHEMA_VERSION } from './types'

function versionTime(record: SyncRecordMeta) {
  const updated = Date.parse(record.updatedAt)
  const deleted = record.deletedAt ? Date.parse(record.deletedAt) : Number.NEGATIVE_INFINITY
  return Math.max(updated, deleted)
}

export function newerRecord<T extends SyncRecordMeta>(left: T, right: T): T {
  const delta = versionTime(left) - versionTime(right)
  if (delta !== 0) return delta > 0 ? left : right
  if (Boolean(left.deletedAt) !== Boolean(right.deletedAt)) return left.deletedAt ? left : right
  if (left.sourceDeviceId !== right.sourceDeviceId) return left.sourceDeviceId > right.sourceDeviceId ? left : right
  return JSON.stringify(left) >= JSON.stringify(right) ? left : right
}

export function mergeRecords<T extends SyncRecordMeta>(local: T[], cloud: T[]): T[] {
  const merged = new Map<string, T>()
  for (const record of [...local, ...cloud]) {
    const current = merged.get(record.id)
    merged.set(record.id, current ? newerRecord(current, record) : record)
  }
  return [...merged.values()].sort((a, b) => a.id.localeCompare(b.id))
}

function mergeSettings(local: SyncedSettings, cloud: SyncedSettings): SyncedSettings {
  const delta = Date.parse(local.updatedAt) - Date.parse(cloud.updatedAt)
  if (delta !== 0) return delta > 0 ? local : cloud
  return local.sourceDeviceId >= cloud.sourceDeviceId ? local : cloud
}

export function mergeEnvelopes(local: SyncEnvelope, cloud?: SyncEnvelope, now = new Date().toISOString()): SyncEnvelope {
  if (!cloud) return { ...local, updatedAt: now }
  return {
    schemaVersion: SYNC_SCHEMA_VERSION,
    syncFormatVersion: SYNC_FORMAT_VERSION,
    updatedAt: now,
    sourceDeviceId: local.sourceDeviceId,
    tasks: mergeRecords<SyncTask>(local.tasks, cloud.tasks),
    categories: mergeRecords<SyncCategory>(local.categories, cloud.categories),
    settings: mergeSettings(local.settings, cloud.settings)
  }
}

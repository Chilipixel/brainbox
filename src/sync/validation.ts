import type { SyncCategory, SyncEnvelope, SyncTask, SyncedSettings } from './types'
import { SYNC_SCHEMA_VERSION, SyncDataError } from './types'

const urgencies = ['urgent', 'normal', 'someday']
const durations = ['short', 'medium', 'long']
const statuses = ['open', 'completed']
const energyLevels = ['low', 'medium', 'high']
const isObject = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const isString = (value: unknown): value is string => typeof value === 'string'
const optionalString = (value: unknown) => value === undefined || isString(value)
const validDate = (value: unknown) => isString(value) && !Number.isNaN(Date.parse(value))

function validMeta(value: Record<string, unknown>) {
  return isString(value.id) && validDate(value.createdAt) && validDate(value.updatedAt)
    && isString(value.sourceDeviceId) && (value.deletedAt === undefined || validDate(value.deletedAt))
}

export function isSyncTask(value: unknown): value is SyncTask {
  if (!isObject(value) || !validMeta(value)) return false
  if (value.deletedAt !== undefined) return true
  return isString(value.title) && isString(value.categoryId) && urgencies.includes(String(value.urgency))
    && durations.includes(String(value.duration)) && statuses.includes(String(value.status))
    && optionalString(value.description) && optionalString(value.notes) && optionalString(value.dueDate)
    && optionalString(value.completedAt) && (value.estimatedMinutes === undefined || typeof value.estimatedMinutes === 'number')
    && (value.energyLevel === undefined || energyLevels.includes(String(value.energyLevel)))
}

export function isSyncCategory(value: unknown): value is SyncCategory {
  if (!isObject(value) || !validMeta(value)) return false
  if (value.deletedAt !== undefined) return true
  return isString(value.name) && isString(value.icon) && isString(value.color) && typeof value.sortOrder === 'number'
    && optionalString(value.emoji)
}

function isSettings(value: unknown): value is SyncedSettings {
  return isObject(value) && validDate(value.updatedAt) && isString(value.sourceDeviceId) && optionalString(value.userName)
}

/** Version 0 used the same entity arrays but had no explicit format version. */
function migrate(value: Record<string, unknown>): Record<string, unknown> {
  if (value.schemaVersion === 0) {
    const envelopeUpdatedAt = validDate(value.updatedAt) ? value.updatedAt : new Date(0).toISOString()
    const envelopeDeviceId = isString(value.sourceDeviceId) ? value.sourceDeviceId : 'legacy-cloud'
    const migrateRecord = (record: unknown) => isObject(record) ? {
      ...record,
      createdAt: validDate(record.createdAt) ? record.createdAt : envelopeUpdatedAt,
      updatedAt: validDate(record.updatedAt) ? record.updatedAt : (validDate(record.createdAt) ? record.createdAt : envelopeUpdatedAt),
      sourceDeviceId: isString(record.sourceDeviceId) ? record.sourceDeviceId : envelopeDeviceId
    } : record
    const settings = isObject(value.settings) ? {
      ...value.settings,
      updatedAt: validDate(value.settings.updatedAt) ? value.settings.updatedAt : envelopeUpdatedAt,
      sourceDeviceId: isString(value.settings.sourceDeviceId) ? value.settings.sourceDeviceId : envelopeDeviceId
    } : { updatedAt: envelopeUpdatedAt, sourceDeviceId: envelopeDeviceId }
    return { ...value, schemaVersion: 1, syncFormatVersion: 1, tasks: Array.isArray(value.tasks) ? value.tasks.map(migrateRecord) : value.tasks, categories: Array.isArray(value.categories) ? value.categories.map(migrateRecord) : value.categories, settings }
  }
  return value
}

export function parseSyncEnvelope(value: unknown): SyncEnvelope {
  if (!isObject(value)) throw new SyncDataError('Die Cloud-Datei enthält kein gültiges JSON-Objekt.', 'invalid')
  if ((typeof value.schemaVersion === 'number' && value.schemaVersion > SYNC_SCHEMA_VERSION)
    || (typeof value.syncFormatVersion === 'number' && value.syncFormatVersion > 1)) {
    throw new SyncDataError('Die Cloud-Daten wurden mit einer neueren App-Version erstellt.', 'newer-schema')
  }
  const migrated = migrate(value)
  if (migrated.schemaVersion !== 1 || migrated.syncFormatVersion !== 1 || !validDate(migrated.updatedAt)
    || !isString(migrated.sourceDeviceId) || !Array.isArray(migrated.tasks) || !Array.isArray(migrated.categories)
    || !migrated.tasks.every(isSyncTask) || !migrated.categories.every(isSyncCategory) || !isSettings(migrated.settings)) {
    throw new SyncDataError('Die Cloud-Datei ist ungültig oder unvollständig.', 'invalid')
  }
  return migrated as unknown as SyncEnvelope
}

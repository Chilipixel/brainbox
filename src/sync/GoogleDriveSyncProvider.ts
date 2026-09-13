import { googleAuthService, type GoogleAuthService } from './GoogleAuthService'
import { parseSyncEnvelope } from './validation'
import type { ProviderSnapshot, SyncEnvelope, SyncProvider } from './types'
import { SyncApiError, SyncDataError } from './types'

const API = 'https://www.googleapis.com/drive/v3'
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3'
const FILE_NAME = 'todo-sync.json'
const wait = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds))

export class GoogleDriveSyncProvider implements SyncProvider {
  constructor(private readonly auth: GoogleAuthService = googleAuthService) {}
  connect() { return this.auth.connect() }
  disconnect() { return this.auth.disconnect() }
  isAuthorized() { return this.auth.isAuthorized() }

  private async request(url: string, init: RequestInit = {}, attempts = 3): Promise<Response> {
    if (!navigator.onLine) throw new SyncApiError('Offline – Änderungen werden später synchronisiert.', undefined, true)
    const token = this.auth.getAccessToken()
    if (!token) throw new SyncApiError('Anmeldung erforderlich.', 401)
    let response: Response | undefined
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        response = await fetch(url, { ...init, headers: { ...init.headers, Authorization: `Bearer ${token}` } })
      } catch {
        if (attempt + 1 === attempts) throw new SyncApiError('Google Drive ist momentan nicht erreichbar.', undefined, true)
        await wait(500 * 2 ** attempt); continue
      }
      if (response.status === 401) { this.auth.invalidateToken(); throw new SyncApiError('Anmeldung erforderlich.', 401) }
      if (response.ok) return response
      const retryable = response.status === 429 || response.status >= 500
      if (!retryable || attempt + 1 === attempts) throw new SyncApiError(`Google Drive antwortete mit Fehler ${response.status}.`, response.status, retryable)
      await wait(500 * 2 ** attempt)
    }
    throw new SyncApiError('Google Drive ist momentan nicht erreichbar.', response?.status, true)
  }

  async read(): Promise<ProviderSnapshot> {
    const params = new URLSearchParams({ spaces: 'appDataFolder', q: `name='${FILE_NAME}' and trashed=false`, fields: 'files(id,name,modifiedTime)', orderBy: 'createdTime', pageSize: '10' })
    const list = await this.request(`${API}/files?${params}`)
    const listing = await list.json() as { files?: { id: string }[] }
    const fileId = listing.files?.[0]?.id
    if (!fileId) return {}
    const download = await this.request(`${API}/files/${encodeURIComponent(fileId)}?alt=media`)
    let value: unknown
    try { value = JSON.parse(await download.text()) } catch { throw new SyncDataError('Die Cloud-Datei enthält beschädigtes JSON.', 'invalid') }
    return { fileId, envelope: parseSyncEnvelope(value) }
  }

  async write(envelope: SyncEnvelope, fileId?: string): Promise<string> {
    const json = JSON.stringify(envelope)
    if (fileId) {
      await this.request(`${UPLOAD_API}/files/${encodeURIComponent(fileId)}?uploadType=media`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: json })
      return fileId
    }
    const boundary = `brainbox-${crypto.randomUUID()}`
    const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name: FILE_NAME, parents: ['appDataFolder'] })}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${json}\r\n--${boundary}--`
    const created = await this.request(`${UPLOAD_API}/files?uploadType=multipart&fields=id`, { method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body })
    const result = await created.json() as { id?: string }
    if (!result.id) throw new SyncApiError('Google Drive hat keine Datei-ID zurückgegeben.')
    return result.id
  }
}

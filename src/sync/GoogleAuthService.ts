const GIS_URL = 'https://accounts.google.com/gsi/client'
const DRIVE_APPDATA_SCOPE = 'https://www.googleapis.com/auth/drive.appdata'
const CONNECTED_KEY = 'brainbox-google-drive-connected'

export type GoogleAuthStatus = 'unconfigured' | 'disconnected' | 'connecting' | 'authorized' | 'needs-auth'

export class GoogleAuthService {
  private tokenClient?: GoogleTokenClient
  private accessToken?: string
  private expiresAt = 0
  private status: GoogleAuthStatus = 'disconnected'
  private loading?: Promise<void>

  get clientId() { return import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || '' }

  initialize(): Promise<void> {
    if (!this.clientId) { this.status = 'unconfigured'; return Promise.resolve() }
    if (this.tokenClient) return Promise.resolve()
    if (this.loading) return this.loading
    this.loading = new Promise<void>((resolve, reject) => {
      const setup = () => {
        if (!window.google) return reject(new Error('Google Identity Services konnte nicht geladen werden.'))
        this.tokenClient = window.google.accounts.oauth2.initTokenClient({ client_id: this.clientId, scope: DRIVE_APPDATA_SCOPE, callback: () => undefined })
        this.status = this.isConnected() ? 'needs-auth' : 'disconnected'
        resolve()
      }
      if (window.google) return setup()
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_URL}"]`)
      if (existing) { existing.addEventListener('load', setup, { once: true }); existing.addEventListener('error', () => reject(new Error('Google Identity Services konnte nicht geladen werden.')), { once: true }); return }
      const script = document.createElement('script')
      script.src = GIS_URL; script.async = true; script.defer = true
      script.onload = setup; script.onerror = () => reject(new Error('Google Identity Services konnte nicht geladen werden.'))
      document.head.appendChild(script)
    }).finally(() => { this.loading = undefined })
    return this.loading
  }

  async connect(): Promise<void> {
    this.status = 'connecting'
    await this.initialize()
    await this.requestAccessToken(true)
    localStorage.setItem(CONNECTED_KEY, 'true')
  }

  async requestAccessToken(interactive = false): Promise<string> {
    if (this.isAuthorized()) return this.accessToken!
    await this.initialize()
    if (!this.tokenClient) throw new Error('Google Drive ist noch nicht konfiguriert.')
    return new Promise<string>((resolve, reject) => {
      const client = this.tokenClient!
      client.callback = (response) => {
        if (response.error || !response.access_token) {
          this.status = this.isConnected() ? 'needs-auth' : 'disconnected'
          reject(new Error(response.error_description || 'Google-Anmeldung wurde nicht abgeschlossen.'))
          return
        }
        this.accessToken = response.access_token
        this.expiresAt = Date.now() + Math.max(0, (response.expires_in || 3600) - 60) * 1000
        this.status = 'authorized'
        localStorage.setItem(CONNECTED_KEY, 'true')
        resolve(response.access_token)
      }
      client.error_callback = () => { this.status = this.isConnected() ? 'needs-auth' : 'disconnected'; reject(new Error('Google-Anmeldung wurde abgebrochen.')) }
      client.requestAccessToken({ prompt: interactive ? 'consent' : '' })
    })
  }

  disconnect(): Promise<void> {
    const token = this.accessToken
    this.accessToken = undefined; this.expiresAt = 0; this.status = 'disconnected'
    localStorage.removeItem(CONNECTED_KEY)
    return new Promise((resolve) => {
      if (token && window.google) window.google.accounts.oauth2.revoke(token, resolve)
      else resolve()
    })
  }

  invalidateToken() { this.accessToken = undefined; this.expiresAt = 0; this.status = 'needs-auth' }
  getAccessToken() { return this.isAuthorized() ? this.accessToken : undefined }
  isAuthorized() { return Boolean(this.accessToken && Date.now() < this.expiresAt) }
  isConnected() { return localStorage.getItem(CONNECTED_KEY) === 'true' }
  getStatus() { return this.status }
}

export const googleAuthService = new GoogleAuthService()

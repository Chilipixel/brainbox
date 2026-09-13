import { Cloud, Download, LogOut, Moon, RefreshCcw, RotateCw, Sun, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { BrandMark } from '../components/BrandMark'
import { PageHeader } from '../components/PageHeader'
import { useAppData } from '../hooks/useAppData'
import { useSync } from '../hooks/useSync'
import { createBackup, validateBackup } from '../services/backup'
import { SETTINGS_CHANGED_EVENT, touchSyncedUserName } from '../sync/localSyncStore'
import { syncManager } from '../sync/syncManager'
import type { SyncStatus } from '../sync/types'

type Theme = 'system' | 'light' | 'dark'

export function SettingsPage() {
  const { tasks, categories, quickItems, importData } = useAppData()
  const input = useRef<HTMLInputElement>(null)
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system')
  const [name, setName] = useState(() => localStorage.getItem('user-name') ?? '')
  const [message, setMessage] = useState('')
  const sync = useSync()

  useEffect(() => {
    const refresh = () => setName(localStorage.getItem('user-name') ?? '')
    window.addEventListener(SETTINGS_CHANGED_EVENT, refresh)
    return () => window.removeEventListener(SETTINGS_CHANGED_EVENT, refresh)
  }, [])

  function applyTheme(next: Theme) { setTheme(next); localStorage.setItem('theme', next); document.documentElement.dataset.theme = next }
  function updateName(next: string) { setName(next); localStorage.setItem('user-name', next.trimStart()) }
  function commitName() { const trimmed = name.trim(); setName(trimmed); touchSyncedUserName(trimmed); syncManager.markLocalChange() }
  function exportData() {
    const blob = new Blob([JSON.stringify(createBackup(tasks, categories, quickItems), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `brainbox-backup-${new Date().toISOString().slice(0,10)}.json`; link.click(); URL.revokeObjectURL(url)
  }
  async function readImport(file?: File) {
    if (!file) return
    try {
      const value: unknown = JSON.parse(await file.text())
      if (!validateBackup(value)) throw new Error('Dieses Backup ist ungültig oder unvollständig.')
      if (!window.confirm('Aktuelle Daten durch dieses Backup ersetzen?')) return
      await importData(value.tasks, value.categories, value.quickItems); setMessage('Backup erfolgreich importiert.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Import fehlgeschlagen.') }
  }
  return <><PageHeader title="Einstellungen" back />
    <main className="page settings-page"><section><span className="eyebrow">Persönlich</span><h2>Wie darf Brainbox dich nennen?</h2><label className="name-field"><span>Dein Name</span><input value={name} onChange={(event) => updateName(event.target.value)} onBlur={commitName} maxLength={40} autoComplete="name" placeholder="z. B. Alex" /><small>{sync.status.connected ? 'Wird über Google Drive synchronisiert.' : 'Wird nur auf diesem Gerät gespeichert.'}</small></label></section>
      <section><span className="eyebrow">Darstellung</span><h2>Dein Modus</h2><div className="theme-options"><button className={theme === 'system' ? 'active' : ''} onClick={() => applyTheme('system')}><RefreshCcw />Automatisch</button><button className={theme === 'light' ? 'active' : ''} onClick={() => applyTheme('light')}><Sun />Hell</button><button className={theme === 'dark' ? 'active' : ''} onClick={() => applyTheme('dark')}><Moon />Dunkel</button></div></section>
      <SyncSection sync={sync} />
      <section><span className="eyebrow">Datensicherung</span><h2>Deine Daten bleiben bei dir</h2><p className="settings-copy">Aufgaben, Kategorien und die kurze Checkliste werden lokal auf diesem Gerät gespeichert. Ein Backup kannst du jederzeit mitnehmen.</p><div className="settings-actions"><button onClick={exportData}><Download />Daten exportieren<span>JSON-Backup herunterladen</span></button><button onClick={() => input.current?.click()}><Upload />Daten importieren<span>Backup wiederherstellen</span></button></div><input ref={input} hidden type="file" accept="application/json" onChange={(e) => readImport(e.target.files?.[0])} />{message && <p className="status-message" role="status">{message}</p>}</section>
      <section className="about-card"><BrandMark /><div><strong>Brainbox</strong><span>Version 1.1 · Local-first PWA</span></div></section>
    </main></>
}

function relativeTime(value?: string) {
  if (!value) return 'Noch nicht synchronisiert'
  const seconds = Math.max(0, Math.round((Date.now() - Date.parse(value)) / 1000))
  if (seconds < 45) return 'Gerade eben'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `vor ${minutes} ${minutes === 1 ? 'Minute' : 'Minuten'}`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `vor ${hours} ${hours === 1 ? 'Stunde' : 'Stunden'}`
  return new Date(value).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })
}

function syncLabel(status: SyncStatus) {
  if (status.state === 'connecting') return 'Google-Anmeldung wird geöffnet …'
  if (status.state === 'syncing') return 'Synchronisierung läuft …'
  if (status.state === 'offline') return 'Offline – Änderungen werden später synchronisiert'
  if (status.state === 'needs-auth') return 'Anmeldung erforderlich'
  if (status.state === 'error') return 'Synchronisierungsfehler'
  if (status.state === 'synced') return 'Synchronisiert'
  return 'Nicht verbunden'
}

function SyncSection({ sync }: { sync: ReturnType<typeof useSync> }) {
  const busy = sync.status.state === 'connecting' || sync.status.state === 'syncing'
  async function connect() { try { await sync.connect() } catch { /* Der Status zeigt den sicheren Fehlertext. */ } }
  async function disconnect() {
    if (window.confirm('Deine lokalen Aufgaben bleiben erhalten. Die Synchronisierung mit Google Drive wird beendet.')) await sync.disconnect()
  }
  return <section className="sync-section"><span className="eyebrow">Synchronisierung</span>
    <div className="sync-heading"><span className="sync-icon"><Cloud /></span><div><h2>Google Drive</h2>{sync.status.connected && <span className="connected-label"><i /> Verbunden</span>}</div></div>
    <p className="settings-copy">Synchronisiere deine Aufgaben zwischen deinen Geräten. Deine Aufgaben werden weiterhin lokal auf diesem Gerät gespeichert.</p>
    {!sync.configured ? <p className="sync-notice">Google Drive ist für diese Installation noch nicht konfiguriert. Trage zuerst eine Google-Client-ID ein.</p> : !sync.status.connected ? <><button className="primary-button sync-connect" disabled={busy} onClick={() => void connect()}><Cloud /> Mit Google Drive verbinden</button>{sync.status.message && <p className="sync-inline-error" role="status">{sync.status.message}</p>}</> : <>
      <div className={`sync-status sync-${sync.status.state}`} role="status"><i /><div><strong>{syncLabel(sync.status)}</strong><span>Zuletzt synchronisiert: {relativeTime(sync.status.lastSyncedAt)}</span>{sync.status.message && <small>{sync.status.message}</small>}</div></div>
      <div className="sync-actions">
        {sync.status.state === 'needs-auth' ? <button onClick={() => void connect()} disabled={busy}><Cloud /> Erneut anmelden</button> : <button onClick={() => void sync.syncNow()} disabled={busy || sync.status.state === 'offline'}><RotateCw /> Jetzt synchronisieren</button>}
        <button className="sync-disconnect" onClick={() => void disconnect()} disabled={busy}><LogOut /> Verbindung trennen</button>
      </div>
    </>}
  </section>
}

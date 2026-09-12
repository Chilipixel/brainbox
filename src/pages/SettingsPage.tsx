import { Download, Moon, RefreshCcw, Sun, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { createBackup, validateBackup } from '../services/backup'
import { useAppData } from '../hooks/useAppData'

type Theme = 'system' | 'light' | 'dark'

export function SettingsPage() {
  const { tasks, categories, importData } = useAppData()
  const input = useRef<HTMLInputElement>(null)
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system')
  const [message, setMessage] = useState('')
  function applyTheme(next: Theme) { setTheme(next); localStorage.setItem('theme', next); document.documentElement.dataset.theme = next }
  function exportData() {
    const blob = new Blob([JSON.stringify(createBackup(tasks, categories), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `sinnvoll-backup-${new Date().toISOString().slice(0,10)}.json`; link.click(); URL.revokeObjectURL(url)
  }
  async function readImport(file?: File) {
    if (!file) return
    try {
      const value: unknown = JSON.parse(await file.text())
      if (!validateBackup(value)) throw new Error('Dieses Backup ist ungültig oder unvollständig.')
      if (!window.confirm('Aktuelle Daten durch dieses Backup ersetzen?')) return
      await importData(value.tasks, value.categories); setMessage('Backup erfolgreich importiert.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Import fehlgeschlagen.') }
  }
  return <><PageHeader title="Einstellungen" back />
    <main className="page settings-page"><section><span className="eyebrow">Darstellung</span><h2>Dein Modus</h2><div className="theme-options"><button className={theme === 'system' ? 'active' : ''} onClick={() => applyTheme('system')}><RefreshCcw />Automatisch</button><button className={theme === 'light' ? 'active' : ''} onClick={() => applyTheme('light')}><Sun />Hell</button><button className={theme === 'dark' ? 'active' : ''} onClick={() => applyTheme('dark')}><Moon />Dunkel</button></div></section>
      <section><span className="eyebrow">Datensicherung</span><h2>Deine Daten bleiben bei dir</h2><p className="settings-copy">Aufgaben und Kategorien werden lokal auf diesem Gerät gespeichert. Ein Backup kannst du jederzeit mitnehmen.</p><div className="settings-actions"><button onClick={exportData}><Download />Daten exportieren<span>JSON-Backup herunterladen</span></button><button onClick={() => input.current?.click()}><Upload />Daten importieren<span>Backup wiederherstellen</span></button></div><input ref={input} hidden type="file" accept="application/json" onChange={(e) => readImport(e.target.files?.[0])} />{message && <p className="status-message" role="status">{message}</p>}</section>
      <section className="about-card"><div className="brand-mark">S</div><div><strong>Sinnvoll</strong><span>Version 1.0 · Local-first PWA</span></div></section>
    </main></>
}

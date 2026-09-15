import { Download, Moon, RefreshCcw, Sun, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { BrandMark } from '../components/BrandMark'
import { PageHeader } from '../components/PageHeader'
import { createBackup, validateBackup } from '../services/backup'
import { useAppData } from '../hooks/useAppData'
import { isConfettiEnabled, setConfettiEnabled } from '../services/confetti'

type Theme = 'system' | 'light' | 'dark'

export function SettingsPage() {
  const { tasks, categories, quickItems, importData } = useAppData()
  const input = useRef<HTMLInputElement>(null)
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system')
  const [name, setName] = useState(() => localStorage.getItem('user-name') ?? '')
  const [message, setMessage] = useState('')
  const [confettiEnabled, updateConfettiEnabled] = useState(isConfettiEnabled)
  function applyTheme(next: Theme) { setTheme(next); localStorage.setItem('theme', next); document.documentElement.dataset.theme = next }
  function updateName(next: string) { setName(next); localStorage.setItem('user-name', next.trimStart()) }
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
    <main className="page settings-page"><section><span className="eyebrow">Persönlich</span><h2>Wie darf Brainbox dich nennen?</h2><label className="name-field"><span>Dein Name</span><input value={name} onChange={(event) => updateName(event.target.value)} onBlur={() => { const trimmed = name.trim(); setName(trimmed); localStorage.setItem('user-name', trimmed) }} maxLength={40} autoComplete="name" placeholder="z. B. Alex" /><small>Wird nur auf diesem Gerät gespeichert.</small></label></section>
      <section><span className="eyebrow">Darstellung</span><h2>Dein Modus</h2><div className="theme-options"><button className={theme === 'system' ? 'active' : ''} onClick={() => applyTheme('system')}><RefreshCcw />Automatisch</button><button className={theme === 'light' ? 'active' : ''} onClick={() => applyTheme('light')}><Sun />Hell</button><button className={theme === 'dark' ? 'active' : ''} onClick={() => applyTheme('dark')}><Moon />Dunkel</button></div></section>
      <section><span className="eyebrow">Datensicherung</span><h2>Deine Daten bleiben bei dir</h2><p className="settings-copy">Aufgaben, Kategorien und die kurze Checkliste werden lokal auf diesem Gerät gespeichert. Ein Backup kannst du jederzeit mitnehmen.</p><div className="settings-actions"><button onClick={exportData}><Download />Daten exportieren<span>JSON-Backup herunterladen</span></button><button onClick={() => input.current?.click()}><Upload />Daten importieren<span>Backup wiederherstellen</span></button></div><input ref={input} hidden type="file" accept="application/json" onChange={(e) => readImport(e.target.files?.[0])} />{message && <p className="status-message" role="status">{message}</p>}</section>
      <section><span className="eyebrow">Kleine Erfolge</span><h2>Konfetti</h2><label className="confetti-setting"><span>Konfetti beim Abschließen einer Aufgabe</span><input type="checkbox" role="switch" checked={confettiEnabled} aria-describedby="confetti-setting-help" onChange={(event) => { const enabled = event.target.checked; setConfettiEnabled(enabled); updateConfettiEnabled(enabled) }} /></label><p id="confetti-setting-help" className="settings-copy confetti-setting-help">Wird auf diesem Gerät gespeichert. Bei reduzierter Bewegung bleibt Konfetti immer aus.</p></section>
      <section className="about-card"><BrandMark /><div><strong>Brainbox</strong><span>Version 1.1 · Local-first PWA</span></div></section>
    </main></>
}

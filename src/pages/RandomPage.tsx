import { Clock3, Shuffle, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { formatDuration, urgencyLabels } from '../domain/labels'
import { getRandomTask, type RandomMode } from '../domain/recommendations'
import { useAppData } from '../hooks/useAppData'
import type { Task } from '../types/models'

export function RandomPage() {
  const { tasks, categories } = useAppData()
  const navigate = useNavigate()
  const location = useLocation()
  const initialMode = (location.state as { mode?: RandomMode } | null)?.mode ?? 'any'
  const [minutes, setMinutes] = useState(30)
  const [mode, setMode] = useState<RandomMode>(initialMode)
  const [result, setResult] = useState<Task | undefined>()
  const [searched, setSearched] = useState(false)
  const roll = () => { setResult(getRandomTask(tasks, minutes, mode, result?.id)); setSearched(true) }
  const category = categories.find((item) => item.id === result?.categoryId)

  return <><PageHeader title="Zufall" />
    <main className="page random-page"><div className="random-intro"><div className="random-symbol"><Shuffle /></div><span className="eyebrow">Entscheidungshilfe</span><h2>Was soll ich machen?</h2><p>Lass dich von einer Aufgabe inspirieren, die gerade in deinen Tag passt.</p></div>
      {!searched ? <div className="random-controls">
        <fieldset><legend>Wie viel Zeit hast du?</legend><div className="segment-grid">{[[5,'5 Min.'],[15,'15 Min.'],[30,'30 Min.'],[60,'1 Std.+']].map(([value, label]) => <button type="button" key={value} className={minutes === value ? 'active' : ''} onClick={() => setMinutes(Number(value))}><Clock3 />{label}</button>)}</div></fieldset>
        <fieldset><legend>Was für eine Aufgabe?</legend><div className="mode-grid">{([['any','Egal','Alles, was passt'],['important','Wichtig','Prioritäten zuerst'],['boredom','Langeweile','Ideen ohne Druck']] as const).map(([value, label, text]) => <button type="button" key={value} className={mode === value ? 'active' : ''} onClick={() => setMode(value)}><strong>{label}</strong><small>{text}</small></button>)}</div></fieldset>
        <button className="primary-button random-action" onClick={roll}><Sparkles /> Zufällige Aufgabe anzeigen</button>
      </div> : result ? <section className="result-wrap"><span className="eyebrow">Deine Aufgabe</span><div className={`result-card urgency-${result.urgency}`}><span className="result-icon" style={{ background: `${category?.color}20` }}>{category?.icon}</span><h2>{result.title}</h2><div className="result-meta"><span>{category?.name}</span><span>{urgencyLabels[result.urgency]}</span><span>{formatDuration(result.duration, result.estimatedMinutes)}</span></div>{result.description && <p>{result.description}</p>}<button className="primary-button" onClick={() => navigate(`/task/${result.id}`)}>Mach ich!</button><button className="secondary-button" onClick={roll}><Shuffle /> Andere Aufgabe</button></div><button className="text-button" onClick={() => setSearched(false)}>Auswahl ändern</button></section> : <><EmptyState title="Keine passende Aufgabe" text="Versuche mehr verfügbare Zeit oder einen anderen Modus." /><button className="secondary-button" onClick={() => setSearched(false)}>Auswahl ändern</button></>}
    </main></>
}

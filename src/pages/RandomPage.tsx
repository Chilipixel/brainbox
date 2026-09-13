import { BatteryFull, BatteryLow, BatteryMedium, Clock3, Shuffle, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { EnergyLabel } from '../components/EnergyLabel'
import { PageHeader } from '../components/PageHeader'
import { categoryEmoji } from '../domain/categoryDisplay'
import { formatDuration, urgencyLabels } from '../domain/labels'
import { getRandomTask, type RandomMode } from '../domain/recommendations'
import { useAppData } from '../hooks/useAppData'
import type { EnergyLevel, Task } from '../types/models'

export function RandomPage() {
  const { tasks, categories } = useAppData()
  const navigate = useNavigate()
  const location = useLocation()
  const initialMode = (location.state as { mode?: RandomMode } | null)?.mode ?? 'any'
  const [minutes, setMinutes] = useState(60)
  const [mode, setMode] = useState<RandomMode>(initialMode)
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('medium')
  const [result, setResult] = useState<Task | undefined>()
  const [searched, setSearched] = useState(false)
  const roll = () => { setResult(getRandomTask(tasks, minutes, mode, energyLevel, result?.id)); setSearched(true) }
  const category = categories.find((item) => item.id === result?.categoryId)

  return <><PageHeader title="Zufall" />
    <main className="page random-page"><div className="random-intro"><div className="random-symbol"><Shuffle /></div><span className="eyebrow">Entscheidungshilfe</span><h2>Was soll ich machen?</h2><p>Lass dich von einer Aufgabe inspirieren, die gerade in deinen Tag passt.</p></div>
      {!searched ? <div className="random-controls">
        <fieldset><legend>Wie viel Zeit hast du?</legend><div className="random-time-grid">{[[15,'Max. 15 Min.','Kurze Aufgaben'],[60,'Max. 60 Min.','Kurze und mittlere'],[Number.POSITIVE_INFINITY,'Über 60 Min.','Alle Aufgaben']].map(([value, label, detail]) => <button type="button" key={String(value)} className={minutes === value ? 'active' : ''} onClick={() => setMinutes(Number(value))}><Clock3 /><strong>{label}</strong><small>{detail}</small></button>)}</div></fieldset>
        <fieldset><legend>Wie viel Energie hast du gerade?</legend><div className="random-energy-grid">{([['low','Wenig',BatteryLow],['medium','Mittel',BatteryMedium],['high','Viel',BatteryFull]] as const).map(([value, label, Icon]) => <button type="button" key={value} className={energyLevel === value ? 'active' : ''} onClick={() => setEnergyLevel(value)} aria-pressed={energyLevel === value}><Icon />{label}</button>)}</div></fieldset>
        <fieldset><legend>Was für eine Aufgabe?</legend><div className="mode-grid">{([['any','Egal','Alles, was passt'],['important','Wichtig','Prioritäten zuerst'],['boredom','Langeweile','Ideen ohne Druck']] as const).map(([value, label, text]) => <button type="button" key={value} className={mode === value ? 'active' : ''} onClick={() => setMode(value)}><strong>{label}</strong><small>{text}</small></button>)}</div></fieldset>
        <button className="primary-button random-action" onClick={roll}><Sparkles /> Zufällige Aufgabe anzeigen</button>
      </div> : result ? <section className="result-wrap"><span className="eyebrow">Deine Aufgabe</span><div className={`result-card urgency-${result.urgency}`}><span className="result-icon" style={{ background: `${category?.color}20` }} aria-hidden="true">{categoryEmoji(category) || '·'}</span><h2>{result.title}</h2><div className="result-meta"><span>{category?.name}</span><span>{urgencyLabels[result.urgency]}</span><span>{formatDuration(result.duration, result.estimatedMinutes)}</span>{result.energyLevel && <EnergyLabel level={result.energyLevel} />}</div>{result.description && <p>{result.description}</p>}<button className="primary-button" onClick={() => navigate(`/task/${result.id}`)}>Mach ich!</button><button className="secondary-button" onClick={roll}><Shuffle /> Andere Aufgabe</button></div><button className="text-button" onClick={() => setSearched(false)}>Auswahl ändern</button></section> : <><EmptyState title="Keine passende Aufgabe" text="Für diese Zeit und Energie ist gerade nichts Passendes hinterlegt." /><button className="secondary-button" onClick={() => setSearched(false)}>Auswahl ändern</button></>}
    </main></>
}

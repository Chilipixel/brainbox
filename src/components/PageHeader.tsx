import { ArrowLeft, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function PageHeader({ title, back = false, action }: { title: string, back?: boolean, action?: React.ReactNode }) {
  const navigate = useNavigate()
  return <header className="page-header">
    {back ? <button className="icon-button" onClick={() => navigate(-1)} aria-label="Zurück"><ArrowLeft /></button> : <div className="brand-mark">S</div>}
    <h1>{title}</h1>
    {action ?? <button className="icon-button" onClick={() => navigate('/settings')} aria-label="Einstellungen"><Settings /></button>}
  </header>
}

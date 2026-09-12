import { ArrowLeft, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function PageHeader({ title, back = false, action }: { title: string, back?: boolean, action?: React.ReactNode }) {
  const navigate = useNavigate()
  return <header className="page-header">
    {back ? <button className="icon-button" onClick={() => navigate(-1)} aria-label="Zurück"><ArrowLeft /></button> : <img className="brand-mark" src={`${import.meta.env.BASE_URL}pwa-192x192.png`} alt="" />}
    <h1>{title}</h1>
    {action ?? <button className="icon-button" onClick={() => navigate('/settings')} aria-label="Einstellungen"><Settings /></button>}
  </header>
}

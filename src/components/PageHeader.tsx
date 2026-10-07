import { ArrowLeft, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BrandMark } from './BrandMark'
import { WorkspaceSwitch } from './WorkspaceSwitch'

export function PageHeader({ title, back = false, action, workspaceSwitch = false }: { title: string, back?: boolean, action?: React.ReactNode, workspaceSwitch?: boolean }) {
  const navigate = useNavigate()
  return <header className="page-header">
    {back ? <button className="icon-button" onClick={() => navigate(-1)} aria-label="Zurück"><ArrowLeft /></button> : <BrandMark />}
    {workspaceSwitch ? <WorkspaceSwitch /> : <h1>{title}</h1>}
    {action ?? <button className="icon-button" onClick={() => navigate('/settings')} aria-label="Einstellungen"><Settings /></button>}
  </header>
}

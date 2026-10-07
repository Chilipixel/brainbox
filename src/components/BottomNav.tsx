import { CheckSquare2, Folder, ListTodo, Plus, Shuffle } from 'lucide-react'
import { NavLink } from 'react-router-dom'

export function BottomNav() {
  const item = (to: string, label: string, Icon: typeof CheckSquare2) => (
    <NavLink to={to} end={to === '/'} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
      <Icon aria-hidden="true" /><span>{label}</span>
    </NavLink>
  )
  return <nav className="bottom-nav" aria-label="Hauptnavigation">
    {item('/', 'Start', CheckSquare2)}
    {item('/categories', 'Kategorien', Folder)}
    <NavLink to="/new" className="add-button" aria-label="Neue Aufgabe"><Plus aria-hidden="true" /></NavLink>
    {item('/all', 'Alle', ListTodo)}
    {item('/random', 'Zufall', Shuffle)}
  </nav>
}

import { NavLink } from 'react-router-dom'

export function WorkspaceSwitch() {
  return <nav className="workspace-switch" aria-label="Workspace wechseln">
    <NavLink to="/" end>Brainbox</NavLink>
    <NavLink to="/thoughts">Thoughts</NavLink>
  </nav>
}

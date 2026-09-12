import { Navigate, Route, Routes } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { useAppData } from './hooks/useAppData'
import { useWebMcp } from './hooks/useWebMcp'
import { AllTasksPage } from './pages/AllTasksPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { CategoryDetailPage } from './pages/CategoryDetailPage'
import { CompletedPage } from './pages/CompletedPage'
import { HomePage } from './pages/HomePage'
import { RandomPage } from './pages/RandomPage'
import { SettingsPage } from './pages/SettingsPage'
import { TaskDetailPage } from './pages/TaskDetailPage'
import { TaskFormPage } from './pages/TaskFormPage'

function App() {
  const { ready } = useAppData()
  useWebMcp()
  if (!ready) return <div className="app-loading"><div className="brand-mark">S</div><span>Deine Aufgaben werden vorbereitet …</span></div>
  return <div className="app-shell"><div className="app-content"><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/categories" element={<CategoriesPage />} />
    <Route path="/category/:id" element={<CategoryDetailPage />} />
    <Route path="/new" element={<TaskFormPage />} />
    <Route path="/task/:id/edit" element={<TaskFormPage />} />
    <Route path="/task/:id" element={<TaskDetailPage />} />
    <Route path="/all" element={<AllTasksPage />} />
    <Route path="/random" element={<RandomPage />} />
    <Route path="/completed" element={<CompletedPage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></div><BottomNav /></div>
}

export default App

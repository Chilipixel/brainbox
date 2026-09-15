import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { BrandMark } from './components/BrandMark'
import { LegalFooter } from './components/LegalFooter'
import { ScrollToTop } from './components/ScrollToTop'
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
  const { pathname } = useLocation()
  useWebMcp()
  if (!ready) return <div className="app-loading"><BrandMark /><span>Deine Aufgaben werden vorbereitet …</span></div>
  return <div className="app-shell"><ScrollToTop /><div className="app-content"><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/categories" element={<CategoriesPage />} />
    <Route path="/category/:id" element={<CategoryDetailPage />} />
    <Route path="/new" element={<TaskFormPage key="new" />} />
    <Route path="/task/:id/edit" element={<TaskFormPage key={pathname} />} />
    <Route path="/task/:id" element={<TaskDetailPage />} />
    <Route path="/all" element={<AllTasksPage />} />
    <Route path="/random" element={<RandomPage />} />
    <Route path="/completed" element={<CompletedPage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes><LegalFooter /></div><BottomNav /></div>
}

export default App

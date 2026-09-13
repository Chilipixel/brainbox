import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { AppProvider } from './hooks/useAppData'
import './styles/global.css'

registerSW({ immediate: true })
document.documentElement.dataset.theme = localStorage.getItem('theme') || 'system'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <AppProvider><App /></AppProvider>
    </HashRouter>
  </React.StrictMode>
)

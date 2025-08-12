import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/history-icon.css'
import './i18n' // Initialize i18n
import App from './App.tsx'
import { assetManager } from './services/assetManager'

// Start preloading assets
assetManager.preloadAssets();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { LanguageProvider } from './hooks/useLanguage'
import { ThemeProvider } from './hooks/useTheme'
import './styles/globals.css'

const container = document.getElementById('root')
if (!container) throw new Error('Root container #root is missing from index.html')

createRoot(container).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
)

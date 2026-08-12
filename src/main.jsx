import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

function mostrarErroNaTela(titulo, detalhe) {
  const root = document.getElementById('root')
  root.innerHTML = `
    <div style="min-height:100vh;background:#12151C;color:#F87171;padding:24px;font-family:monospace;font-size:14px;white-space:pre-wrap;">
      <h1 style="color:#fff;font-size:18px;margin-bottom:12px;">${titulo}</h1>
      ${detalhe}
    </div>
  `
}

window.addEventListener('error', (e) => {
  mostrarErroNaTela('Erro ao carregar o app', (e.error?.stack || e.message || String(e)).replace(/</g, '&lt;'))
})
window.addEventListener('unhandledrejection', (e) => {
  mostrarErroNaTela('Erro (promise) ao carregar o app', (e.reason?.stack || e.reason?.message || String(e.reason)).replace(/</g, '&lt;'))
})

try {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (err) {
  mostrarErroNaTela('Erro síncrono ao iniciar', (err.stack || err.message).replace(/</g, '&lt;'))
}


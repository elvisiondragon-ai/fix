// ==========================================
export const APP_VERSION = import.meta.env.VITE_APP_VERSION as string;
// ==========================================

// ② localStorage nuke: clears SW, caches, then hard reloads on stale version
if (localStorage.getItem('v_cache') !== APP_VERSION) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
  }
  if ('caches' in window) {
    caches.keys().then(names => names.forEach(n => caches.delete(n)));
  }
  localStorage.setItem('v_cache', APP_VERSION);
  setTimeout(() => window.location.reload(), 500);
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import ElVisionAI from '../ElVisionAI'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ElVisionAI />
  </React.StrictMode>,
)

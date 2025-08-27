import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n/i18n';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { registerSW } from 'virtual:pwa-register';

const showUpdateToast = (() => {
  let shown = false;
  return () => {
    if (shown) return;
    shown = true;
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed;left:50%;bottom:90px;transform:translateX(-50%);
      background:#fbb800;color:#000;padding:10px 14px;border-radius:12px;
      font-family:Montserrat, sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.2);z-index:9999;`;
    el.innerHTML = `Nowa wersja aplikacji. <button id="pwa-reload" style="margin-left:8px;font-weight:700;">Odśwież</button>`;
    document.body.appendChild(el);
    document.getElementById('pwa-reload')?.addEventListener('click', () => location.reload());
  };
})();

registerSW({
  immediate: true,
  onNeedRefresh() {
    showUpdateToast();
  },
  onOfflineReady() {
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

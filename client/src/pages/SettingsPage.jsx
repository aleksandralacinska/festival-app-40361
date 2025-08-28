import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

async function subscribePush(teamId) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('push_unsupported');
  }
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  });
  const body = {
    endpoint: sub.endpoint,
    keys: sub.toJSON().keys,
    teamId: teamId || null
  };
  await fetch(`${API}/push/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return true;
}

async function unsubscribePush() {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  await fetch(`${API}/push/unsubscribe`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: sub.endpoint })
  });
  await sub.unsubscribe();
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export default function SettingsPage() {
  const { i18n, t } = useTranslation();
  const [msg, setMsg] = useState('');

  const enablePush = async () => {
    setMsg('');
    try {
      await subscribePush(null);
      setMsg('Powiadomienia włączone ✅');
    } catch {
      setMsg('Nie udało się włączyć powiadomień');
    }
  };

  const disablePush = async () => {
    setMsg('');
    try {
      await unsubscribePush();
      setMsg('Powiadomienia wyłączone');
    } catch {
      setMsg('Błąd wyłączania powiadomień');
    }
  };

  return (
    <>
      <h2>{t('settings')}</h2>

      <div className="card" style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
        <label htmlFor="lang-select" style={{ fontWeight: 700 }}>
          {t('language')}
        </label>
        <select
          id="lang-select"
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #ececec' }}
        >
          <option value="pl">{t('language_polish')}</option>
          <option value="en">{t('language_english')}</option>
        </select>
      </div>

      <div className="card" style={{ marginTop: 12, display: 'grid', gap: 8, maxWidth: 420 }}>
        <button className="btn" onClick={enablePush}>Włącz powiadomienia</button>
        <button className="btn" onClick={disablePush}>Wyłącz powiadomienia</button>
        {msg && <small>{msg}</small>}
      </div>
    </>
  );
}

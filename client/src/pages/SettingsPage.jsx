import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

import { getToken } from '../services/auth';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

async function subscribePush(teamId) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('push_unsupported');
  }
  const reg = await navigator.serviceWorker.ready;

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  const body = {
    endpoint: sub.endpoint,
    keys: sub.toJSON().keys, // { p256dh, auth }
    teamId: teamId || null,
  };

  await fetch(`${API}/push/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return true;
}

async function unsubscribePush() {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;

  try {
    await fetch(`${API}/push/unsubscribe`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });
  } finally {
    await sub.unsubscribe();
  }
}

export default function SettingsPage() {
  const { i18n, t } = useTranslation();

  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState(Notification?.permission || 'default');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        setSupported(false);
        return;
      }
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setSubscribed(!!sub);
      } catch {
        // ignore
      }
      setPermission(Notification.permission);
    })();
  }, []);

  const fetchTeamIdIfLogged = async () => {
    const token = getToken?.();
    if (!token) return null;
    try {
      const r = await fetch(`${API}/team/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) return null;
      const data = await r.json();
      return data?.team?.id ?? null;
    } catch {
      return null;
    }
  };

  const handleEnable = async () => {
    setMsg('');
    setLoading(true);
    try {
      if (!supported) throw new Error('push_unsupported');
      let perm = Notification.permission;
      if (perm !== 'granted') {
        perm = await Notification.requestPermission();
      }
      setPermission(perm);
      if (perm !== 'granted') {
        setMsg(t('notifications_toast_permission_denied'));
        return;
      }
      const teamId = await fetchTeamIdIfLogged();
      await subscribePush(teamId);
      setSubscribed(true);
      setMsg(t('notifications_toast_enabled'));
    } catch {
      setMsg(t('notifications_toast_enable_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setMsg('');
    setLoading(true);
    try {
      await unsubscribePush();
      setSubscribed(false);
      setMsg(t('notifications_toast_disabled'));
    } catch {
      setMsg(t('notifications_toast_disable_failed'));
    } finally {
      setLoading(false);
    }
  };

  let statusText = '';
  let dot = '#9ca3af';
  if (!supported) {
    statusText = t('notifications_status_unsupported');
    dot = '#9ca3af';
  } else if (permission === 'denied') {
    statusText = t('notifications_status_blocked');
    dot = '#ef4444';
  } else if (subscribed) {
    statusText = t('notifications_status_on');
    dot = '#22c55e';
  } else {
    statusText = t('notifications_status_off');
    dot = '#f59e0b';
  }

  return (
    <>
      <h2>{t('settings')}</h2>

      <div className="settings-center">
        <div className="card settings-card">
          <label htmlFor="lang-select" style={{ fontWeight: 700, display: 'block', marginBottom: 8 }}>
            {t('language')}
          </label>
          <select
            id="lang-select"
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #ececec', width: '100%' }}
          >
            <option value="pl">{t('language_polish')}</option>
            <option value="en">{t('language_english')}</option>
          </select>
        </div>

        <div className="card settings-card">
          <div className="notif-row">
            <span className="notif-dot" style={{ background: dot }} aria-hidden />
            <strong style={{ color: 'var(--gray-700)', fontWeight: 700 }}>
              {t('notifications_title')}
            </strong>
            <span className="notif-status">{statusText}</span>
          </div>

          {permission === 'denied' && (
            <p style={{ marginTop: 8, color: '#9ca3af', fontSize: 12 }}>
              {t('notifications_permission_blocked_hint')}
            </p>
          )}

          <div style={{ marginTop: 10 }}>
            {subscribed ? (
              <button className="btn" onClick={handleDisable} disabled={loading}>
                {loading ? t('notifications_disabling') : t('notifications_disable')}
              </button>
            ) : (
              <button className="btn" onClick={handleEnable} disabled={loading || !supported}>
                {loading ? t('notifications_enabling') : t('notifications_enable')}
              </button>
            )}
          </div>

          {msg && <small style={{ display: 'block', marginTop: 10 }}>{msg}</small>}
        </div>
      </div>
    </>
  );
}

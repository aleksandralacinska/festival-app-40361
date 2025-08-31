import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getToken } from '../services/auth';
import { API_URL } from '../services/api';

const API = API_URL;
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}

export default function SettingsPage() {
  const { i18n, t } = useTranslation();

  const [supported, setSupported] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const permissionBlocked =
    typeof Notification !== 'undefined' && Notification.permission === 'denied';

  const statusText = useMemo(() => {
    if (!supported) return t('notifications_status_unsupported');
    if (permissionBlocked) return t('notifications_status_blocked');
    return enabled ? t('notifications_status_on') : t('notifications_status_off');
  }, [supported, permissionBlocked, enabled, t]);

  useEffect(() => {
    (async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setSupported(false);
        return;
      }
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setEnabled(!!sub);
      } catch {
        setSupported(false);
      }
    })();
  }, []);

  async function fetchMyTeamId() {
    const token = getToken?.();
    if (!token) return null;
    try {
      const r = await fetch(`${API}/team/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) return null;
      const data = await r.json();
      return data?.team?.id ?? null;
    } catch {
      return null;
    }
  }

  async function subscribePush() {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      if (!VAPID_PUBLIC_KEY) throw new Error('missing_vapid_key');
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') throw new Error('permission_denied');
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY.trim()),
      });
    }
    const teamId = await fetchMyTeamId();
    const payload = { endpoint: sub.endpoint, keys: sub.toJSON().keys, teamId: teamId || null };
    const r = await fetch(`${API}/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error('server_subscribe_failed');
    return true;
  }

  async function unsubscribePush() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return true;
    await fetch(`${API}/push/unsubscribe`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });
    await sub.unsubscribe();
    return true;
  }

  const onEnable = async () => {
    setMsg('');
    setBusy(true);
    try {
      await subscribePush();
      setEnabled(true);
      setMsg(t('notifications_toast_enabled'));
    } catch (e) {
      if (e?.message === 'permission_denied') setMsg(t('notifications_toast_permission_denied'));
      else setMsg(t('notifications_toast_enable_failed'));
    } finally {
      setBusy(false);
    }
  };

  const onDisable = async () => {
    setMsg('');
    setBusy(true);
    try {
      await unsubscribePush();
      setEnabled(false);
      setMsg(t('notifications_toast_disabled'));
    } catch {
      setMsg(t('notifications_toast_disable_failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h2>{t('settings')}</h2>

      <div style={{ display: 'grid', placeItems: 'center', minHeight: '50vh' }}>
        <div style={{ width: '100%', maxWidth: 420, display: 'grid', gap: 16 }}>
          <div className="card" style={{ display: 'grid', gap: 8 }}>
            <label htmlFor="lang-select" style={{ fontWeight: 700, marginBottom: 6 }}>
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

          <div className="card" style={{ display: 'grid', gap: 12 }}>
            <div style={{ fontWeight: 700 }}>{t('notifications_title')}</div>
            <div style={{ color: 'var(--gray-700)' }}>{statusText}</div>

            {!supported ? null : permissionBlocked ? (
              <small style={{ color: 'crimson' }}>{t('notifications_permission_blocked_hint')}</small>
            ) : enabled ? (
              <button className="btn" onClick={onDisable} disabled={busy}>
                {busy ? t('notifications_disabling') : t('notifications_disable')}
              </button>
            ) : (
              <button className="btn" onClick={onEnable} disabled={busy}>
                {busy ? t('notifications_enabling') : t('notifications_enable')}
              </button>
            )}

            {msg && <small>{msg}</small>}
          </div>
        </div>
      </div>
    </>
  );
}

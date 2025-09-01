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

// ——— helpers PWA install (pure JS) ———
function isStandalone() {
  const standaloneMQ = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone = 'standalone' in navigator && navigator.standalone === true;
  return !!(standaloneMQ || iosStandalone);
}
function isIOS() {
  const ua = window.navigator.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
}
function isSafari() {
  const ua = window.navigator.userAgent || '';
  return /Safari/.test(ua) && !/Chrome|Chromium|CriOS|Edg/i.test(ua);
}

export default function SettingsPage() {
  const { i18n, t } = useTranslation();

  // ===== Powiadomienia =====
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
        const ready = navigator.serviceWorker.ready;
        let reg;
        try {
          reg = await ready;
        } catch {
          throw new Error('sw_not_ready');
        }
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
      return data && data.team ? data.team.id : null;
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
    } catch (err) {
      const errMsg = err && typeof err === 'object' && 'message' in err ? err.message : '';
      if (errMsg === 'permission_denied') setMsg(t('notifications_toast_permission_denied'));
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

  // ===== Instalacja PWA =====
  const [installed, setInstalled] = useState(isStandalone());
  const [canInstall, setCanInstall] = useState(!!window.__pwaInstallPrompt);

  useEffect(() => {
    const onCanInstall = () => setCanInstall(true);
    const onInstalled = () => { setInstalled(true); setCanInstall(false); };

    window.addEventListener('pwa:can-install', onCanInstall);
    window.addEventListener('pwa:installed', onInstalled);

    if (window.__pwaInstallPrompt) setCanInstall(true);

    const mq = window.matchMedia && window.matchMedia('(display-mode: standalone)');
    const handleMQ = (e) => { if (e.matches) { setInstalled(true); setCanInstall(false); } };
    mq && mq.addEventListener && mq.addEventListener('change', handleMQ);

    return () => {
      window.removeEventListener('pwa:can-install', onCanInstall);
      window.removeEventListener('pwa:installed', onInstalled);
      mq && mq.removeEventListener && mq.removeEventListener('change', handleMQ);
    };
  }, []);

  async function onInstallClick() {
    const promptEvt = window.__pwaInstallPrompt;
    if (!promptEvt) return;
    try {
      promptEvt.prompt();
      const choice = await promptEvt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        setCanInstall(false);
      }
    } catch {
      // ignore
    }
  }

  const showIOSHint = !installed && !canInstall && isIOS() && isSafari();

  return (
    <>
      <h2>{t('settings')}</h2>

      <div style={{ display: 'grid', placeItems: 'center', minHeight: '50vh' }}>
        <div style={{ width: '100%', maxWidth: 420, display: 'grid', gap: 16 }}>

          {/* Język */}
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

          {/* Powiadomienia */}
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

          {/* Instalacja PWA */}
          {!installed && (
            <div className="card" style={{ display: 'grid', gap: 12 }}>
              <div style={{ fontWeight: 700 }}>{t('app_install')}</div>

              {canInstall && (
                <button className="btn" onClick={onInstallClick}>
                  {t('install')}
                </button>
              )}

              {showIOSHint && (
                <small style={{ color: 'var(--gray-700)' }}>
                  {t('install_info1')}<b>{t('install_info2')}</b>{t('install_info3')}<i className="fa-solid fa-share-from-square" aria-hidden />{t('install_info4')}<b>{t('install_info5')}</b>.
                </small>
              )}

              {!canInstall && !showIOSHint && (
                <small style={{ color: 'var(--gray-700)' }}>
                  {t('install_announcement')}
                </small>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

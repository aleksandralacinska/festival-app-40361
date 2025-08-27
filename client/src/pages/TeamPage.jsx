import React, { useEffect, useState } from 'react';
import { loginWithPin, getToken, logout } from '../services/auth';
import { getMyTeam } from '../services/team';
import { useTranslation } from 'react-i18next';

export default function TeamPage() {
  const { t, i18n } = useTranslation();
  const [teamData, setTeamData] = useState(null);
  const [form, setForm] = useState({ slug: '', pin: '' });
  const [error, setError] = useState('');
  const hasToken = !!getToken();

  useEffect(() => {
    if (hasToken) {
      getMyTeam()
        .then(setTeamData)
        .catch(() => setError(t('team_fetch_error')));
    }
  }, [hasToken, t]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await loginWithPin(form.slug, form.pin);
      const data = await getMyTeam();
      setTeamData(data);
    } catch (err) {
      console.error('PIN login error:', err);
      setError(t('bad_pin_or_slug'));
    }
  };

  const locale = i18n.language === 'en' ? 'en-US' : 'pl-PL';
  const fmtDate = (d) => new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(d));

  if (!hasToken || !teamData) {
    return (
      <>
        <h2>{t('team_access')}</h2>
        <div className="card">
          <form onSubmit={onSubmit}>
            <label>
              {t('slug_label')}<br/>
              <input
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                required
              />
            </label><br/><br/>
            <label>
              {t('pin_label')}<br/>
              <input
                type="password"
                value={form.pin}
                onChange={e => setForm(f => ({ ...f, pin: e.target.value }))}
                required
              />
            </label><br/><br/>
            <button className="btn" type="submit">{t('login')}</button>
            {error && <p style={{ color: 'crimson' }}>{error}</p>}
          </form>
        </div>
      </>
    );
  }

  const { team, events, lodging } = teamData;

  return (
    <>
      <h2>{team.name}</h2>
      {lodging && (
        <div className="card">
          <b>{t('lodging')}:</b> {lodging.name}<br/>
          <small>{lodging.description}</small>
        </div>
      )}
      <h3>{t('team_plan')}</h3>
      {(events && events.length ? events : []).map(ev => (
        <div className="card" key={ev.id}>
          <strong>{fmtDate(ev.start_time)}</strong><br/>
          {ev.name} — {ev.location_name || t('tba')}
        </div>
      ))}
      <br/>
      <button className="btn" onClick={() => { logout(); window.location.reload(); }}>
        {t('logout')}
      </button>
    </>
  );
}

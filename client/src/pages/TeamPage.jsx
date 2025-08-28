import React, { useEffect, useState } from 'react';
import { loginWithPin, getToken, logout, getTeamName } from '../services/auth';
import { getMyTeam } from '../services/team';

export default function TeamPage() {
  const [teamData, setTeamData] = useState(null);
  const [form, setForm] = useState({ slug: '', pin: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const hasToken = !!getToken();

  // jeśli jest token - próba pobrania /team/me — przy 401 czyszczenie tokenu i pokazanie formularza
  useEffect(() => {
    let ignore = false;
    if (!hasToken) return;

    (async () => {
      setError('');
      setLoading(true);
      try {
        const data = await getMyTeam();
        if (!ignore) setTeamData(data);
      } catch (err) {
        console.warn('getMyTeam error:', err);
        if (!ignore) {
          // jeśli nieautoryzowany — wyloguj i pokaż formularz
          if (err?.code === 401 || err?.message === 'unauthorized') {
            logout();
            setTeamData(null);
          }
          setError('Błędny PIN lub wygasła sesja. Zaloguj ponownie.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => { ignore = true; };
  }, [hasToken]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithPin(form.slug.trim(), form.pin.trim());
      const data = await getMyTeam();
      setTeamData(data);
      setForm({ slug: '', pin: '' });
    } catch (err) {
      console.error('PIN login error:', err);
      setError('Błędny PIN lub nazwa skrócona (slug).');
    } finally {
      setLoading(false);
    }
  };

  // jeśli nie ma tokena lub nie mamy danych zespołu — formularz logowania
  if (!hasToken || !teamData) {
    return (
      <>
        <h2>Dostęp zespołu (PIN)</h2>
        <div className="card">
          <form onSubmit={onSubmit}>
            <label>
              Nazwa skrócona (slug)<br/>
              <input
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                required
                autoComplete="username"
                placeholder="np. elk, promni, pw, polka"
              />
            </label>
            <br/><br/>
            <label>
              PIN<br/>
              <input
                type="password"
                value={form.pin}
                onChange={e => setForm(f => ({ ...f, pin: e.target.value }))}
                required
                autoComplete="current-password"
                placeholder="np. 1234"
              />
            </label>
            <br/><br/>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Logowanie…' : 'Zaloguj'}
            </button>
            {error && <p style={{ color: 'crimson', marginTop: 8 }}>{error}</p>}
          </form>
        </div>
      </>
    );
  }

  // widok po zalogowaniu
  const { team, events, lodging } = teamData;

  return (
    <>
      <h2>{team?.name || getTeamName()}</h2>
      {lodging && (
        <div className="card">
          <b>Nocleg:</b> {lodging.name}<br/>
          <small>{lodging.description}</small>
        </div>
      )}

      <h3>Plan zespołu</h3>
      {(events && events.length ? events : []).map(ev => (
        <div className="card" key={ev.id}>
          <strong>{new Date(ev.start_time).toLocaleString()}</strong><br/>
          {ev.name} — {ev.location_name || 'TBA'}
        </div>
      ))}

      <br/>
      <button
        className="btn"
        onClick={() => { logout(); setTeamData(null); window.location.reload(); }}
      >
        Wyloguj
      </button>
    </>
  );
}

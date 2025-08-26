import React, { useEffect, useState } from 'react';
import { loginWithPin, getToken, logout } from '../services/auth';
import { getMyTeam } from '../services/team';

export default function TeamPage() {
  const [teamData, setTeamData] = useState(null);
  const [form, setForm] = useState({ teamName: '', pin: '' });
  const [error, setError] = useState('');
  const hasToken = !!getToken();

  useEffect(() => {
    if (hasToken) {
      getMyTeam()
        .then(setTeamData)
        .catch(() => setError('Nie udało się pobrać danych zespołu'));
    }
  }, [hasToken]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await loginWithPin(form.teamName, form.pin);
      const data = await getMyTeam();
      setTeamData(data);
    } catch (err) {
      console.error('PIN login error:', err);
      setError('Błędny PIN lub nazwa zespołu');
    }
  };

  if (!hasToken || !teamData) {
    return (
      <>
        <h2>Dostęp zespołu (PIN)</h2>
        <div className="card">
          <form onSubmit={onSubmit}>
            <label>Nazwa zespołu<br/>
              <input
                value={form.teamName}
                onChange={e => setForm(f => ({ ...f, teamName: e.target.value }))}
                required
              />
            </label><br/><br/>
            <label>PIN<br/>
              <input
                type="password"
                value={form.pin}
                onChange={e => setForm(f => ({ ...f, pin: e.target.value }))}
                required
              />
            </label><br/><br/>
            <button className="btn" type="submit">Zaloguj</button>
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
      <button className="btn" onClick={() => { logout(); window.location.reload(); }}>
        Wyloguj
      </button>
    </>
  );
}

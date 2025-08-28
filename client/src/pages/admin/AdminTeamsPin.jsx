import React, { useEffect, useState } from 'react';
import { adminGetTeams, adminSetTeamPin } from '../../services/admin';

export default function AdminTeamsPin(){
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState('');
  const [pin, setPin] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(()=>{ adminGetTeams().then(setTeams).catch(()=>setMsg('Błąd pobierania zespołów')); }, []);

  const save = async (e)=>{
    e.preventDefault(); setMsg('');
    try{
      await adminSetTeamPin(teamId, pin);
      setMsg('PIN ustawiony ✅');
      setPin('');
    }catch{ setMsg('Błąd ustawiania PIN'); }
  };

  return (
    <>
      <h2>Reset PIN zespołu</h2>
      <div className="card">
        <form onSubmit={save}>
          <label>Zespół<br/>
            <select value={teamId} onChange={e=>setTeamId(e.target.value)} required>
              <option value="" disabled>-- wybierz --</option>
              {teams.map(t=><option key={t.id} value={t.id}>{t.name} ({t.slug})</option>)}
            </select>
          </label><br/><br/>
          <label>Nowy PIN<br/><input value={pin} onChange={e=>setPin(e.target.value)} required /></label><br/><br/>
          <button className="btn">Zapisz</button>
          {msg && <p>{msg}</p>}
        </form>
      </div>
    </>
  );
}

import React, { useEffect, useState } from 'react';
import { adminGetTeams, adminPushBroadcast } from '../../services/admin';

export default function AdminPush(){
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState({ title:'', body:'', url:'', teamId:'' });
  const [msg, setMsg] = useState('');

  useEffect(()=>{ adminGetTeams().then(setTeams).catch(()=>{}); }, []);

  const send = async (e)=>{
    e.preventDefault(); setMsg('');
    try{
      const payload = { title: form.title, body: form.body, url: form.url || null, teamId: form.teamId || null };
      const r = await adminPushBroadcast(payload);
      setMsg(`Wysłano: ${r.sent}, błędów: ${r.failed}`);
      setForm({ title:'', body:'', url:'', teamId:'' });
    }catch{ setMsg('Błąd wysyłki'); }
  };

  return (
    <>
      <h2>Powiadomienia push</h2>
      <div className="card">
        <form onSubmit={send}>
          <label>Tytuł<br/><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required/></label><br/><br/>
          <label>Treść<br/><textarea value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} required/></label><br/><br/>
          <label>Link (opcjonalnie)<br/><input value={form.url} onChange={e=>setForm(f=>({...f,url:e.target.value}))}/></label><br/><br/>
          <label>Adresaci<br/>
            <select value={form.teamId} onChange={e=>setForm(f=>({...f,teamId:e.target.value}))}>
              <option value="">Wszyscy</option>
              {teams.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label><br/><br/>
          <button className="btn">Wyślij</button>
          {msg && <p>{msg}</p>}
        </form>
      </div>
    </>
  );
}

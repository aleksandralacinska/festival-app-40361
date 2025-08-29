import React, { useEffect, useState } from 'react';
import { fetchPublicEvents } from '../../services/events';
import { adminCreateEvent, adminUpdateEvent, adminGetTeams } from '../../services/admin';
import { fetchLocations } from '../../services/locations';

const PUBLIC_CATEGORIES = [
  { value:'concert', label:'Koncert' },
  { value:'parade', label:'Parada' },
  { value:'ceremony', label:'Ceremonia' },
  { value:'special', label:'Specjalne' },
];

const TEAM_CATEGORIES = [
  { value:'concert', label:'Koncert' },
  { value:'special', label:'Specjalne' },
  { value:'party', label:'Integracja' },
  { value:'meal', label:'Posiłek' },
  { value:'rehearsal', label:'Próba' },
  { value:'other', label:'Inne' },
];

export default function AdminEvents(){
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [locations, setLocations] = useState([]);

  const [mode, setMode] = useState('public'); // 'public' | 'team'
  const [form, setForm] = useState({
    name:'', start_time:'', end_time:'', description:'',
    category:'concert', is_public:true, team_id:'', location_id:''
  });

  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  useEffect(()=>{
    fetchPublicEvents().then(setEvents).catch(()=>setErr('Błąd listy'));
    adminGetTeams().then(setTeams).catch(()=>{});
    fetchLocations().then(setLocations).catch(()=>{});
  }, []);

  useEffect(()=>{
    // jeśli tryb publiczny -> nie pozwalaj wybrać team_id, is_public = true
    if (mode === 'public') {
      setForm(f => ({ ...f, team_id:'', is_public:true, category: 'concert' }));
    } else {
      // tryb team -> domyślnie kategoria 'party', is_public=false
      setForm(f => ({ ...f, is_public:false, category: 'party' }));
    }
  }, [mode]);

  const cats = mode === 'public' ? PUBLIC_CATEGORIES : TEAM_CATEGORIES;

  const create = async (e)=>{
    e.preventDefault();
    setErr(''); setOk('');

    try{
      const payload = {
        name: form.name.trim(),
        description: form.description || '',
        start_time: form.start_time ? new Date(form.start_time).toISOString() : null,
        end_time: form.end_time ? new Date(form.end_time).toISOString() : null,
        category: form.category,
        is_public: mode === 'public' ? true : false,
        team_id: mode === 'team' && form.team_id ? Number(form.team_id) : null,
        location_id: form.location_id ? Number(form.location_id) : null,
      };

      const created = await adminCreateEvent(payload);
      // odśwież tylko przy publicznych (ten widok listuje publiczne)
      if (payload.is_public) setEvents(v=>[...v, created]);
      setForm({
        name:'', start_time:'', end_time:'', description:'',
        category: mode === 'public' ? 'concert' : 'party',
        is_public: mode === 'public',
        team_id:'', location_id:''
      });
      setOk('Dodano wydarzenie ✅');
      setTimeout(()=>setOk(''), 2000);
    }catch(e){
      console.error('create event error:', e);
      setErr('Błąd tworzenia (sprawdź kategorię / daty / lokalizację)');
    }
  };

  const quickPublish = async (ev)=>{
    setErr(''); setOk('');
    try{
      const updated = await adminUpdateEvent(ev.id, { is_public: true });
      setEvents(v => v.map(x => x.id===ev.id ? updated : x));
      setOk('Opublikowano ✅');
      setTimeout(()=>setOk(''), 2000);
    }catch(e){
      console.error('quickPublish error:', e);
      setErr('Błąd publikacji');
    }
  };

  return (
    <>
      <h2>Wydarzenia (admin)</h2>

      <div className="card" style={{maxWidth:860, marginInline:'auto', textAlign:'left'}}>
        <form onSubmit={create}>
          <div style={{display:'flex', gap:12, flexWrap:'wrap', alignItems:'center'}}>
            <label style={{display:'inline-flex',alignItems:'center',gap:6}}>
              <input type="radio" name="mode" checked={mode==='public'} onChange={()=>setMode('public')} />
              Harmonogram ogólny
            </label>
            <label style={{display:'inline-flex',alignItems:'center',gap:6}}>
              <input type="radio" name="mode" checked={mode==='team'} onChange={()=>setMode('team')} />
              Harmonogram zespołu
            </label>
          </div>
          <br/>

          {mode==='team' && (
            <>
              <label>Zespół<br/>
                <select
                  value={form.team_id}
                  onChange={e=>setForm(f=>({...f,team_id:e.target.value}))}
                  required
                >
                  <option value="">— wybierz —</option>
                  {teams.map(t=> <option key={t.id} value={t.id}>{t.name} ({t.slug})</option>)}
                </select>
              </label><br/><br/>
            </>
          )}

          <label>Nazwa<br/>
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required/>
          </label><br/><br/>

          <label>Kategoria<br/>
            <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
              {cats.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </label><br/><br/>

          <label>Start<br/>
            <input type="datetime-local" value={form.start_time} onChange={e=>setForm(f=>({...f,start_time:e.target.value}))} required/>
          </label><br/><br/>

          <label>Koniec (opcjonalnie)<br/>
            <input type="datetime-local" value={form.end_time} onChange={e=>setForm(f=>({...f,end_time:e.target.value}))}/>
          </label><br/><br/>

          <label>Lokalizacja (opcjonalnie)<br/>
            <select
              value={form.location_id}
              onChange={e=>setForm(f=>({...f,location_id:e.target.value}))}
            >
              <option value="">— brak —</option>
              {locations.map(l=> <option key={l.id} value={l.id}>{l.name} ({l.type})</option>)}
            </select>
          </label><br/><br/>

          <label>Opis (krótki, opcjonalnie)<br/>
            <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
          </label><br/><br/>

          <button className="btn">Dodaj</button>
          {err && <p style={{color:'crimson'}}>{err}</p>}
          {ok && <p style={{color:'green'}}>{ok}</p>}
        </form>
      </div>

      <div style={{marginTop:16}}>
        <h3>Wydarzenia publiczne (lista)</h3>
        {events.map(ev=>(
          <div className="card" key={ev.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{textAlign:'left'}}>
              <b>{ev.name}</b><br/>
              <small>{new Date(ev.start_time).toLocaleString()}</small><br/>
              <small>{ev.location_name || '—'}</small>
            </div>
            <div>
              {!ev.is_public && <button className="btn" onClick={()=>quickPublish(ev)}>Publikuj</button>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

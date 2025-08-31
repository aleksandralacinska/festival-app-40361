import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  adminCreateEvent,
  adminUpdateEvent,
  adminFetchEventsAll,
  adminDeleteEvent,
  adminGetTeams,
  getAdminToken
} from '../../services/admin';
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

function toInputDT(iso){
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n)=> String(n).padStart(2,'0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminEvents(){
  const nav = useNavigate();

  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [locations, setLocations] = useState([]);

  const [mode, setMode] = useState('public'); // 'public'|'team'
  const [form, setForm] = useState({
    // bazowe
    name:'', description:'',
    start_time:'', end_time:'',
    category:'concert', is_public:true, team_id:'', location_id:'',
    // i18n (opcjonalne)
    name_pl:'', name_en:'',
    description_pl:'', description_en:''
  });

  const [editId, setEditId] = useState(null);
  const [edit, setEdit] = useState({});
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  // GUARd: najpierw sprawdzamy token; dopiero potem fetch
  useEffect(()=>{
    if(!getAdminToken()){
      nav('/admin', { replace: true });
      return;
    }
    adminFetchEventsAll().then(setEvents).catch(()=>setErr('Błąd listy'));
    adminGetTeams().then(setTeams).catch(()=>{});
    fetchLocations().then(setLocations).catch(()=>{});
  }, [nav]);

  useEffect(()=>{
    if (mode === 'public') {
      setForm(f => ({ ...f, team_id:'', is_public:true, category: 'concert' }));
    } else {
      setForm(f => ({ ...f, is_public:false, category: 'party' }));
    }
  }, [mode]);

  const cats = mode === 'public' ? PUBLIC_CATEGORIES : TEAM_CATEGORIES;

  const create = async (e)=>{
    e.preventDefault(); setErr(''); setOk('');
    try{
      const payload = {
        // bazowe
        name: (form.name || form.name_pl || form.name_en || '').trim(),
        description: form.description || form.description_pl || form.description_en || '',
        start_time: form.start_time ? new Date(form.start_time).toISOString() : null,
        end_time: form.end_time ? new Date(form.end_time).toISOString() : null,
        category: form.category,
        is_public: mode === 'public',
        team_id: mode === 'team' && form.team_id ? Number(form.team_id) : null,
        location_id: form.location_id ? Number(form.location_id) : null,
        // i18n — wyślij tylko jeśli coś wpisano
        ...(form.name_pl ? { name_pl: form.name_pl } : {}),
        ...(form.name_en ? { name_en: form.name_en } : {}),
        ...(form.description_pl ? { description_pl: form.description_pl } : {}),
        ...(form.description_en ? { description_en: form.description_en } : {}),
      };

      const created = await adminCreateEvent(payload);
      setEvents(v=>[...v, created].sort((a,b)=>new Date(a.start_time)-new Date(b.start_time)));
      setForm({
        name:'', description:'',
        start_time:'', end_time:'',
        category: mode==='public'?'concert':'party',
        is_public: mode==='public',
        team_id:'', location_id:'',
        name_pl:'', name_en:'', description_pl:'', description_en:''
      });
      setOk('Dodano wydarzenie ✅');
      setTimeout(()=>setOk(''), 1500);
    }catch(e){
      console.error(e);
      setErr('Błąd tworzenia');
    }
  };

  const startEdit = (ev)=>{
    setEditId(ev.id);
    setEdit({
      name: ev.name,
      category: ev.category,
      start_time: toInputDT(ev.start_time),
      end_time: toInputDT(ev.end_time),
      description: ev.description || '',
      location_id: ev.location_id || '',
      team_id: ev.team_id || '',
      // i18n — jeśli backend zwraca, pokaż; jeśli nie, zostaw puste
      name_pl: ev.name_pl || '',
      name_en: ev.name_en || '',
      description_pl: ev.description_pl || '',
      description_en: ev.description_en || ''
    });
  };

  const saveEdit = async (id)=>{
    setErr(''); setOk('');
    try{
      const payload = {
        name: edit.name,
        category: edit.category,
        start_time: edit.start_time ? new Date(edit.start_time).toISOString() : null,
        end_time: edit.end_time ? new Date(edit.end_time).toISOString() : null,
        description: edit.description,
        location_id: edit.location_id ? Number(edit.location_id) : null,
        team_id: edit.team_id ? Number(edit.team_id) : null,
        ...(edit.name_pl ? { name_pl: edit.name_pl } : {}),
        ...(edit.name_en ? { name_en: edit.name_en } : {}),
        ...(edit.description_pl ? { description_pl: edit.description_pl } : {}),
        ...(edit.description_en ? { description_en: edit.description_en } : {}),
      };
      const upd = await adminUpdateEvent(id, payload);
      setEvents(v=>v.map(x=>x.id===id? upd : x));
      setEditId(null);
      setOk('Zapisano ✅');
      setTimeout(()=>setOk(''), 1200);
    }catch(e){
      console.error(e);
      setErr('Błąd zapisu (sprawdź kategorie vs tryb)');
    }
  };

  const remove = async (id)=>{
    if (!confirm('Usunąć to wydarzenie?')) return;
    setErr(''); setOk('');
    try{
      await adminDeleteEvent(id);
      setEvents(v=>v.filter(x=>x.id!==id));
      setOk('Usunięto ✅');
      setTimeout(()=>setOk(''), 1200);
    }catch{ setErr('Błąd usuwania'); }
  };

  return (
    <>
      <h2>Wydarzenia (admin)</h2>

      <div className="card" style={{maxWidth:920, marginInline:'auto', textAlign:'left'}}>
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
          </div><br/>

          {mode==='team' && (
            <>
              <label>Zespół<br/>
                <select value={form.team_id} onChange={e=>setForm(f=>({...f,team_id:e.target.value}))} required>
                  <option value="">— wybierz —</option>
                  {teams.map(t=> <option key={t.id} value={t.id}>{t.name} ({t.slug})</option>)}
                </select>
              </label><br/><br/>
            </>
          )}

          <label>Nazwa<br/>
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required/>
          </label><br/><br/>

          <details>
            <summary>Tłumaczenia (PL/EN) — opcjonalnie</summary>
            <div style={{display:'grid', gap:8, marginTop:8}}>
              <label>Tytuł (PL)<br/>
                <input value={form.name_pl} onChange={e=>setForm(f=>({...f,name_pl:e.target.value}))}/>
              </label>
              <label>Opis (PL)<br/>
                <textarea value={form.description_pl} onChange={e=>setForm(f=>({...f,description_pl:e.target.value}))}/>
              </label>
              <label>Title (EN)<br/>
                <input value={form.name_en} onChange={e=>setForm(f=>({...f,name_en:e.target.value}))}/>
              </label>
              <label>Description (EN)<br/>
                <textarea value={form.description_en} onChange={e=>setForm(f=>({...f,description_en:e.target.value}))}/>
              </label>
            </div>
          </details><br/>

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
            <select value={form.location_id} onChange={e=>setForm(f=>({...f,location_id:e.target.value}))}>
              <option value="">— brak —</option>
              {locations.map(l=> <option key={l.id} value={l.id}>{l.name} ({l.type})</option>)}
            </select>
          </label><br/><br/>

          <label>Opis (opcjonalnie)<br/>
            <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
          </label><br/><br/>

          <button className="btn">Dodaj</button>
          {err && <p style={{color:'crimson'}}>{err}</p>}
          {ok && <p style={{color:'green'}}>{ok}</p>}
        </form>
      </div>

      <div style={{marginTop:16}}>
        {events.map(ev=>(
          <div className="card" key={ev.id} style={{textAlign:'left'}}>
            {editId===ev.id ? (
              <>
                <b>Edytuj: #{ev.id}</b><br/><br/>
                <label>Nazwa<br/>
                  <input value={edit.name} onChange={e=>setEdit(f=>({...f,name:e.target.value}))}/>
                </label><br/><br/>

                <details>
                  <summary>Tłumaczenia (PL/EN) — opcjonalnie</summary>
                  <div style={{display:'grid', gap:8, marginTop:8}}>
                    <label>Tytuł (PL)<br/>
                      <input value={edit.name_pl} onChange={e=>setEdit(f=>({...f,name_pl:e.target.value}))}/>
                    </label>
                    <label>Opis (PL)<br/>
                      <textarea value={edit.description_pl} onChange={e=>setEdit(f=>({...f,description_pl:e.target.value}))}/>
                    </label>
                    <label>Title (EN)<br/>
                      <input value={edit.name_en} onChange={e=>setEdit(f=>({...f,name_en:e.target.value}))}/>
                    </label>
                    <label>Description (EN)<br/>
                      <textarea value={edit.description_en} onChange={e=>setEdit(f=>({...f,description_en:e.target.value}))}/>
                    </label>
                  </div>
                </details><br/>

                <label>Kategoria<br/>
                  <select value={edit.category} onChange={e=>setEdit(f=>({...f,category:e.target.value}))}>
                    {(ev.team_id?TEAM_CATEGORIES:PUBLIC_CATEGORIES).map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </label><br/><br/>
                <label>Start<br/>
                  <input type="datetime-local" value={edit.start_time} onChange={e=>setEdit(f=>({...f,start_time:e.target.value}))}/>
                </label><br/><br/>
                <label>Koniec<br/>
                  <input type="datetime-local" value={edit.end_time} onChange={e=>setEdit(f=>({...f,end_time:e.target.value}))}/>
                </label><br/><br/>
                <label>Lokalizacja<br/>
                  <select value={edit.location_id} onChange={e=>setEdit(f=>({...f,location_id:e.target.value}))}>
                    <option value="">— brak —</option>
                    {locations.map(l=> <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </label><br/><br/>
                <label>Opis<br/>
                  <textarea value={edit.description} onChange={e=>setEdit(f=>({...f,description:e.target.value}))}/>
                </label><br/><br/>

                <div style={{display:'flex', gap:8}}>
                  <button type="button" className="btn" onClick={()=>saveEdit(ev.id)}>Zapisz</button>
                  <button type="button" className="btn" onClick={()=>setEditId(null)}>Anuluj</button>
                </div>
              </>
            ) : (
              <div style={{display:'grid', gridTemplateColumns:'1fr auto', gap:12, alignItems:'center'}}>
                <div>
                  <b>{ev.name}</b> {ev.team_name ? <small>• {ev.team_name}</small> : <small>• PUBLIC</small>}<br/>
                  <small>
                    {new Date(ev.start_time).toLocaleString()}
                    {ev.end_time ? ` – ${new Date(ev.end_time).toLocaleString()}`:''}
                  </small><br/>
                  <small>kategoria: {ev.category} • lokacja: {ev.location_name || '—'}</small>
                </div>
                <div style={{display:'flex', gap:8}}>
                  <button className="btn" onClick={()=>startEdit(ev)}>Edytuj</button>
                  <button className="btn" onClick={()=>remove(ev.id)}>Usuń</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

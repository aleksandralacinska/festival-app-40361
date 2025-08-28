// client/src/pages/admin/AdminEvents.jsx
import React, { useEffect, useState } from 'react';
import { fetchPublicEvents } from '../../services/events';
import { adminCreateEvent, adminUpdateEvent } from '../../services/admin';

export default function AdminEvents(){
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    name:'', start_time:'', end_time:'', description:'', category:'concert', is_public:true
  });
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  useEffect(()=>{
    fetchPublicEvents()
      .then(setEvents)
      .catch(()=>setErr('Błąd listy'));
  }, []);

  const create = async (e)=>{
    e.preventDefault();
    setErr(''); setOk('');
    try{
      const created = await adminCreateEvent(form);
      setEvents(v=>[...v, created]);
      setForm({ name:'', start_time:'', end_time:'', description:'', category:'concert', is_public:true });
      setOk('Dodano wydarzenie ✅');
      setTimeout(()=>setOk(''), 2000);
    }catch(e){
      console.error('create event error:', e);
      setErr('Błąd tworzenia');
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

      <div className="card">
        <form onSubmit={create}>
          <label>Nazwa<br/>
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required/>
          </label><br/><br/>

          <label>Kategoria<br/>
            <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
              <option value="concert">concert</option>
              <option value="parade">parade</option>
              <option value="ceremony">ceremony</option>
              <option value="fireworks">fireworks</option>
            </select>
          </label><br/><br/>

          <label>Start<br/>
            <input type="datetime-local" value={form.start_time} onChange={e=>setForm(f=>({...f,start_time:e.target.value}))} required/>
          </label><br/><br/>

          <label>Koniec<br/>
            <input type="datetime-local" value={form.end_time} onChange={e=>setForm(f=>({...f,end_time:e.target.value}))}/>
          </label><br/><br/>

          <label>Opis<br/>
            <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
          </label><br/><br/>

          <label>Publiczne&nbsp;
            <input type="checkbox" checked={form.is_public} onChange={e=>setForm(f=>({...f,is_public:e.target.checked}))}/>
          </label><br/><br/>

          <button className="btn">Dodaj</button>
          {err && <p style={{color:'crimson'}}>{err}</p>}
          {ok && <p style={{color:'green'}}>{ok}</p>}
        </form>
      </div>

      <div style={{marginTop:16}}>
        {events.map(ev=>(
          <div className="card" key={ev.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <b>{ev.name}</b><br/>
              <small>{new Date(ev.start_time).toLocaleString()}</small>
            </div>
            <div>
              <button className="btn" onClick={()=>quickPublish(ev)}>Publikuj</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

import React, { useEffect, useState } from 'react';
import { fetchLocations } from '../../services/locations';
import { adminCreateLocation } from '../../services/admin';

export default function AdminLocations(){
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ name:'', type:'info', lat:'', lng:'', description:'' });

  useEffect(()=>{ fetchLocations().then(setList).catch(()=>setErr('Błąd listy')); }, []);

  const create = async (e)=>{
    e.preventDefault(); setErr('');
    try{
      const loc = await adminCreateLocation({ ...form, lat: Number(form.lat), lng: Number(form.lng) });
      setList(v=>[...v, loc]);
      setForm({ name:'', type:'info', lat:'', lng:'', description:'' });
    }catch{ setErr('Błąd tworzenia'); }
  };

  return (
    <>
      <h2>Lokalizacje (admin)</h2>
      <div className="card" style={{maxWidth:860, marginInline:'auto', textAlign:'left'}}>
        <form onSubmit={create}>
          <label>Nazwa<br/><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required/></label><br/><br/>
          <label>Typ<br/>
            <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
              <option>stage</option><option>hotel</option><option>info</option>
              <option>parade</option><option>rehearsal</option><option>attraction</option>
            </select>
          </label><br/><br/>
          <label>Lat<br/><input value={form.lat} onChange={e=>setForm(f=>({...f,lat:e.target.value}))} required/></label><br/><br/>
          <label>Lng<br/><input value={form.lng} onChange={e=>setForm(f=>({...f,lng:e.target.value}))} required/></label><br/><br/>
          <label>Opis (opcjonalnie)<br/><textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></label><br/><br/>
          <button className="btn">Dodaj</button>
          {err && <p style={{color:'crimson'}}>{err}</p>}
        </form>
      </div>

      <div style={{marginTop:16}}>
        {list.map(l=>(
          <div className="card" key={l.id} style={{textAlign:'left'}}>
            <b>{l.name}</b> <small>({l.type})</small><br/>
            <small>{l.lat}, {l.lng}</small>
          </div>
        ))}
      </div>
    </>
  );
}

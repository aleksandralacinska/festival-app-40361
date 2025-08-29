import React, { useState } from 'react';
import { adminCreateTeam } from '../../services/admin';

export default function AdminTeamsCreate(){
  const [form, setForm] = useState({ name:'', slug:'', country:'' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const submit = async (e)=>{
    e.preventDefault(); setMsg(''); setErr('');
    try{
      const body = { name: form.name.trim(), slug: form.slug.trim(), country: form.country || null };
      await adminCreateTeam(body);
      setMsg('Dodano zespół ✅');
      setForm({ name:'', slug:'', country:'' });
    }catch(e){
      console.error(e);
      setErr('Błąd dodawania zespołu (sprawdź unikalność slug).');
    }
  };

  return (
    <>
      <h2>Dodaj zespół</h2>
      <div className="card" style={{maxWidth:640, marginInline:'auto'}}>
        <form onSubmit={submit}>
          <label>Pełna nazwa<br/>
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required/>
          </label><br/><br/>
          <label>Slug (krótka nazwa — do logowania, unikalna)<br/>
            <input value={form.slug} onChange={e=>setForm(f=>({...f,slug:e.target.value.toLowerCase()}))} required/>
          </label><br/><br/>
          <label>Kraj (opcjonalnie)<br/>
            <input value={form.country} onChange={e=>setForm(f=>({...f,country:e.target.value}))}/>
          </label><br/><br/>

          <button className="btn">Zapisz</button>
          {msg && <p style={{color:'green'}}>{msg}</p>}
          {err && <p style={{color:'crimson'}}>{err}</p>}
        </form>
      </div>
    </>
  );
}

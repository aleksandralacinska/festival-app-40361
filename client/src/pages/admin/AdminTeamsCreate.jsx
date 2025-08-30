import React, { useEffect, useState } from 'react';
import { adminCreateTeam, adminGetTeams, adminUpdateTeam, adminDeleteTeam } from '../../services/admin';

export default function AdminTeamsCreate(){
  const [form, setForm] = useState({ name:'', slug:'', country:'' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [teams, setTeams] = useState([]);
  const [editId, setEditId] = useState(null);
  const [edit, setEdit] = useState({});

  const load = async ()=> {
    setErr('');
    try { setTeams(await adminGetTeams()); }
    catch { setErr('Błąd pobierania zespołów'); }
  };

  useEffect(()=>{ load(); }, []);

  const submit = async (e)=>{
    e.preventDefault(); setMsg(''); setErr('');
    try{
      await adminCreateTeam({
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase(),
        country: form.country || null
      });
      setMsg('Dodano zespół ✅');
      setForm({ name:'', slug:'', country:'' });
      await load();
      setTimeout(()=>setMsg(''), 1500);
    }catch(e){
      setErr(e?.status===409 ? 'Slug zajęty' : 'Błąd dodawania zespołu');
    }
  };

  const startEdit = (t)=>{
    setEditId(t.id);
    setEdit({ name: t.name, slug: t.slug, country: t.country || '' });
  };

  const saveEdit = async (id)=>{
    setErr(''); setMsg('');
    try{
      await adminUpdateTeam(id, { ...edit, slug: edit.slug.trim().toLowerCase() });
      setEditId(null);
      await load();
      setMsg('Zapisano ✅');
      setTimeout(()=>setMsg(''), 1200);
    }catch(e){
      setErr(e?.status===409 ? 'Slug zajęty' : 'Błąd zapisu');
    }
  };

  const remove = async (id)=>{
    if (!confirm('Usunąć zespół? (wydarzenia utracą przypisanie do zespołu)')) return;
    setErr(''); setMsg('');
    try{
      await adminDeleteTeam(id);
      await load();
      setMsg('Usunięto ✅');
      setTimeout(()=>setMsg(''), 1200);
    }catch{ setErr('Błąd usuwania'); }
  };

  return (
    <>
      <h2>Zespoły — dodaj / edytuj / usuń</h2>

      <div className="card" style={{maxWidth:720, marginInline:'auto', textAlign:'left'}}>
        <form onSubmit={submit}>
          <label>Pełna nazwa<br/>
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required/>
          </label><br/><br/>
          <label>Slug (unikalny, do logowania)<br/>
            <input value={form.slug} onChange={e=>setForm(f=>({...f,slug:e.target.value}))} required/>
          </label><br/><br/>
          <label>Kraj (opcjonalnie)<br/>
            <input value={form.country} onChange={e=>setForm(f=>({...f,country:e.target.value}))}/>
          </label><br/><br/>
          <button className="btn">Dodaj</button>
          {msg && <p style={{color:'green'}}>{msg}</p>}
          {err && <p style={{color:'crimson'}}>{err}</p>}
        </form>
      </div>

      <div style={{marginTop:16}}>
        {teams.map(t=>(
          <div className="card" key={t.id} style={{textAlign:'left', display:'grid', gridTemplateColumns:'1fr auto', gap:12, alignItems:'center'}}>
            {editId===t.id ? (
              <div>
                <b>Edytuj zespół</b><br/><br/>
                <label>Nazwa<br/><input value={edit.name} onChange={e=>setEdit(f=>({...f,name:e.target.value}))}/></label><br/><br/>
                <label>Slug<br/><input value={edit.slug} onChange={e=>setEdit(f=>({...f,slug:e.target.value}))}/></label><br/><br/>
                <label>Kraj<br/><input value={edit.country} onChange={e=>setEdit(f=>({...f,country:e.target.value}))}/></label><br/><br/>
                <div style={{display:'flex', gap:8}}>
                  <button className="btn" type="button" onClick={()=>saveEdit(t.id)}>Zapisz</button>
                  <button className="btn" type="button" onClick={()=>setEditId(null)}>Anuluj</button>
                </div>
              </div>
            ) : (
              <div>
                <b>{t.name}</b> <small>({t.slug})</small><br/>
                {t.country && <small>{t.country}</small>}
              </div>
            )}
            <div style={{display:'flex', gap:8}}>
              {editId!==t.id && <button className="btn" onClick={()=>startEdit(t)}>Edytuj</button>}
              <button className="btn" onClick={()=>remove(t.id)}>Usuń</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

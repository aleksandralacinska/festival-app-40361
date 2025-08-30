import React, { useEffect, useState } from 'react';
import { fetchLocations } from '../../services/locations';
import { adminCreateLocation, adminUpdateLocation, adminDeleteLocation } from '../../services/admin';

export default function AdminLocations(){
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({
    // bazowe
    name:'', description:'',
    type:'info', lat:'', lng:'',
    // i18n (opcjonalnie)
    name_pl:'', name_en:'',
    description_pl:'', description_en:''
  });

  const [editId, setEditId] = useState(null);
  const [edit, setEdit] = useState({});

  useEffect(()=>{ fetchLocations().then(setList).catch(()=>setErr('Błąd listy')); }, []);

  const create = async (e)=>{
    e.preventDefault(); setErr('');
    try{
      const payload = {
        name: (form.name || form.name_pl || form.name_en || '').trim(),
        description: form.description || form.description_pl || form.description_en || '',
        type: form.type,
        lat: Number(form.lat),
        lng: Number(form.lng),
        // wyślij i18n tylko jeśli są
        ...(form.name_pl ? { name_pl: form.name_pl } : {}),
        ...(form.name_en ? { name_en: form.name_en } : {}),
        ...(form.description_pl ? { description_pl: form.description_pl } : {}),
        ...(form.description_en ? { description_en: form.description_en } : {}),
      };

      const loc = await adminCreateLocation(payload);
      setList(v=>[...v, loc]);
      setForm({
        name:'', description:'', type:'info', lat:'', lng:'',
        name_pl:'', name_en:'', description_pl:'', description_en:''
      });
    }catch{
      setErr('Błąd tworzenia');
    }
  };

  const startEdit = (l)=>{
    setEditId(l.id);
    setEdit({
      name: l.name,
      type: l.type,
      lat: l.lat,
      lng: l.lng,
      description: l.description || '',
      // jeżeli backend zacznie zwracać i18n, pokażemy je; inaczej zostaną puste
      name_pl: l.name_pl || '',
      name_en: l.name_en || '',
      description_pl: l.description_pl || '',
      description_en: l.description_en || ''
    });
  };

  const saveEdit = async (id)=>{
    try{
      const upd = await adminUpdateLocation(id, {
        name: edit.name,
        type: edit.type,
        lat: Number(edit.lat),
        lng: Number(edit.lng),
        description: edit.description,
        ...(edit.name_pl ? { name_pl: edit.name_pl } : {}),
        ...(edit.name_en ? { name_en: edit.name_en } : {}),
        ...(edit.description_pl ? { description_pl: edit.description_pl } : {}),
        ...(edit.description_en ? { description_en: edit.description_en } : {}),
      });
      setList(v=>v.map(x=>x.id===id? upd : x));
      setEditId(null);
    }catch{
      setErr('Błąd zapisu');
    }
  };

  const remove = async (id)=>{
    if (!confirm('Usunąć lokalizację? (wydarzenia stracą powiązanie)')) return;
    try{
      await adminDeleteLocation(id);
      setList(v=>v.filter(x=>x.id!==id));
    }catch{ setErr('Błąd usuwania'); }
  };

  return (
    <>
      <h2>Lokalizacje (admin)</h2>

      <div className="card" style={{maxWidth:860, marginInline:'auto', textAlign:'left'}}>
        <form onSubmit={create}>
          <label>Nazwa<br/>
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required/>
          </label><br/><br/>

          <details>
            <summary>Tłumaczenia (PL/EN) — opcjonalnie</summary>
            <div style={{display:'grid', gap:8, marginTop:8}}>
              <label>Nazwa (PL)<br/>
                <input value={form.name_pl} onChange={e=>setForm(f=>({...f,name_pl:e.target.value}))}/>
              </label>
              <label>Opis (PL)<br/>
                <textarea value={form.description_pl} onChange={e=>setForm(f=>({...f,description_pl:e.target.value}))}/>
              </label>
              <label>Name (EN)<br/>
                <input value={form.name_en} onChange={e=>setForm(f=>({...f,name_en:e.target.value}))}/>
              </label>
              <label>Description (EN)<br/>
                <textarea value={form.description_en} onChange={e=>setForm(f=>({...f,description_en:e.target.value}))}/>
              </label>
            </div>
          </details><br/>

          <label>Typ<br/>
            <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
              <option>stage</option><option>hotel</option><option>info</option>
              <option>parade</option><option>rehearsal</option><option>attraction</option>
            </select>
          </label><br/><br/>

          <label>Lat<br/>
            <input value={form.lat} onChange={e=>setForm(f=>({...f,lat:e.target.value}))} required/>
          </label><br/><br/>
          <label>Lng<br/>
            <input value={form.lng} onChange={e=>setForm(f=>({...f,lng:e.target.value}))} required/>
          </label><br/><br/>

          <label>Opis (opcjonalnie)<br/>
            <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
          </label><br/><br/>

          <button className="btn">Dodaj</button>
          {err && <p style={{color:'crimson'}}>{err}</p>}
        </form>
      </div>

      <div style={{marginTop:16}}>
        {list.map(l=>(
          <div className="card" key={l.id} style={{textAlign:'left'}}>
            {editId===l.id ? (
              <>
                <b>Edytuj: {l.name}</b><br/><br/>

                <label>Nazwa<br/>
                  <input value={edit.name} onChange={e=>setEdit(f=>({...f,name:e.target.value}))}/>
                </label><br/><br/>

                <details>
                  <summary>Tłumaczenia (PL/EN) — opcjonalnie</summary>
                  <div style={{display:'grid', gap:8, marginTop:8}}>
                    <label>Nazwa (PL)<br/>
                      <input value={edit.name_pl} onChange={e=>setEdit(f=>({...f,name_pl:e.target.value}))}/>
                    </label>
                    <label>Opis (PL)<br/>
                      <textarea value={edit.description_pl} onChange={e=>setEdit(f=>({...f,description_pl:e.target.value}))}/>
                    </label>
                    <label>Name (EN)<br/>
                      <input value={edit.name_en} onChange={e=>setEdit(f=>({...f,name_en:e.target.value}))}/>
                    </label>
                    <label>Description (EN)<br/>
                      <textarea value={edit.description_en} onChange={e=>setEdit(f=>({...f,description_en:e.target.value}))}/>
                    </label>
                  </div>
                </details><br/>

                <label>Typ<br/>
                  <select value={edit.type} onChange={e=>setEdit(f=>({...f,type:e.target.value}))}>
                    <option>stage</option><option>hotel</option><option>info</option>
                    <option>parade</option><option>rehearsal</option><option>attraction</option>
                  </select>
                </label><br/><br/>

                <label>Lat<br/>
                  <input value={edit.lat} onChange={e=>setEdit(f=>({...f,lat:e.target.value}))}/>
                </label><br/><br/>
                <label>Lng<br/>
                  <input value={edit.lng} onChange={e=>setEdit(f=>({...f,lng:e.target.value}))}/>
                </label><br/><br/>

                <label>Opis<br/>
                  <textarea value={edit.description} onChange={e=>setEdit(f=>({...f,description:e.target.value}))}/>
                </label><br/><br/>

                <div style={{display:'flex', gap:8}}>
                  <button type="button" className="btn" onClick={()=>saveEdit(l.id)}>Zapisz</button>
                  <button type="button" className="btn" onClick={()=>setEditId(null)}>Anuluj</button>
                </div>
              </>
            ) : (
              <div style={{display:'grid', gridTemplateColumns:'1fr auto', gap:12, alignItems:'center'}}>
                <div>
                  <b>{l.name}</b> <small>({l.type})</small><br/>
                  <small>{l.lat}, {l.lng}</small><br/>
                  {l.description && <small>{l.description}</small>}
                </div>
                <div style={{display:'flex', gap:8}}>
                  <button className="btn" onClick={()=>startEdit(l)}>Edytuj</button>
                  <button className="btn" onClick={()=>remove(l.id)}>Usuń</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

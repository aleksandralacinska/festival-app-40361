import React, { useState } from 'react';
import { adminLogin, setAdminToken } from '../../services/admin';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin(){
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();

  const onSubmit = async (e)=>{
    e.preventDefault(); setErr('');
    try{
      const { token } = await adminLogin(user, pass);
      setAdminToken(token);
      nav('/admin/events');
    }catch{ setErr('Błędne dane admina'); }
  };

  return (
    <>
      <h2>Logowanie admin</h2>
      <div className="card">
        <form onSubmit={onSubmit}>
          <label>Użytkownik<br/><input value={user} onChange={e=>setUser(e.target.value)} /></label><br/><br/>
          <label>Hasło<br/><input type="password" value={pass} onChange={e=>setPass(e.target.value)} /></label><br/><br/>
          <button className="btn">Zaloguj</button>
          {err && <p style={{color:'crimson'}}>{err}</p>}
        </form>
      </div>
    </>
  );
}

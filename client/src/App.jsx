import React from 'react';
import { useEffect, useState } from 'react';
import './App.css';
import { getHealth } from './services/api';

function App() {
  const [status, setStatus] = useState('checking...');

  useEffect(() => {
    getHealth()
      .then((d) => setStatus(`${d.status} – ${d.service}`))
      .catch(() => setStatus('api error'));
  }, []);

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif', padding: 24 }}>
      <h1>Festival PWA</h1>
      <p>API status: {status}</p>
    </div>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import './App.css';
import { getHealth } from './services/api';

import HomePage from './pages/HomePage';
import SchedulePage from './pages/SchedulePage';
import EventDetailsPage from './pages/EventDetailsPage';
import MapPage from './pages/MapPage';
import TeamPage from './pages/TeamPage';
import SettingsPage from './pages/SettingsPage';

const Nav = () => (
  <nav className="bottom-nav">
    <NavLink to="/" end>Start</NavLink>
    <NavLink to="/schedule">Harmonogram</NavLink>
    <NavLink to="/map">Mapa</NavLink>
    <NavLink to="/team">Zespół</NavLink>
    <NavLink to="/settings">Ustawienia</NavLink>
  </nav>
);

export default function App() {
  const [status, setStatus] = useState('checking...');

  useEffect(() => {
    getHealth()
      .then((d) => setStatus(`${d.status} – ${d.service}`))
      .catch(() => setStatus('api error'));
  }, []);

  return (
    <BrowserRouter>
      <div className="container" style={{ paddingBottom: 64 }}>
        <header className="card" style={{ marginBottom: 16 }}>
          <h1 style={{ color: 'var(--primary)', marginBottom: 8 }}>Festival PWA</h1>
          <p style={{ margin: 0, color: 'var(--gray-700)' }}>API status: {status}</p>
        </header>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/event/:id" element={<EventDetailsPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
      <Nav />
    </BrowserRouter>
  );
}

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

import AdminLogin from './pages/admin/AdminLogin';
import AdminEvents from './pages/admin/AdminEvents';
import AdminLocations from './pages/admin/AdminLocations';
import AdminTeamsPin from './pages/admin/AdminTeamsPin';
import AdminPush from './pages/admin/AdminPush';

const Nav = () => (
  <nav className="bottom-nav" aria-label="Nawigacja dolna">
    <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)} aria-label="Start" title="Start">
      <i className="fa-solid fa-house" aria-hidden="true" />
      <span className="sr-only">Start</span>
    </NavLink>
    <NavLink to="/schedule" className={({ isActive }) => (isActive ? 'active' : undefined)} aria-label="Harmonogram" title="Harmonogram">
      <i className="fa-solid fa-calendar-days" aria-hidden="true" />
      <span className="sr-only">Harmonogram</span>
    </NavLink>
    <NavLink to="/map" className={({ isActive }) => (isActive ? 'active' : undefined)} aria-label="Mapa" title="Mapa">
      <i className="fa-solid fa-map-location-dot" aria-hidden="true" />
      <span className="sr-only">Mapa</span>
    </NavLink>
    <NavLink to="/team" className={({ isActive }) => (isActive ? 'active' : undefined)} aria-label="Zespół" title="Zespół">
      <i className="fa-solid fa-circle-user" aria-hidden="true" />
      <span className="sr-only">Zespół</span>
    </NavLink>
    <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : undefined)} aria-label="Ustawienia" title="Ustawienia">
      <i className="fa-solid fa-screwdriver-wrench" aria-hidden="true" />
      <span className="sr-only">Ustawienia</span>
    </NavLink>
  </nav>
);

export default function App() {
  const [status, setStatus] = useState('checking...');
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    getHealth()
      .then((d) => setStatus(`${d.status} – ${d.service}`))
      .catch(() => setStatus('api error'));
  }, []);

  // Reaktywny status offline/online
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="container" style={{ paddingBottom: 80 }}>
        {/* BANER OFFLINE */}
        {!online && (
          <div
            role="status"
            aria-live="polite"
            style={{
              background: '#ffe08a',
              color: '#000',
              padding: 8,
              borderRadius: 8,
              margin: '12px 0'
            }}
          >
            Jesteś offline — część danych może być niedostępna.
          </div>
        )}

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
          <Route path="/admin" element={<AdminLogin />} />
          
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/locations" element={<AdminLocations />} />
          <Route path="/admin/teams/pin" element={<AdminTeamsPin />} />
          <Route path="/admin/push" element={<AdminPush />} />
        </Routes>
      </div>
      <Nav />
    </BrowserRouter>
  );
}

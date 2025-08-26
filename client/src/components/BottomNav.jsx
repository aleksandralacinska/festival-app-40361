import React from 'react';
import { NavLink } from 'react-router-dom';

export default function BottomNav() {
  const items = [
    { to: '/',           icon: 'fa-solid fa-house',             label: 'Start' },
    { to: '/schedule',   icon: 'fa-solid fa-calendar-days',     label: 'Harmonogram' },
    { to: '/map',        icon: 'fa-solid fa-map-location-dot',  label: 'Mapa' },
    { to: '/team',       icon: 'fa-solid fa-circle-user',       label: 'Zespół' },
    { to: '/settings',   icon: 'fa-solid fa-screwdriver-wrench',label: 'Ustawienia' },
  ];

  return (
    <nav className="bottom-nav" aria-label="Nawigacja dolna">
      {items.map(it => (
        <NavLink
          key={it.to}
          to={it.to}
          className={({ isActive }) => isActive ? 'active' : undefined}
          aria-label={it.label}
          title={it.label}
        >
          <i className={it.icon} aria-hidden="true" />
          {/* ukryty tekst dla dostępności */}
          <span className="sr-only">{it.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

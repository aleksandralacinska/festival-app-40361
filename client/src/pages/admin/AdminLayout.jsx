import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getAdminToken } from '../../services/admin';

export default function AdminLayout() {
  const nav = useNavigate();

  useEffect(() => {
    const t = getAdminToken();
    if (!t) nav('/admin', { replace: true });
  }, [nav]);

  const logout = () => {
    localStorage.removeItem('admin_token');
    nav('/admin', { replace: true });
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <i className="fa-solid fa-toolbox" aria-hidden />
          <span>Admin</span>
        </div>

        <nav className="admin-menu">
          <NavLink to="/admin/events" className="admin-link">
            <i className="fa-solid fa-calendar-days" aria-hidden /> Wydarzenia
          </NavLink>
          <NavLink to="/admin/locations" className="admin-link">
            <i className="fa-solid fa-map-location-dot" aria-hidden /> Lokalizacje
          </NavLink>
          <NavLink to="/admin/teams/create" className="admin-link">
            <i className="fa-solid fa-users" aria-hidden /> Dodaj zespół
          </NavLink>
          <NavLink to="/admin/teams/pin" className="admin-link">
            <i className="fa-solid fa-key" aria-hidden /> Reset PIN
          </NavLink>
          <NavLink to="/admin/push" className="admin-link">
            <i className="fa-solid fa-bell" aria-hidden /> Push
          </NavLink>
        </nav>

        <div style={{ marginTop: 'auto', padding: 16 }}>
          <button className="btn" onClick={logout}>
            <i className="fa-solid fa-right-from-bracket" aria-hidden /> Wyloguj
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

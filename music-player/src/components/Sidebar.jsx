import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/components/Sidebar.css';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  return (
    <aside className="sidebar">
      <h2 className="sidebar-logo">TuneViewer</h2>
      <nav className="sidebar-nav">
        <NavLink to="/" className="nav-item">
          <span>Главная</span>
        </NavLink>
        <NavLink to="/search" className="nav-item">
          <span>Поиск</span>
        </NavLink>
        <NavLink to="/playlists" className="nav-item">
          <span>Плейлисты</span>
        </NavLink>
        <NavLink to="/profile" className="nav-item">
          <span>Профиль</span>
        </NavLink>
        <NavLink to="/about" className="nav-item">
          <span>О нас</span>
        </NavLink>
        {user.isAuthenticated && user.role === 'admin' && (
          <NavLink to="/admin" className="nav-item_admin">
            <span>Админ-панель</span>
          </NavLink>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
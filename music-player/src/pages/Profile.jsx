import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user, login, logout } = useContext(AuthContext);
  const [credentials, setCredentials] = useState({ login: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (credentials.login === 'admin' && credentials.password === 'adminpass') {
      login({ name: 'Админ', email: 'admin@example.com', role: 'admin' });
    } else if (credentials.login === 'user' && credentials.password === 'pass') {
      login({ name: 'Иван Иванов', email: 'ivan@example.com', role: 'user' });
    } else {
      setError('Неверный логин или пароль');
    }
    console.log('Login attempt:', credentials);
  };

  const handleLogout = () => {
    logout();
    setCredentials({ login: '', password: '' });
  };

  if (user.isAuthenticated) {
    return (
      <div className="profile">
        <h2 className="profile-title">Профиль</h2>
        <div className="profile-info">
          <p><strong>Имя:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Роль:</strong> {user.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
          <button className="logout-btn" onClick={handleLogout}>Выйти</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile">
      <h2 className="profile-title">Авторизация</h2>
      <form className="profile-settings" onSubmit={handleLogin}>
        <input
          type="text"
          name="login"
          value={credentials.login}
          onChange={handleChange}
          placeholder="Логин"
          className="profile-input"
        />
        <input
          type="password"
          name="password"
          value={credentials.password}
          onChange={handleChange}
          placeholder="Пароль"
          className="profile-input"
        />
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="save-btn">Войти</button>
      </form>
    </div>
  );
};

export default Profile;
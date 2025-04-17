import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user, login, register, logout, updateProfile, error, setError, isLoading } = useContext(AuthContext);
  
  // State for login form
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  
  // State for registration form
  const [registerForm, setRegisterForm] = useState({ 
    username: '', 
    email: '', 
    password: '',
    passwordConfirm: '',
    display_name: ''
  });
  
  // State for profile update form
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    display_name: '',
    password: '',
    passwordConfirm: '',
  });
  
  // UI state
  const [mode, setMode] = useState('login'); // 'login', 'register', 'profile'
  const [formError, setFormError] = useState('');
  
  // Populate profile form with current user data
  useEffect(() => {
    if (user.isAuthenticated) {
      setProfileForm({
        username: user.username || '',
        email: user.email || '',
        display_name: user.display_name || '',
        password: '',
        passwordConfirm: '',
      });
      
      // Set mode to profile if logged in
      setMode('profile');
    } else {
      setMode('login');
    }
  }, [user]);
  
  // Clear errors when switching modes
  useEffect(() => {
    setError('');
    setFormError('');
  }, [mode]);
  
  // Handle login form change
  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };
  
  // Handle registration form change
  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };
  
  // Handle profile form change
  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };
  
  // Handle login submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Simple validation
    if (!loginForm.username || !loginForm.password) {
      setFormError('Пожалуйста, заполните все поля');
      return;
    }
    
    await login(loginForm);
  };
  
  // Handle registration submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validation
    if (!registerForm.username || !registerForm.email || !registerForm.password) {
      setFormError('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    if (registerForm.password !== registerForm.passwordConfirm) {
      setFormError('Пароли не совпадают');
      return;
    }
    
    // Create user data without passwordConfirm
    const userData = {
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password,
      display_name: registerForm.display_name || registerForm.username,
    };
    
    await register(userData);
  };
  
  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Check if passwords match if provided
    if (profileForm.password && profileForm.password !== profileForm.passwordConfirm) {
      setFormError('Пароли не совпадают');
      return;
    }
    
    // Create update data (omit empty fields and passwordConfirm)
    const updateData = {};
    
    if (profileForm.username && profileForm.username !== user.username) {
      updateData.username = profileForm.username;
    }
    
    if (profileForm.email && profileForm.email !== user.email) {
      updateData.email = profileForm.email;
    }
    
    if (profileForm.display_name && profileForm.display_name !== user.display_name) {
      updateData.display_name = profileForm.display_name;
    }
    
    if (profileForm.password) {
      updateData.password = profileForm.password;
    }
    
    // Only update if there are changes
    if (Object.keys(updateData).length > 0) {
      const success = await updateProfile(updateData);
      
      if (success) {
        // Clear password fields
        setProfileForm({
          ...profileForm,
          password: '',
          passwordConfirm: '',
        });
      }
    } else {
      setFormError('Нет изменений для сохранения');
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
  };
  
  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };
  
  // Login form
  const renderLoginForm = () => (
    <motion.div
      key="login-form"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={formVariants}
    >
      <h2 className="profile-title">Авторизация</h2>
      <form className="profile-settings" onSubmit={handleLoginSubmit}>
        <input
          type="text"
          name="username"
          value={loginForm.username}
          onChange={handleLoginChange}
          placeholder="Логин"
          className="profile-input"
          disabled={isLoading}
        />
        <input
          type="password"
          name="password"
          value={loginForm.password}
          onChange={handleLoginChange}
          placeholder="Пароль"
          className="profile-input"
          disabled={isLoading}
        />
        
        {/* Show errors */}
        {(formError || error) && (
          <p className="error-message">{formError || error}</p>
        )}
        
        <button 
          type="submit" 
          className="save-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Вход...' : 'Войти'}
        </button>
        
        <p className="switch-mode">
          Еще нет аккаунта?{' '}
          <span className="mode-link" onClick={() => setMode('register')}>
            Зарегистрироваться
          </span>
        </p>
      </form>
    </motion.div>
  );
  
  // Registration form
  const renderRegisterForm = () => (
    <motion.div
      key="register-form"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={formVariants}
    >
      <h2 className="profile-title">Регистрация</h2>
      <form className="profile-settings" onSubmit={handleRegisterSubmit}>
        <input
          type="text"
          name="username"
          value={registerForm.username}
          onChange={handleRegisterChange}
          placeholder="Логин *"
          className="profile-input"
          disabled={isLoading}
          required
        />
        <input
          type="email"
          name="email"
          value={registerForm.email}
          onChange={handleRegisterChange}
          placeholder="Email *"
          className="profile-input"
          disabled={isLoading}
          required
        />
        <input
          type="text"
          name="display_name"
          value={registerForm.display_name}
          onChange={handleRegisterChange}
          placeholder="Отображаемое имя"
          className="profile-input"
          disabled={isLoading}
        />
        <input
          type="password"
          name="password"
          value={registerForm.password}
          onChange={handleRegisterChange}
          placeholder="Пароль *"
          className="profile-input"
          disabled={isLoading}
          required
        />
        <input
          type="password"
          name="passwordConfirm"
          value={registerForm.passwordConfirm}
          onChange={handleRegisterChange}
          placeholder="Подтверждение пароля *"
          className="profile-input"
          disabled={isLoading}
          required
        />
        
        {/* Show errors */}
        {(formError || error) && (
          <p className="error-message">{formError || error}</p>
        )}
        
        <button 
          type="submit" 
          className="save-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
        
        <p className="switch-mode">
          Уже есть аккаунт?{' '}
          <span className="mode-link" onClick={() => setMode('login')}>
            Войти
          </span>
        </p>
      </form>
    </motion.div>
  );
  
  // Profile form
  const renderProfileForm = () => (
    <motion.div
      key="profile-form"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={formVariants}
    >
      <h2 className="profile-title">Профиль</h2>
      <div className="profile-info">
        <p><strong>Имя:</strong> {user.display_name || user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Роль:</strong> {user.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
      </div>
      
      <h3 className="profile-subtitle">Изменить данные</h3>
      <form className="profile-settings" onSubmit={handleProfileUpdate}>
        <input
          type="text"
          name="username"
          value={profileForm.username}
          onChange={handleProfileChange}
          placeholder="Логин"
          className="profile-input"
          disabled={isLoading}
        />
        <input
          type="email"
          name="email"
          value={profileForm.email}
          onChange={handleProfileChange}
          placeholder="Email"
          className="profile-input"
          disabled={isLoading}
        />
        <input
          type="text"
          name="display_name"
          value={profileForm.display_name}
          onChange={handleProfileChange}
          placeholder="Отображаемое имя"
          className="profile-input"
          disabled={isLoading}
        />
        <input
          type="password"
          name="password"
          value={profileForm.password}
          onChange={handleProfileChange}
          placeholder="Новый пароль (оставьте пустым, чтобы не менять)"
          className="profile-input"
          disabled={isLoading}
        />
        <input
          type="password"
          name="passwordConfirm"
          value={profileForm.passwordConfirm}
          onChange={handleProfileChange}
          placeholder="Подтверждение нового пароля"
          className="profile-input"
          disabled={isLoading}
        />
        
        {/* Show errors */}
        {(formError || error) && (
          <p className="error-message">{formError || error}</p>
        )}
        
        <div className="button-group">
          <button 
            type="submit" 
            className="save-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
          <button 
            type="button" 
            className="logout-btn" 
            onClick={handleLogout}
            disabled={isLoading}
          >
            Выйти
          </button>
        </div>
      </form>
    </motion.div>
  );
  
  return (
    <div className="profile">
      {mode === 'login' && renderLoginForm()}
      {mode === 'register' && renderRegisterForm()}
      {mode === 'profile' && user.isAuthenticated && renderProfileForm()}
    </div>
  );
};

export default Profile;
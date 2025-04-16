import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ isAuthenticated: false, role: '' });

  const login = (userData) => {
    setUser({ isAuthenticated: true, role: userData.role });
  };

  const logout = () => {
    setUser({ isAuthenticated: false, role: '' });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
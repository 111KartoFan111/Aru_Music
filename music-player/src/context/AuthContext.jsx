import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const API_URL = 'http://127.0.0.1:8000/api/v1';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ isAuthenticated: false, role: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in (token exists)
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Validate token by getting user profile
          const response = await axios.get(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setUser({
            isAuthenticated: true,
            id: response.data.id,
            username: response.data.username,
            email: response.data.email,
            display_name: response.data.display_name,
            role: response.data.role
          });
        } catch (err) {
          console.error('Invalid token:', err);
          localStorage.removeItem('token');
          setUser({ isAuthenticated: false, role: '' });
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuthStatus();
  }, []);

  // Login function
  const login = async (credentials) => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Convert username/password to form data for OAuth2 compatibility
      const formData = new FormData();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);
      
      // Get token
      const response = await axios.post(`${API_URL}/auth/login`, formData);
      const { access_token } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', access_token);
      
      // Get user profile
      const userResponse = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      
      // Update user state
      setUser({
        isAuthenticated: true,
        id: userResponse.data.id,
        username: userResponse.data.username,
        email: userResponse.data.email,
        display_name: userResponse.data.display_name,
        role: userResponse.data.role
      });
      
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Register new user
      await axios.post(`${API_URL}/auth/register`, userData);
      
      // Login with new credentials
      return await login({
        username: userData.username,
        password: userData.password
      });
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser({ isAuthenticated: false, role: '' });
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await axios.put(`${API_URL}/users/me`, userData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Update user state
      setUser({
        ...user,
        username: response.data.username,
        email: response.data.email,
        display_name: response.data.display_name,
      });
      
      return true;
    } catch (err) {
      console.error('Profile update failed:', err);
      setError(err.response?.data?.detail || 'Failed to update profile. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        updateProfile,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Search from './pages/Search';
import Playlists from './pages/Playlists';
import Profile from './pages/Profile';
import About from './pages/About';
import AdminPanel from './pages/AdminPanel';
import { AuthContext } from './context/AuthContext';
import './styles/App.css';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <motion.div 
      className="app-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/admin"
            element={
              user.isAuthenticated && user.role === 'admin' ? (
                <AdminPanel />
              ) : (
                <Navigate to="/profile" />
              )
            }
          />
        </Routes>
      </main>
    </motion.div>
  );
}

export default App;
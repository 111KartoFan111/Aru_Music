import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { AudioContext } from '../context/AudioContext';
import { AuthContext } from '../context/AuthContext';
import '../styles/components/FavoritesList.css';

const API_URL = 'http://127.0.0.1:8000/api/v1';

const FavoritesList = () => {
  const { currentTrack, setCurrentTrack, togglePlayPause, isPlaying } = useContext(AudioContext);
  const { user } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch favorites from API
  const fetchFavorites = async () => {
    if (!user.isAuthenticated) {
      setFavorites([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/favorites`, {
headers: getAuthHeaders()
      });
      
      if (response.data && response.data.items) {
        setFavorites(response.data.items.map(item => item.track));
      } else {
        console.error('Unexpected API response format:', response.data);
        setError('Received unexpected data format from the server');
      }
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
      setError('Failed to load favorites');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch favorites on component mount and when user changes
  useEffect(() => {
    fetchFavorites();
  }, [user.isAuthenticated]);

  // Also update when favorites are added/removed
  useEffect(() => {
    const handleFavoritesUpdate = () => {
      fetchFavorites();
    };

    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, []);

  // Handle track selection
  const handleSelectTrack = (track) => {
    // If current track is selected, toggle play/pause
    if (currentTrack && currentTrack.id === track.id) {
      togglePlayPause();
    } else {
      // Set new track and start playing
      setCurrentTrack(track);
      if (!isPlaying) {
        togglePlayPause();
      }
    }
  };

  // Remove track from favorites
  const removeFromFavorites = async (event, trackId) => {
    event.stopPropagation();
    
    try {
      await axios.delete(`${API_URL}/favorites/${trackId}`, {
headers: getAuthHeaders()
      });
      
      // Update favorites list
      setFavorites(favorites.filter(track => track.id !== trackId));
      
      // Create and dispatch event for other components to update
      const event = new Event('favoritesUpdated');
      window.dispatchEvent(event);
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="favorites-list-container">
        <h3 className="list-title">Избранные треки</h3>
        <p className="loading-state">Загрузка избранных треков...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="favorites-list-container">
        <h3 className="list-title">Избранные треки</h3>
        <p className="error-state">{error}</p>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user.isAuthenticated) {
    return (
      <div className="favorites-list-container">
        <h3 className="list-title">Избранные треки</h3>
        <p className="no-favorites">Войдите в систему, чтобы видеть избранные треки</p>
      </div>
    );
  }

  return (
    <div className="favorites-list-container">
      <h3 className="list-title">Избранные треки</h3>
      
      {favorites.length === 0 ? (
        <p className="no-favorites">У вас пока нет избранных треков</p>
      ) : (
        <motion.div 
          className="favorites-list"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {favorites.map((track) => (
              <motion.div
                key={track.id}
                className={`favorite-item ${currentTrack && currentTrack.id === track.id ? 'active' : ''}`}
                onClick={() => handleSelectTrack(track)}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="track-image">
                <img src={`http://localhost:8000${track.cover_path.replace(/\\/g, '/')}`} alt={track.title} />
                  
                  <div className="play-icon">
                    {currentTrack && currentTrack.id === track.id && isPlaying ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </div>
                </div>
                
                <div className="track-details">
                  <h4 className="track-name">{track.title}</h4>
                  <p className="track-artist">{track.artist}</p>
                </div>
                
                <button 
                  className="remove-favorite-button"
                  onClick={(e) => removeFromFavorites(e, track.id)}
                  aria-label="Удалить из избранного"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default FavoritesList;
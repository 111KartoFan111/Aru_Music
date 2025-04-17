import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { AudioContext } from '../context/AudioContext';
import { AuthContext } from '../context/AuthContext';
import '../styles/components/DislikesList.css';

const API_URL = 'http://127.0.0.1:8000/api/v1';

const DislikesList = () => {
  const { currentTrack, setCurrentTrack, togglePlayPause, isPlaying } = useContext(AudioContext);
  const { user } = useContext(AuthContext);
  const [dislikes, setDislikes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch dislikes from API
  const fetchDislikes = async () => {
    if (!user.isAuthenticated) {
      setDislikes([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/dislikes`, {
        headers: getAuthHeaders()
      });
      
      if (response.data && response.data.items) {
        setDislikes(response.data.items.map(item => item.track));
      } else {
        console.error('Unexpected API response format:', response.data);
        setError('Received unexpected data format from the server');
      }
    } catch (err) {
      console.error('Failed to fetch dislikes:', err);
      setError('Failed to load dislikes');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch dislikes on component mount and when user changes
  useEffect(() => {
    fetchDislikes();
  }, [user.isAuthenticated]);

  // Also update when dislikes are added/removed
  useEffect(() => {
    const handleDislikesUpdate = () => {
      fetchDislikes();
    };

    window.addEventListener('dislikesUpdated', handleDislikesUpdate);
    return () => {
      window.removeEventListener('dislikesUpdated', handleDislikesUpdate);
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

  // Remove track from dislikes
  const removeFromDislikes = async (event, trackId) => {
    event.stopPropagation();
    
    try {
      await axios.delete(`${API_URL}/dislikes/${trackId}`, {
        headers: getAuthHeaders()
      });
      
      // Update dislikes list
      setDislikes(dislikes.filter(track => track.id !== trackId));
      
      // Create and dispatch event for other components to update
      const event = new Event('dislikesUpdated');
      window.dispatchEvent(event);
    } catch (err) {
      console.error('Failed to remove dislike:', err);
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
      <div className="dislikes-list-container">
        <h3 className="list-title">Непонравившиеся треки</h3>
        <p className="loading-state">Загрузка непонравившихся треков...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="dislikes-list-container">
        <h3 className="list-title">Непонравившиеся треки</h3>
        <p className="error-state">{error}</p>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user.isAuthenticated) {
    return (
      <div className="dislikes-list-container">
        <h3 className="list-title">Непонравившиеся треки</h3>
        <p className="no-dislikes">Войдите в систему, чтобы видеть непонравившиеся треки</p>
      </div>
    );
  }

  return (
    <div className="dislikes-list-container">
      <h3 className="list-title">Непонравившиеся треки</h3>
      
      {dislikes.length === 0 ? (
        <p className="no-dislikes">У вас пока нет треков с дизлайком</p>
      ) : (
        <motion.div 
          className="dislikes-list"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {dislikes.map((track) => (
              <motion.div
                key={track.id}
                className={`dislike-item ${currentTrack && currentTrack.id === track.id ? 'active' : ''}`}
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
                  className="remove-dislike-button"
                  onClick={(e) => removeFromDislikes(e, track.id)}
                  aria-label="Убрать дизлайк"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 21l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2z" />
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

export default DislikesList;
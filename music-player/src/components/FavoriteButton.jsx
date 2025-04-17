import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AudioContext } from '../context/AudioContext';
import { AuthContext } from '../context/AuthContext';
import '../styles/components/FavoriteButton.css';

const API_URL = 'http://127.0.0.1:8000/api/v1';

const FavoriteButton = () => {
  const { currentTrack } = useContext(AudioContext);
  const { user } = useContext(AuthContext);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Check if track is in favorites when current track changes
  useEffect(() => {
    if (currentTrack && user.isAuthenticated) {
      // If the track already has the is_favorited property from API
      if (currentTrack.is_favorited !== undefined) {
        setIsFavorite(currentTrack.is_favorited);
      } else {
        // Otherwise, check via API
        checkFavoriteStatus(currentTrack.id);
      }
    } else {
      setIsFavorite(false);
    }
  }, [currentTrack, user.isAuthenticated]);

  // Listen for events from other components
  useEffect(() => {
    const handleFavoritesUpdate = () => {
      if (currentTrack && user.isAuthenticated) {
        checkFavoriteStatus(currentTrack.id);
      }
    };

    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, [currentTrack, user.isAuthenticated]);

  // Check if track is in favorites
  const checkFavoriteStatus = async (trackId) => {
    try {
      const response = await axios.get(`${API_URL}/tracks/${trackId}`, {
        headers: getAuthHeaders()
      });
      
      if (response.data && response.data.is_favorited !== undefined) {
        setIsFavorite(response.data.is_favorited);
        
        // Update the currentTrack object with the latest status
        if (currentTrack) {
          currentTrack.is_favorited = response.data.is_favorited;
        }
      }
    } catch (err) {
      console.error('Failed to check favorite status:', err);
    }
  };

  // Handle adding/removing from favorites
  const handleToggleFavorite = async () => {
    if (!currentTrack || !user.isAuthenticated || isUpdating) return;

    setIsUpdating(true);
    
    try {
      if (isFavorite) {
        // Remove from favorites
        await axios.delete(`${API_URL}/favorites/${currentTrack.id}`, {
          headers: getAuthHeaders()
        });
        
        // Also remove from "Мне нравится" playlist if exists
        try {
          const playlists = await axios.get(`${API_URL}/playlists`, {
            headers: getAuthHeaders()
          });
          
          const likedPlaylist = playlists.data.items.find(p => p.name === "Мне нравится");
          if (likedPlaylist) {
            // Try to remove track from the playlist
            await axios.delete(`${API_URL}/playlists/${likedPlaylist.id}/tracks/${currentTrack.id}`, {
              headers: getAuthHeaders()
            }).catch(e => console.log("Track not in playlist or error:", e));
          }
        } catch (err) {
          console.log("Error handling playlist:", err);
        }
      } else {
        // Add to favorites
        await axios.post(`${API_URL}/favorites/${currentTrack.id}`, {}, {
          headers: getAuthHeaders()
        });
        
        // Add to "Мне нравится" playlist or create it
        try {
          const playlists = await axios.get(`${API_URL}/playlists`, {
            headers: getAuthHeaders()
          });
          
          let likedPlaylist = playlists.data.items.find(p => p.name === "Мне нравится");
          
          // If playlist doesn't exist, create it
          if (!likedPlaylist) {
            const playlistData = {
              name: "Мне нравится",
              description: "Автоматический плейлист избранных треков",
              is_public: true
            };
            
            const newPlaylistResponse = await axios.post(`${API_URL}/playlists`, playlistData, {
              headers: getAuthHeaders()
            });
            
            likedPlaylist = newPlaylistResponse.data;
          }
          
          // Add track to the playlist with the correct structure
          await axios.post(`${API_URL}/playlists/${likedPlaylist.id}/tracks`, 
            { 
              track_id: currentTrack.id,
              position: null  // null will add to the end of playlist
            },
            { headers: getAuthHeaders() }
          ).catch(e => console.log("Track already in playlist or error:", e));
        } catch (err) {
          console.log("Error handling liked playlist:", err);
        }
      }
      
      // Update state
      setIsFavorite(!isFavorite);
      
      // Update currentTrack object
      if (currentTrack) {
        currentTrack.is_favorited = !isFavorite;
      }
      
      // Dispatch event for other components to update
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Button animations
  const buttonVariants = {
    tap: { scale: 0.95 },
    hover: { scale: 1.05 }
  };

  if (!currentTrack) return null;
  
  // If user is not authenticated, show disabled button or login prompt
  if (!user.isAuthenticated) {
    return (
      <motion.button 
        className="favorite-button disabled"
        variants={buttonVariants}
        whileHover="hover"
        aria-label="Login required"
        title="Login to add tracks to favorites"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" />
        </svg>
      </motion.button>
    );
  }

  return (
    <motion.button 
      className={`favorite-button ${isFavorite ? 'active' : ''} ${isUpdating ? 'updating' : ''}`}
      onClick={handleToggleFavorite}
      variants={buttonVariants}
      whileTap="tap"
      whileHover="hover"
      disabled={isUpdating}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      {isFavorite ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" />
        </svg>
      )}
    </motion.button>
  );
};

export default FavoriteButton;
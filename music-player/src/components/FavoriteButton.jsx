import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AudioContext } from '../context/AudioContext';
import { AuthContext } from '../context/AuthContext';
import '../styles/components/FavoriteButton.css';

const FavoriteButton = () => {
  const { currentTrack, toggleFavorite } = useContext(AudioContext);
  const { user } = useContext(AuthContext);
  const [isFavorite, setIsFavorite] = useState(false);

  // Check if track is in favorites when current track changes
  useEffect(() => {
    if (currentTrack && currentTrack.is_favorited !== undefined) {
      setIsFavorite(currentTrack.is_favorited);
    }
  }, [currentTrack]);

  // Listen for events from other components
  useEffect(() => {
    const handleFavoritesUpdate = async () => {
      if (currentTrack) {
        // The toggleFavorite function will already have updated the status
        // This is primarily to sync state between components
        const isFavorited = currentTrack.is_favorited;
        setIsFavorite(isFavorited);
      }
    };

    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, [currentTrack]);

  // Handle adding/removing from favorites
  const handleToggleFavorite = () => {
    if (!currentTrack || !user.isAuthenticated) return;

    toggleFavorite(currentTrack.id);
    // The state will be updated in the effect after the favoritesUpdated event is dispatched
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
        aria-label="Требуется вход в систему"
        title="Войдите, чтобы добавлять треки в избранное"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" />
        </svg>
      </motion.button>
    );
  }

  return (
    <motion.button 
      className={`favorite-button ${isFavorite ? 'active' : ''}`}
      onClick={handleToggleFavorite}
      variants={buttonVariants}
      whileTap="tap"
      whileHover="hover"
      aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
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
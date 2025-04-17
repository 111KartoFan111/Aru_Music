import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AudioContext } from '../context/AudioContext';
import { AuthContext } from '../context/AuthContext';
import '../styles/components/DislikeButton.css';

const DislikeButton = () => {
  const { currentTrack, toggleDislike } = useContext(AudioContext);
  const { user } = useContext(AuthContext);
  const [isDisliked, setIsDisliked] = useState(false);

  // Check if track is disliked when current track changes
  useEffect(() => {
    if (currentTrack && currentTrack.is_disliked !== undefined) {
      setIsDisliked(currentTrack.is_disliked);
    }
  }, [currentTrack]);

  // Listen for events from other components
  useEffect(() => {
    const handleDislikesUpdate = async () => {
      if (currentTrack) {
        // The toggleDislike function will already have updated the status
        // This is primarily to sync state between components
        const isDisliked = currentTrack.is_disliked;
        setIsDisliked(isDisliked);
      }
    };

    window.addEventListener('dislikesUpdated', handleDislikesUpdate);
    return () => {
      window.removeEventListener('dislikesUpdated', handleDislikesUpdate);
    };
  }, [currentTrack]);

  // Handle adding/removing from dislikes
  const handleToggleDislike = () => {
    if (!currentTrack || !user.isAuthenticated) return;

    toggleDislike(currentTrack.id);
    // The state will be updated in the effect after the dislikesUpdated event is dispatched
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
        className="dislike-button disabled"
        variants={buttonVariants}
        whileHover="hover"
        aria-label="Требуется вход в систему"
        title="Войдите, чтобы добавлять треки в дизлайки"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 21l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm0 12l-4.34 4.34L12 14H3v-2l3-7h9v10zm4-12h4v12h-4z" />
        </svg>
      </motion.button>
    );
  }

  return (
    <motion.button 
      className={`dislike-button ${isDisliked ? 'active' : ''}`}
      onClick={handleToggleDislike}
      variants={buttonVariants}
      whileTap="tap"
      whileHover="hover"
      aria-label={isDisliked ? "Убрать дизлайк" : "Добавить дизлайк"}
    >
      {isDisliked ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 21l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 21l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm0 12l-4.34 4.34L12 14H3v-2l3-7h9v10zm4-12h4v12h-4z" />
        </svg>
      )}
    </motion.button>
  );
};

export default DislikeButton;
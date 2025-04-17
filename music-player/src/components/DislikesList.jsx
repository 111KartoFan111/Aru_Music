import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AudioContext } from '../context/AudioContext';
import { AuthContext } from '../context/AuthContext';
import '../styles/components/DislikeButton.css';

const API_URL = 'http://127.0.0.1:8000/api/v1';

const DislikeButton = () => {
  const { currentTrack } = useContext(AudioContext);
  const { user } = useContext(AuthContext);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Check if track is disliked when current track changes
  useEffect(() => {
    if (currentTrack && user.isAuthenticated) {
      // If the track already has the is_disliked property from API
      if (currentTrack.is_disliked !== undefined) {
        setIsDisliked(currentTrack.is_disliked);
      } else {
        // Otherwise, check via API
        checkDislikeStatus(currentTrack.id);
      }
    } else {
      setIsDisliked(false);
    }
  }, [currentTrack, user.isAuthenticated]);

  // Listen for events from other components
  useEffect(() => {
    const handleDislikesUpdate = () => {
      if (currentTrack && user.isAuthenticated) {
        checkDislikeStatus(currentTrack.id);
      }
    };

    window.addEventListener('dislikesUpdated', handleDislikesUpdate);
    return () => {
      window.removeEventListener('dislikesUpdated', handleDislikesUpdate);
    };
  }, [currentTrack, user.isAuthenticated]);

  // Check if track is in dislikes
  const checkDislikeStatus = async (trackId) => {
    try {
      const response = await axios.get(`${API_URL}/tracks/${trackId}`, {
headers: getAuthHeaders()
      });
      
      if (response.data && response.data.is_disliked !== undefined) {
        setIsDisliked(response.data.is_disliked);
        
        // Update the currentTrack object with the latest status
        if (currentTrack) {
          currentTrack.is_disliked = response.data.is_disliked;
        }
      }
    } catch (err) {
      console.error('Failed to check dislike status:', err);
    }
  };

  // Handle adding/removing from dislikes
  const handleToggleDislike = async () => {
    if (!currentTrack || !user.isAuthenticated || isUpdating) return;

    setIsUpdating(true);
    
    try {
      if (isDisliked) {
        // Remove from dislikes
        await axios.delete(`${API_URL}/dislikes/${currentTrack.id}`, {
          headers: getAuthHeaders()
        });
      } else {
        // Add to dislikes
        await axios.post(`${API_URL}/dislikes/${currentTrack.id}`, {}, {
          headers: getAuthHeaders()
        });
      }
      
      // Update state
      setIsDisliked(!isDisliked);
      
      // Update currentTrack object
      if (currentTrack) {
        currentTrack.is_disliked = !isDisliked;
        
        // If we're adding a dislike, make sure to remove from favorites
        if (!isDisliked) {
          currentTrack.is_favorited = false;
          // Dispatch event for favorites to update
          window.dispatchEvent(new Event('favoritesUpdated'));
        }
      }
      
      // Dispatch event for other components to update
      window.dispatchEvent(new Event('dislikesUpdated'));
    } catch (err) {
      console.error('Failed to toggle dislike:', err);
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
        className="dislike-button disabled"
        variants={buttonVariants}
        whileHover="hover"
        aria-label="Login required"
        title="Login to dislike tracks"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 21l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm0 12l-4.34 4.34L12 14H3v-2l3-7h9v10zm4-12h4v12h-4z" />
        </svg>
      </motion.button>
    );
  }

  return (
    <motion.button 
      className={`dislike-button ${isDisliked ? 'active' : ''} ${isUpdating ? 'updating' : ''}`}
      onClick={handleToggleDislike}
      variants={buttonVariants}
      whileTap="tap"
      whileHover="hover"
      disabled={isUpdating}
      aria-label={isDisliked ? "Remove dislike" : "Dislike"}
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
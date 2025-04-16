import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AudioContext } from '../context/AudioContext';
import '../styles/components/DislikeButton.css';

const DislikeButton = () => {
  const { currentTrack } = useContext(AudioContext);
  const [isDisliked, setIsDisliked] = useState(false);

  // Проверка, находится ли трек в дизлайках при изменении текущего трека
  useEffect(() => {
    if (currentTrack) {
      const dislikes = JSON.parse(localStorage.getItem('dislikes') || '[]');
      const isInDislikes = dislikes.some(id => id === currentTrack.id);
      setIsDisliked(isInDislikes);
    }
  }, [currentTrack]);

  // Слушаем события обновления избранного, чтобы корректно обновить состояние
  useEffect(() => {
    const handleFavoritesUpdate = () => {
      if (currentTrack) {
        const dislikes = JSON.parse(localStorage.getItem('dislikes') || '[]');
        const isInDislikes = dislikes.some(id => id === currentTrack.id);
        setIsDisliked(isInDislikes);
      }
    };

    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    
    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, [currentTrack]);

  // Обработчик добавления/удаления из дизлайков
  const toggleDislike = () => {
    if (!currentTrack) return;

    const dislikes = JSON.parse(localStorage.getItem('dislikes') || '[]');
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (isDisliked) {
      // Удаляем из дизлайков
      const updatedDislikes = dislikes.filter(id => id !== currentTrack.id);
      localStorage.setItem('dislikes', JSON.stringify(updatedDislikes));
      setIsDisliked(false);
    } else {
      // Добавляем в дизлайки и удаляем из избранного, если там был
      const updatedDislikes = [...dislikes, currentTrack.id];
      localStorage.setItem('dislikes', JSON.stringify(updatedDislikes));
      setIsDisliked(true);
      
      // Если трек был в избранном, удаляем его оттуда
      if (favorites.includes(currentTrack.id)) {
        const updatedFavorites = favorites.filter(id => id !== currentTrack.id);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        
        // Отправляем событие об обновлении избранного
        const favoritesEvent = new Event('favoritesUpdated');
        window.dispatchEvent(favoritesEvent);
      }
    }
    
    // Создаем и отправляем пользовательское событие об обновлении дизлайков
    const event = new Event('dislikesUpdated');
    window.dispatchEvent(event);
  };

  // Анимации для кнопки
  const buttonVariants = {
    tap: { scale: 0.95 },
    hover: { scale: 1.05 }
  };

  if (!currentTrack) return null;

  return (
    <motion.button 
      className={`dislike-button ${isDisliked ? 'active' : ''}`}
      onClick={toggleDislike}
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
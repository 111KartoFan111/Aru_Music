import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AudioContext } from '../context/AudioContext';
import '../styles/components/FavoriteButton.css';

const FavoriteButton = () => {
  const { currentTrack } = useContext(AudioContext);
  const [isFavorite, setIsFavorite] = useState(false);

  // Проверка, находится ли трек в избранном при изменении текущего трека
  useEffect(() => {
    if (currentTrack) {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const isInFavorites = favorites.some(id => id === currentTrack.id);
      setIsFavorite(isInFavorites);
    }
  }, [currentTrack]);

  // Слушаем события обновления дизлайков, чтобы корректно обновить состояние
  useEffect(() => {
    const handleDislikesUpdate = () => {
      if (currentTrack) {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const isInFavorites = favorites.some(id => id === currentTrack.id);
        setIsFavorite(isInFavorites);
      }
    };

    window.addEventListener('dislikesUpdated', handleDislikesUpdate);
    
    return () => {
      window.removeEventListener('dislikesUpdated', handleDislikesUpdate);
    };
  }, [currentTrack]);

  // Обработчик добавления/удаления из избранного
  const toggleFavorite = () => {
    if (!currentTrack) return;

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const dislikes = JSON.parse(localStorage.getItem('dislikes') || '[]');
    
    if (isFavorite) {
      // Удаляем из избранного
      const updatedFavorites = favorites.filter(id => id !== currentTrack.id);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setIsFavorite(false);
    } else {
      // Добавляем в избранное и удаляем из дизлайков, если там был
      const updatedFavorites = [...favorites, currentTrack.id];
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setIsFavorite(true);
      
      // Если трек был в дизлайках, удаляем его оттуда
      if (dislikes.includes(currentTrack.id)) {
        const updatedDislikes = dislikes.filter(id => id !== currentTrack.id);
        localStorage.setItem('dislikes', JSON.stringify(updatedDislikes));
        
        // Отправляем событие об обновлении дизлайков
        const dislikesEvent = new Event('dislikesUpdated');
        window.dispatchEvent(dislikesEvent);
      }
    }
    
    // Создаем и отправляем пользовательское событие об обновлении избранного
    const event = new Event('favoritesUpdated');
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
      className={`favorite-button ${isFavorite ? 'active' : ''}`}
      onClick={toggleFavorite}
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
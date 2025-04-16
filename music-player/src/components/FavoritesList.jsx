import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioContext } from '../context/AudioContext';
import '../styles/components/FavoritesList.css';

const FavoritesList = () => {
  const { tracksList, currentTrack, setCurrentTrack, togglePlayPause, isPlaying } = useContext(AudioContext);
  const [favorites, setFavorites] = useState([]);

  // Загружаем избранные треки при монтировании компонента и при изменении списка треков
  useEffect(() => {
    const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');
    const favoriteTracks = tracksList.filter(track => favoriteIds.includes(track.id));
    setFavorites(favoriteTracks);
  }, [tracksList]);

  // Также обновляем при каждом добавлении/удалении из избранного
  useEffect(() => {
    const handleStorageChange = () => {
      const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');
      const favoriteTracks = tracksList.filter(track => favoriteIds.includes(track.id));
      setFavorites(favoriteTracks);
    };

    window.addEventListener('storage', handleStorageChange);

    // Эмулируем событие storage для компонента
    window.addEventListener('favoritesUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('favoritesUpdated', handleStorageChange);
    };
  }, [tracksList]);

  // Обработчик выбора трека
  const handleSelectTrack = (track) => {
    // Если выбран текущий трек, то переключаем воспроизведение/паузу
    if (currentTrack && currentTrack.id === track.id) {
      togglePlayPause();
    } else {
      // Иначе устанавливаем новый трек и начинаем воспроизведение
      setCurrentTrack(track);
      if (!isPlaying) {
        togglePlayPause();
      }
    }
  };

  // Удаление трека из избранного
  const removeFromFavorites = (event, trackId) => {
    event.stopPropagation();
    
    const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');
    const updatedFavorites = favoriteIds.filter(id => id !== trackId);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    
    // Обновляем список избранных треков
    setFavorites(favorites.filter(track => track.id !== trackId));

    // Создаем и отправляем пользовательское событие об обновлении избранного
    const event = new Event('favoritesUpdated');
    window.dispatchEvent(event);
  };

  // Анимация для списка треков
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
                  <img src={track.coverPath} alt={track.title} />
                  
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
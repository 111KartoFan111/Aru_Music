import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioContext } from '../context/AudioContext';
import '../styles/components/DislikesList.css';

const DislikesList = () => {
  const { tracksList, currentTrack, setCurrentTrack, togglePlayPause, isPlaying } = useContext(AudioContext);
  const [dislikes, setDislikes] = useState([]);

  // Загружаем дизлайкнутые треки при монтировании компонента и при изменении списка треков
  useEffect(() => {
    const dislikeIds = JSON.parse(localStorage.getItem('dislikes') || '[]');
    const dislikedTracks = tracksList.filter(track => dislikeIds.includes(track.id));
    setDislikes(dislikedTracks);
  }, [tracksList]);

  // Также обновляем при каждом добавлении/удалении из дизлайков
  useEffect(() => {
    const handleStorageChange = () => {
      const dislikeIds = JSON.parse(localStorage.getItem('dislikes') || '[]');
      const dislikedTracks = tracksList.filter(track => dislikeIds.includes(track.id));
      setDislikes(dislikedTracks);
    };

    window.addEventListener('storage', handleStorageChange);

    // Эмулируем событие storage для компонента
    window.addEventListener('dislikesUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dislikesUpdated', handleStorageChange);
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

  // Удаление трека из дизлайков
  const removeFromDislikes = (event, trackId) => {
    event.stopPropagation();
    
    const dislikeIds = JSON.parse(localStorage.getItem('dislikes') || '[]');
    const updatedDislikes = dislikeIds.filter(id => id !== trackId);
    localStorage.setItem('dislikes', JSON.stringify(updatedDislikes));
    
    // Обновляем список дизлайкнутых треков
    setDislikes(dislikes.filter(track => track.id !== trackId));

    // Создаем и отправляем пользовательское событие об обновлении дизлайков
    const event = new Event('dislikesUpdated');
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
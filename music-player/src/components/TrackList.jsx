import React, { useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioContext } from '../context/AudioContext';
import { formatTime } from '../utils/audioUtils';
import '../styles/components/TrackList.css';

const TrackList = () => {
  const { 
    tracksList, 
    currentTrack, 
    setCurrentTrack, 
    togglePlayPause, 
    isPlaying,
    isLoading,
    error
  } = useContext(AudioContext);

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

  if (isLoading) {
    return (
      <div className="track-list-container">
        <h3 className="list-title">Треки</h3>
        <div className="loading-state">Загрузка треков...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="track-list-container">
        <h3 className="list-title">Треки</h3>
        <div className="error-state">{error}</div>
      </div>
    );
  }

  return (
    <div className="track-list-container">
      <h3 className="list-title">Треки</h3>
      
      {tracksList.length === 0 ? (
        <p className="no-tracks">Треки не найдены</p>
      ) : (
        <motion.div 
          className="tracks-list"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {tracksList.map((track) => (
              <motion.div
                key={track.id}
                className={`track-item ${currentTrack && currentTrack.id === track.id ? 'active' : ''}`}
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
                <span className="track-genre">{track.genre}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default TrackList;
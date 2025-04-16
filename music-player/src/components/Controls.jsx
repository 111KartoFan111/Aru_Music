import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { AudioContext } from '../context/AudioContext';
import '../styles/components/Controls.css';

const Controls = () => {
  const { 
    isPlaying, 
    togglePlayPause, 
    playNext, 
    playPrev, 
    isRepeat, 
    toggleRepeat, 
    isShuffle, 
    toggleShuffle 
  } = useContext(AudioContext);

  // Анимации для кнопок
  const buttonVariants = {
    tap: { scale: 0.95 },
    hover: { scale: 1.05 }
  };

  return (
    
    <div className="controls">
        <motion.button 
        className={`control-button repeat ${isRepeat ? 'active' : ''}`}
        onClick={toggleRepeat}
        variants={buttonVariants}
        whileTap="tap"
        whileHover="hover"
        aria-label="Повторять"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
        </svg>
      </motion.button>
      <motion.button 
        className={`control-button shuffle ${isShuffle ? 'active' : ''}`}
        onClick={toggleShuffle}
        variants={buttonVariants}
        whileTap="tap"
        whileHover="hover"
        aria-label="Перемешать"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
        </svg>
      </motion.button>

      <motion.button 
        className="control-button prev"
        onClick={playPrev}
        variants={buttonVariants}
        whileTap="tap"
        whileHover="hover"
        aria-label="Предыдущий трек"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </svg>
      </motion.button>

      <motion.button 
        className="control-button play-pause"
        onClick={togglePlayPause}
        variants={buttonVariants}
        whileTap="tap"
        whileHover="hover"
        aria-label={isPlaying ? "Пауза" : "Воспроизвести"}
      >
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </motion.button>

      <motion.button 
        className="control-button next"
        onClick={playNext}
        variants={buttonVariants}
        whileTap="tap"
        whileHover="hover"
        aria-label="Следующий трек"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
        </svg>
      </motion.button>
    </div>
  );
};

export default Controls;
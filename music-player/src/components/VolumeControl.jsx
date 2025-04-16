import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { AudioContext } from '../context/AudioContext';
import '../styles/components/VolumeControl.css';

const VolumeControl = () => {
  const { volume, handleVolumeChange } = useContext(AudioContext);
  const [prevVolume, setPrevVolume] = useState(0.5);
  
  // Обработчик для изменения громкости
  const onVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    handleVolumeChange(newVolume);
  };
  
  // Обработчик для отключения звука
  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      handleVolumeChange(0);
    } else {
      handleVolumeChange(prevVolume);
    }
  };
  
  // Определяем иконку громкости в зависимости от уровня
  const renderVolumeIcon = () => {
    if (volume === 0) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
        </svg>
      );
    } else if (volume < 0.5) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71z" />
        </svg>
      );
    }
  };

  return (
    <div className="volume-container">
      <div className="volume-label">
        <motion.button 
          className="volume-button"
          onClick={toggleMute}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          {renderVolumeIcon()}
        </motion.button>
      </div>
      
      <div className="volume-slider-container">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={onVolumeChange}
          className="volume-slider"
        />
        <div 
          className="volume-filled" 
          style={{ width: `${volume * 100}%` }}
        />
      </div>
    </div>
  );
};

export default VolumeControl;
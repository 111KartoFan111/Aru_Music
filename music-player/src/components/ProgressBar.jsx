import React, { useContext, useState } from 'react';
import { AudioContext } from '../context/AudioContext';
import { formatTime } from '../utils/audioUtils';
import '../styles/components/ProgressBar.css';

const ProgressBar = () => {
  const { duration, currentTime, seekTime } = useContext(AudioContext);
  const [isSeeking, setIsSeeking] = useState(false);

  // Рассчитываем процент проигрывания
  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  // Обработчик изменения положения ползунка
  const handleProgressChange = (e) => {
    const seekPosition = (e.target.value / 100) * duration;
    seekTime(seekPosition);
  };

  return (
    <div className="progress-container">
      <span className="time current-time">{formatTime(currentTime)}</span>
      
      <div className="progress-bar-wrapper">
        <input
          type="range"
          min="0"
          max="100"
          value={progressPercentage}
          className="progress-bar"
          onChange={handleProgressChange}
          onMouseDown={() => setIsSeeking(true)}
          onMouseUp={() => setIsSeeking(false)}
          onTouchStart={() => setIsSeeking(true)}
          onTouchEnd={() => setIsSeeking(false)}
        />
        <div 
          className="progress-filled" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <span className="time duration">{formatTime(duration)}</span>
    </div>
  );
};

export default ProgressBar;
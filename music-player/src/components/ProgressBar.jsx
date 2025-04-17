import React, { useContext, useState, useRef, useEffect } from 'react';
import { AudioContext } from '../context/AudioContext';
import { formatTime } from '../utils/audioUtils';
import '../styles/components/ProgressBar.css';

const ProgressBar = () => {
  const { duration, currentTime, seekTime, isPlaying } = useContext(AudioContext);
  const [isDragging, setIsDragging] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  const progressRef = useRef(null);

  // Update local progress when current time changes (if not dragging)
  useEffect(() => {
    if (!isDragging) {
      setLocalProgress(duration ? (currentTime / duration) * 100 : 0);
    }
  }, [currentTime, duration, isDragging]);

  // Handle drag start
  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Handle drag end
  const handleDragEnd = () => {
    // Apply the seek
    const seekPosition = (localProgress / 100) * duration;
    seekTime(seekPosition);
    
    // Small delay before setting isDragging to false to allow the seekTime to take effect
    setTimeout(() => {
      setIsDragging(false);
    }, 200);
  };

  // Handle progress change
  const handleProgressChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    setLocalProgress(newProgress);
  };

  // Handle click on the progress bar wrapper (for direct seeking)
  const handleProgressBarClick = (e) => {
    if (progressRef.current && !isDragging) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentClicked = (clickX / rect.width) * 100;
      
      // Ensure the percentage is within bounds
      const boundedPercentage = Math.max(0, Math.min(100, percentClicked));
      
      // Seek to the clicked position
      const seekPosition = (boundedPercentage / 100) * duration;
      seekTime(seekPosition);
    }
  };

  return (
    <div className="progress-container">
      <span className="time current-time">{formatTime(currentTime)}</span>
      
      <div 
        className="progress-bar-wrapper" 
        ref={progressRef}
        onClick={handleProgressBarClick}
      >
        <input
          type="range"
          min="0"
          max="100"
          value={localProgress}
          className={`progress-bar ${isDragging ? 'dragging' : ''}`}
          onChange={handleProgressChange}
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
        />
        <div 
          className="progress-filled" 
          style={{ width: `${localProgress}%` }}
        />
        
        {/* Thumb indicator for better visualization */}
        <div 
          className={`progress-thumb ${isDragging || isPlaying ? 'visible' : ''}`}
          style={{ left: `${localProgress}%` }}
        />
      </div>
      
      <span className="time duration">{formatTime(duration)}</span>
    </div>
  );
};

export default ProgressBar;
import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { AudioContext } from '../context/AudioContext';
import '../styles/components/NowPlaying.css';

const NowPlaying = () => {
  const { currentTrack } = useContext(AudioContext);

  // Анимация появления обложки альбома
  const coverVariants = {
    initial: { scale: 0.8, opacity: 0, rotateY: -30 },
    animate: {
      scale: 1,
      opacity: 1,
      rotateY: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut" 
      }
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      rotateY: 30,
      transition: {
        duration: 0.4,
        ease: "easeIn"
      }
    }
  };

  if (!currentTrack) return <div className="now-playing-empty">Выберите трек для проигрывания</div>;

  return (
    <div className="now-playing">
      <motion.div
        className="album-cover-container"
        key={currentTrack.id}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={coverVariants}
      >
        <img 
          src={`http://localhost:8000${currentTrack.cover_path.replace(/\\/g, '/')}`}
          alt={`${currentTrack.title} cover`} 
          className="album-cover"
        />
        <div className="vinyl-disc"></div>
      </motion.div>

      <motion.div 
        className="track-info"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <h2 className="track-title">{currentTrack.title}</h2>
        <h3 className="track-artist">{currentTrack.artist}</h3>
        <span className="track-genre">{currentTrack.genre}</span>
      </motion.div>
    </div>
  );
};

export default NowPlaying;
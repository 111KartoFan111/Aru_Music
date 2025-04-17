import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { AudioContext } from '../context/AudioContext';
import Controls from './Controls';
import ProgressBar from './ProgressBar';
import VolumeControl from './VolumeControl';
import FavoriteButton from './FavoriteButton';
import DislikeButton from './DislikeButton';
import LikeMindedUsers from './LikeMindedUsers';
import '../styles/components/AudioPlayer.css';

const AudioPlayer = () => {
  const { currentTrack } = useContext(AudioContext);

  return (
    <motion.div
      className="audio-player"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {currentTrack ? (
        <>
          <ProgressBar />
          <div className="audio-controls-container">
            <Controls />
            <div className="reaction-buttons">
              <FavoriteButton />
              <DislikeButton />
            </div>
          </div>
          <VolumeControl />
          <LikeMindedUsers />
        </>
      ) : (
        <div className="no-track-selected">
          <p>Выберите трек для проигрывания</p>
        </div>
      )}
    </motion.div>
  );
};

export default AudioPlayer;
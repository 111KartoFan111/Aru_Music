import React from 'react';
import GenreFilter from '../components/GenreFilter';
import TrackList from '../components/TrackList';
import AudioPlayer from '../components/AudioPlayer';
import NowPlaying from '../components/NowPlaying';
import TrackReviews from '../components/TrackReviews';

const Home = () => {
  return (
    <div className="home">
      <div className="section player-section">
        <NowPlaying />
        <AudioPlayer />
      </div>
      <div className="section library-section">
        <GenreFilter />
        <TrackList />
      </div>
      <div className="section third-section">
        <TrackReviews />
      </div>
    </div>
  );
};

export default Home;
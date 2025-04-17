import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { AudioContext } from '../context/AudioContext';
import { AuthContext } from '../context/AuthContext';
import '../styles/pages/Playlists.css';

const API_URL = 'http://127.0.0.1:8000/api/v1';

const Playlists = () => {
  const { currentTrack, setCurrentTrack, togglePlayPause, isPlaying } = useContext(AudioContext);
  const { user } = useContext(AuthContext);

  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [newPlaylistIsPublic, setNewPlaylistIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableTracks, setAvailableTracks] = useState([]);
  const [searchTrack, setSearchTrack] = useState('');
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [deletingPlaylist, setDeletingPlaylist] = useState(false);

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch playlists on component mount and when authentication changes
  useEffect(() => {
    if (user.isAuthenticated) {
      fetchPlaylists();
      fetchAvailableTracks();
    }
  }, [user.isAuthenticated]);

  // Filter tracks when search input changes
  useEffect(() => {
    if (searchTrack.trim() === '') {
      setFilteredTracks(availableTracks);
    } else {
      const filtered = availableTracks.filter(track => 
        track.title.toLowerCase().includes(searchTrack.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchTrack.toLowerCase())
      );
      setFilteredTracks(filtered);
    }
  }, [searchTrack, availableTracks]);

  // Fetch playlists from API
  const fetchPlaylists = async () => {
    if (!user.isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/playlists`, {
        headers: getAuthHeaders()
      });
      
      if (response.data && response.data.items) {
        setPlaylists(response.data.items);
      } else {
        console.error('Unexpected API response format:', response.data);
        setError('Received unexpected data format from the server');
      }
    } catch (err) {
      console.error('Failed to fetch playlists:', err);
      setError('Failed to load playlists');
    } finally {
      setIsLoading(false);
    }
  };



  // Fetch available tracks
  const fetchAvailableTracks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tracks`, {
        headers: getAuthHeaders()
      });
      
      if (response.data && response.data.items) {
        setAvailableTracks(response.data.items);
        setFilteredTracks(response.data.items);
      }
    } catch (err) {
      console.error('Failed to fetch tracks:', err);
    }
  };

  // Get playlist details
  const fetchPlaylistDetails = async (playlistId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/playlists/${playlistId}`, {
        headers: getAuthHeaders()
      });
      
      setSelectedPlaylist(response.data);
    } catch (err) {
      console.error('Failed to fetch playlist details:', err);
      setError('Failed to load playlist details');
    } finally {
      setIsLoading(false);
    }
  };

  // Create new playlist
  const handleCreatePlaylist = async () => {
    if (!user.isAuthenticated) {
      setError('Please log in to create playlists');
      return;
    }
    
    if (!newPlaylistName.trim()) {
      setError('Please enter a playlist name');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create the playlist with proper data
      const playlistData = {
        name: newPlaylistName,
        description: newPlaylistDescription || '',
        is_public: newPlaylistIsPublic
      };

      // Send request with proper content type
      await axios.post(`${API_URL}/playlists`, playlistData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        }
      });
      
      // Reset form and refresh playlists
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setNewPlaylistIsPublic(true);
      fetchPlaylists();
    } catch (err) {
      console.error('Failed to create playlist:', err);
      setError('Failed to create playlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete playlist
  const handleDeletePlaylist = async (playlistId) => {
    if (!user.isAuthenticated) return;
    
    setDeletingPlaylist(true);
    
    try {
      await axios.delete(`${API_URL}/playlists/${playlistId}`, {
        headers: getAuthHeaders()
      });
      
      // If the deleted playlist is currently selected, clear it
      if (selectedPlaylist && selectedPlaylist.id === playlistId) {
        setSelectedPlaylist(null);
      }
      
      // Refresh playlists
      fetchPlaylists();
    } catch (err) {
      console.error('Failed to delete playlist:', err);
      setError('Failed to delete playlist');
    } finally {
      setDeletingPlaylist(false);
    }
  };

  // Add track to playlist
  const addTrackToPlaylist = async (trackId) => {
    if (!selectedPlaylist) return;
    
    try {
      await axios.post(`${API_URL}/playlists/${selectedPlaylist.id}/tracks`, 
        { track_id: trackId },
        { headers: getAuthHeaders() }
      );
      
      // Refresh playlist details
      fetchPlaylistDetails(selectedPlaylist.id);
    } catch (err) {
      console.error('Failed to add track to playlist:', err);
      setError('Failed to add track to playlist');
    }
  };

  // Remove track from playlist
  const removeTrackFromPlaylist = async (trackId) => {
    if (!selectedPlaylist) return;
    
    try {
      await axios.delete(`${API_URL}/playlists/${selectedPlaylist.id}/tracks/${trackId}`, {
        headers: getAuthHeaders()
      });
      
      // Refresh playlist details
      fetchPlaylistDetails(selectedPlaylist.id);
    } catch (err) {
      console.error('Failed to remove track from playlist:', err);
      setError('Failed to remove track from playlist');
    }
  };

  // Play track
  const handlePlayTrack = (track) => {
    if (currentTrack && currentTrack.id === track.id) {
      togglePlayPause();
    } else {
      setCurrentTrack(track);
      if (!isPlaying) {
        togglePlayPause();
      }
    }
  };

  // Select playlist
  const handleSelectPlaylist = (playlist) => {
    fetchPlaylistDetails(playlist.id);
  };

  // Clear selected playlist
  const handleBackToPlaylists = () => {
    setSelectedPlaylist(null);
  };

  // Animation variants
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

  // Render login prompt if not authenticated
  if (!user.isAuthenticated) {
    return (
      <div className="playlists">
        <h2 className="playlists-title">My Playlists</h2>
        <div className="login-prompt">
          <p>Please log in to create and view your playlists</p>
        </div>
      </div>
    );
  }

  // Render playlist details if a playlist is selected
  if (selectedPlaylist) {
    return (
      <div className="playlists">
        <div className="playlist-header">
          <button className="back-button" onClick={handleBackToPlaylists}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            Back to playlists
          </button>
          <div className="playlist-header-actions">
            <h2 className="playlist-title">{selectedPlaylist.name}</h2>
            <button 
              className="delete-playlist-button"
              onClick={() => handleDeletePlaylist(selectedPlaylist.id)}
              disabled={deletingPlaylist}
            >
              {deletingPlaylist ? 'Deleting...' : 'Delete Playlist'}
            </button>
          </div>
          <p className="playlist-description">{selectedPlaylist.description}</p>
        </div>
        
        <div className="playlist-content">
          <div className="playlist-tracks">
            <h3>Playlist Tracks</h3>
            {selectedPlaylist.tracks && selectedPlaylist.tracks.length > 0 ? (
              <motion.div 
                className="tracks-list"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {selectedPlaylist.tracks.map((playlistTrack) => (
                  <motion.div
                    key={playlistTrack.track.id}
                    className={`track-item ${currentTrack && currentTrack.id === playlistTrack.track.id ? 'active' : ''}`}
                    onClick={() => handlePlayTrack(playlistTrack.track)}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="track-image">
                      <img
                        src={`http://localhost:8000${playlistTrack.track.cover_path.replace(/\\/g, '/')}`}
                        alt={playlistTrack.track.title}
                      />
                      <div className="play-icon">
                        {currentTrack && currentTrack.id === playlistTrack.track.id && isPlaying ? (
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
                      <h4 className="track-name">{playlistTrack.track.title}</h4>
                      <p className="track-artist">{playlistTrack.track.artist}</p>
                    </div>
                    
                    <button
                      className="remove-track-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTrackFromPlaylist(playlistTrack.track.id);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <p className="empty-message">This playlist has no tracks yet</p>
            )}
          </div>
          
          <div className="add-tracks-section">
            <h3>Add Tracks</h3>
            <input
              type="text"
              placeholder="Search tracks..."
              value={searchTrack}
              onChange={(e) => setSearchTrack(e.target.value)}
              className="track-search-input"
            />
            
            <div className="available-tracks-list">
              {filteredTracks.length > 0 ? (
                filteredTracks.map(track => (
                  <div key={track.id} className="available-track-item">
                    <div className="track-info">
                      <img
                        src={`http://localhost:8000${track.cover_path.replace(/\\/g, '/')}`}
                        alt={track.title}
                        className="track-thumbnail"
                      />
                      <div>
                        <p className="track-title">{track.title}</p>
                        <p className="track-artist">{track.artist}</p>
                      </div>
                    </div>
                    <button
                      className="add-track-button"
                      onClick={() => addTrackToPlaylist(track.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <p className="empty-message">No tracks found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render playlists list
  return (
    <div className="playlists">
      <h2 className="playlists-title">My Playlists</h2>
      
      <div className="create-playlist-form">
        <h3>Create New Playlist</h3>
        <input
          type="text"
          placeholder="Playlist name"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          className="playlist-input"
        />
        <textarea
          placeholder="Description (optional)"
          value={newPlaylistDescription}
          onChange={(e) => setNewPlaylistDescription(e.target.value)}
          className="playlist-textarea"
        />

        <div className="privacy-toggle">
          <label>
            <input
              type="checkbox"
              checked={newPlaylistIsPublic}
              onChange={(e) => setNewPlaylistIsPublic(e.target.checked)}
            />
            Make playlist public
          </label>
        </div>
        <button 
          className="create-playlist-button"
          onClick={handleCreatePlaylist}
          disabled={isLoading || !newPlaylistName.trim()}
        >
          {isLoading ? 'Creating...' : 'Create Playlist'}
        </button>
        
        {error && <p className="error-message">{error}</p>}
      </div>
      
      <div className="playlists-list-container">
        <h3>Your Playlists</h3>
        
        {isLoading && <p className="loading-message">Loading playlists...</p>}
        
        {playlists.length === 0 && !isLoading ? (
          <p className="empty-message">You don't have any playlists yet</p>
        ) : (
          <motion.div 
            className="playlists-list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {playlists.map(playlist => (
                <motion.div
                  key={playlist.id}
                  className="playlist-item"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div 
                    className="playlist-content-wrapper"
                    onClick={() => handleSelectPlaylist(playlist)}
                  >
                    <div className="playlist-cover">
                      {playlist.cover_path ? (
                        <img
                          src={`http://localhost:8000${playlist.cover_path.replace(/\\/g, '/')}`}
                          alt={playlist.name}
                        />
                      ) : (
                        <div className="default-cover">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v2H3v-2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="playlist-info">
                      <h4 className="playlist-name">{playlist.name}</h4>
                      {playlist.description && (
                        <p className="playlist-description">{playlist.description}</p>
                      )}
                      <p className="playlist-visibility">
                        {playlist.is_public ? 'Public' : 'Private'}
                      </p>
                    </div>
                  </div>
                  <button
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlaylist(playlist.id);
                    }}
                    disabled={deletingPlaylist}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Playlists;
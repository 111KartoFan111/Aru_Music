import React, { createContext, useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const AudioContext = createContext();

const API_URL = 'http://127.0.0.1:8000/api/v1';

export const AudioProvider = ({ children }) => {
  const [tracksList, setTracksList] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { user } = useContext(AuthContext);
  const audioRef = useRef(new Audio());
  
  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  
  // Fetch tracks from API
  const fetchTracks = async (genre = selectedGenre) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let url = `${API_URL}/tracks`;
      
      // Add genre filter if not 'All'
      if (genre !== 'All') {
        url += `?genre=${genre}`;
      }
      
      const response = await axios.get(url, {
        headers: getAuthHeaders()
      });
      
      if (response.data && response.data.items) {
        setTracksList(response.data.items);
      } else {
        console.error('Unexpected API response format:', response.data);
        setError('Received unexpected data format from the server');
      }
    } catch (err) {
      console.error('Failed to fetch tracks:', err);
      setError('Failed to load tracks. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch tracks initially and when genre or user authentication changes
  useEffect(() => {
    fetchTracks(selectedGenre);
  }, [selectedGenre, user.isAuthenticated]);
  
  // Fetch track details with interaction status (favorited/disliked)
  const fetchTrackDetails = async (trackId) => {
    try {
      const response = await axios.get(`${API_URL}/tracks/${trackId}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (err) {
      console.error('Failed to fetch track details:', err);
      return null;
    }
  };
  
  // Update current track when changed
  const updateCurrentTrack = async (track) => {
    // First, set the basic track info to avoid delay in UI
    setCurrentTrack(track);
    
    // Then fetch the detailed info with like/dislike status if user is authenticated
    if (user.isAuthenticated && track) {
      try {
        const detailedTrack = await fetchTrackDetails(track.id);
        if (detailedTrack) {
          setCurrentTrack(detailedTrack);
        }
      } catch (err) {
        console.error('Failed to update track details:', err);
      }
    }
  };
  
  // Load from localStorage or API
  useEffect(() => {
    const loadInitialTrack = async () => {
      const savedTrackId = localStorage.getItem('currentTrackId');
      
      if (savedTrackId) {
        const trackDetails = await fetchTrackDetails(savedTrackId);
        if (trackDetails) {
          setCurrentTrack(trackDetails);
        } else if (tracksList.length > 0) {
          setCurrentTrack(tracksList[0]);
        }
      } else if (tracksList.length > 0) {
        setCurrentTrack(tracksList[0]);
      }
    };
    
    if (tracksList.length > 0) {
      loadInitialTrack();
    }
  }, [tracksList]);
  
  // Update audio element when currentTrack changes
  useEffect(() => {
    if (currentTrack) {
      const audioUrl = `http://localhost:8000${currentTrack.audio_path.replace(/\\/g, '/')}`;
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error("Error playing audio:", err);
          setIsPlaying(false);
        });
      }
      
      localStorage.setItem('currentTrackId', currentTrack.id);
    }
  }, [currentTrack]);
  
  // Update volume
  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);
  
  // Update play state
  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play().catch(err => {
        console.error("Error playing audio:", err);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);
  
  // Toggle favorite status
  const toggleFavorite = async (trackId) => {
    if (!user.isAuthenticated) {
      setError('Please log in to add to favorites');
      return;
    }
    
    try {
      const track = await fetchTrackDetails(trackId);
      
      if (track.is_favorited) {
        // Remove from favorites
        await axios.delete(`${API_URL}/favorites/${trackId}`, {
          headers: getAuthHeaders()
        });
      } else {
        // Add to favorites
        await axios.post(`${API_URL}/favorites/${trackId}`, {}, {
          headers: getAuthHeaders()
        });
      }
      
      // Get updated track details
      const updatedTrack = await fetchTrackDetails(trackId);
      
      // Update tracksList 
      setTracksList(tracksList.map(t => 
        t.id === trackId ? { ...t, is_favorited: updatedTrack.is_favorited, is_disliked: updatedTrack.is_disliked } : t
      ));
      
      // Update current track if it's the one being favorited
      if (currentTrack && currentTrack.id === trackId) {
        setCurrentTrack(updatedTrack);
      }
      
      // Dispatch event to update other components
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError('Failed to update favorite status');
    }
  };
  
  // Toggle dislike status
  const toggleDislike = async (trackId) => {
    if (!user.isAuthenticated) {
      setError('Please log in to dislike tracks');
      return;
    }
    
    try {
      const track = await fetchTrackDetails(trackId);
      
      if (track.is_disliked) {
        // Remove from dislikes
        await axios.delete(`${API_URL}/dislikes/${trackId}`, {
          headers: getAuthHeaders()
        });
      } else {
        // Add to dislikes
        await axios.post(`${API_URL}/dislikes/${trackId}`, {}, {
          headers: getAuthHeaders()
        });
      }
      
      // Get updated track details
      const updatedTrack = await fetchTrackDetails(trackId);
      
      // Update tracksList
      setTracksList(tracksList.map(t => 
        t.id === trackId ? { ...t, is_favorited: updatedTrack.is_favorited, is_disliked: updatedTrack.is_disliked } : t
      ));
      
      // Update current track if it's the one being disliked
      if (currentTrack && currentTrack.id === trackId) {
        setCurrentTrack(updatedTrack);
      }
      
      // Dispatch event to update other components
      window.dispatchEvent(new Event('dislikesUpdated'));
    } catch (err) {
      console.error('Error toggling dislike:', err);
      setError('Failed to update dislike status');
    }
  };
  
  // Play next track
  const playNext = () => {
    if (tracksList.length === 0) return;
    
    if (isShuffle) {
      // Play random track
      const randomIndex = Math.floor(Math.random() * tracksList.length);
      updateCurrentTrack(tracksList[randomIndex]);
    } else {
      // Play next track in order
      const currentIndex = tracksList.findIndex(track => track.id === currentTrack.id);
      const nextIndex = (currentIndex + 1) % tracksList.length;
      updateCurrentTrack(tracksList[nextIndex]);
    }
  };
  
  // Play previous track
  const playPrev = () => {
    if (tracksList.length === 0) return;
    
    // If current time is more than 3 seconds, restart the current track
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    
    if (isShuffle) {
      // Play random track
      const randomIndex = Math.floor(Math.random() * tracksList.length);
      updateCurrentTrack(tracksList[randomIndex]);
    } else {
      // Play previous track
      const currentIndex = tracksList.findIndex(track => track.id === currentTrack.id);
      const prevIndex = (currentIndex - 1 + tracksList.length) % tracksList.length;
      updateCurrentTrack(tracksList[prevIndex]);
    }
  };
  
  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    
    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };
    
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(err => console.error("Error playing audio:", err));
      } else {
        playNext();
      }
    };
    
    // Add event listeners
    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      // Remove event listeners
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isRepeat, isShuffle, currentTrack, tracksList]);
  
  // Seek time function
  const seekTime = (time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };
  
  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Toggle repeat
  const toggleRepeat = () => {
    setIsRepeat(!isRepeat);
  };
  
  // Toggle shuffle
  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };
  
  // Set volume
  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
  };

  return (
    <AudioContext.Provider
      value={{
        audioRef,
        tracksList,
        currentTrack,
        setCurrentTrack: updateCurrentTrack, // Use the enhanced setter
        isPlaying,
        duration,
        currentTime,
        volume,
        isRepeat,
        isShuffle,
        selectedGenre,
        setSelectedGenre,
        isLoading,
        error,
        togglePlayPause,
        seekTime,
        playNext,
        playPrev,
        toggleRepeat,
        toggleShuffle,
        handleVolumeChange,
        toggleFavorite,
        toggleDislike,
        fetchTracks,
        fetchTrackDetails,
        getAuthHeaders
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
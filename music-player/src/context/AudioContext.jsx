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
      
      const response = await axios.get(url);
      setTracksList(response.data.items);
    } catch (err) {
      console.error('Failed to fetch tracks:', err);
      setError('Failed to load tracks. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch tracks initially and when genre changes
  useEffect(() => {
    fetchTracks(selectedGenre);
  }, [selectedGenre]);
  
  // Fetch track details
  const fetchTrackDetails = async (trackId) => {
    try {
      const response = await axios.get(`${API_URL}/tracks/${trackId}`);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch track details:', err);
      return null;
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
      audioRef.current.src = currentTrack.audio_path;
      audioRef.current.load();
      
      if (isPlaying) {
        audioRef.current.play();
      }
      
      // Save current track ID
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
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);
  
  // Handle the favorite action
  const toggleFavorite = async (trackId) => {
    if (!user || !user.isAuthenticated) {
      // Redirect to login or show login prompt
      return;
    }
    
    try {
      const track = await fetchTrackDetails(trackId);
      
      if (track.is_favorited) {
        // Remove from favorites
        await axios.delete(`${API_URL}/favorites/${trackId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        // Add to favorites
        await axios.post(`${API_URL}/favorites/${trackId}`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      
      // Create and dispatch event to update UI
      const event = new Event('favoritesUpdated');
      window.dispatchEvent(event);
      
      // Update current track details if this is the current track
      if (currentTrack && currentTrack.id === trackId) {
        const updatedTrack = await fetchTrackDetails(trackId);
        setCurrentTrack(updatedTrack);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };
  
  // Handle the dislike action
  const toggleDislike = async (trackId) => {
    if (!user || !user.isAuthenticated) {
      // Redirect to login or show login prompt
      return;
    }
    
    try {
      const track = await fetchTrackDetails(trackId);
      
      if (track.is_disliked) {
        // Remove from dislikes
        await axios.delete(`${API_URL}/dislikes/${trackId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        // Add to dislikes
        await axios.post(`${API_URL}/dislikes/${trackId}`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      
      // Create and dispatch event to update UI
      const event = new Event('dislikesUpdated');
      window.dispatchEvent(event);
      
      // Update current track details if this is the current track
      if (currentTrack && currentTrack.id === trackId) {
        const updatedTrack = await fetchTrackDetails(trackId);
        setCurrentTrack(updatedTrack);
      }
    } catch (err) {
      console.error('Failed to toggle dislike:', err);
    }
  };
  
  // Function for playing the next track
  const playNext = () => {
    if (tracksList.length === 0) return;
    
    if (isShuffle) {
      // Play random track
      const randomIndex = Math.floor(Math.random() * tracksList.length);
      setCurrentTrack(tracksList[randomIndex]);
    } else {
      // Play next track in order
      const currentIndex = tracksList.findIndex(track => track.id === currentTrack.id);
      const nextIndex = (currentIndex + 1) % tracksList.length;
      setCurrentTrack(tracksList[nextIndex]);
    }
  };
  
  // Function for playing the previous track
  const playPrev = () => {
    if (tracksList.length === 0) return;
    
    if (isShuffle) {
      // Play random track when shuffle is on
      const randomIndex = Math.floor(Math.random() * tracksList.length);
      setCurrentTrack(tracksList[randomIndex]);
    } else {
      // Play previous track
      const currentIndex = tracksList.findIndex(track => track.id === currentTrack.id);
      const prevIndex = (currentIndex - 1 + tracksList.length) % tracksList.length;
      setCurrentTrack(tracksList[prevIndex]);
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
        audio.play();
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
        setCurrentTrack,
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
        fetchTrackDetails
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
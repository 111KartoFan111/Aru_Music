import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioContext } from '../context/AudioContext';
import { AuthContext } from '../context/AuthContext';
import '../styles/pages/Search.css';

const API_URL = 'http://127.0.0.1:8000/api/v1';

const Search = () => {
  const { currentTrack, setCurrentTrack, togglePlayPause, isPlaying } = useContext(AudioContext);
  const { user } = useContext(AuthContext);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ genre: 'All' });
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Handle search input change
  const handleSearch = async (e) => {
    const searchQuery = e.target.value;
    setQuery(searchQuery);
    
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      let url = `${API_URL}/tracks?search=${encodeURIComponent(searchQuery)}`;
      if (filters.genre !== 'All') {
        url += `&genre=${encodeURIComponent(filters.genre)}`;
      }
      
      const response = await axios.get(url, {
headers: getAuthHeaders()
      });
      
      if (response.data && response.data.items) {
        setSearchResults(response.data.items);
      } else {
        setError('Unexpected response format');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search for tracks');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle genre filter change
  const handleFilterChange = (e) => {
    const newGenre = e.target.value;
    setFilters({ ...filters, genre: newGenre });
    
    // Re-search with new filter if there's a query
    if (query.trim()) {
      handleSearch({ target: { value: query } });
    }
  };

  // Handle track click - play or pause
  const handleTrackClick = (track) => {
    if (currentTrack && currentTrack.id === track.id) {
      togglePlayPause();
    } else {
      setCurrentTrack(track);
      if (!isPlaying) {
        togglePlayPause();
      }
    }
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

  return (
    <div className="search">
      <h2 className="search-title">Search</h2>
      <div className="search-bar">
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Enter track, artist or genre..."
          className="search-input"
          disabled={isLoading}
        />
        <select
          className="genre-filter"
          onChange={handleFilterChange}
          value={filters.genre}
          disabled={isLoading}
        >
          <option value="All">All genres</option>
          <option value="Pop">Pop</option>
          <option value="Hip-Hop">Hip-Hop</option>
          <option value="Rock">Rock</option>
          <option value="Indie">Indie</option>
          <option value="R&B">R&B</option>
          <option value="Electronic">Electronic</option>
          <option value="Jazz">Jazz</option>
          <option value="Classical">Classical</option>
          <option value="Folk">Folk</option>
          <option value="Metal">Metal</option>
        </select>
      </div>
      
      <div className="search-results">
        {isLoading && <p className="loading-message">Loading...</p>}
        
        {error && <p className="error-message">{error}</p>}
        
        {searchResults.length === 0 && !isLoading && query && (
          <p className="no-results">No results found</p>
        )}
        
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div 
              className="search-results-list"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {searchResults.map(track => (
                <motion.div
                  key={track.id}
                  className={`search-result-item ${currentTrack && currentTrack.id === track.id ? 'active' : ''}`}
                  onClick={() => handleTrackClick(track)}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="track-image">
                    <img 
                      src={`http://localhost:8000${track.cover_path.replace(/\\/g, '/')}`} 
                      alt={track.title} 
                    />
                    <div className="play-icon">
                      {currentTrack && currentTrack.id === track.id && isPlaying ? (
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
                  
                  <div className="track-info">
                    <h4 className="track-title">{track.title}</h4>
                    <p className="track-artist">{track.artist}</p>
                  </div>
                  
                  <span className="track-genre">{track.genre}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Search;
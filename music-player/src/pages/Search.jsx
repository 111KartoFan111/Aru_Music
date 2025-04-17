import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AudioContext } from '../context/AudioContext';

const API_URL = 'http://127.0.0.1:8000/api/v1';

const Search = () => {
  const { getAuthHeaders, fetchTrackDetails, setCurrentTrack } = useContext(AudioContext);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ genre: 'All' });
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Получение заголовков авторизацииs

  // Обработка поиска
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
        headers:  localStorage.getItem('token'),
      });
      
      if (response.data && response.data.items) {
        setSearchResults(response.data.items);
      } else {
        setError('Непредвиденный формат ответа');
      }
    } catch (err) {
      console.error('Ошибка поиска:', err);
      setError('Не удалось выполнить поиск треков');
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка изменения фильтра
  const handleFilterChange = (e) => {
    const newGenre = e.target.value;
    setFilters({ genre: newGenre });
    
    // Повторный поиск с новым фильтром
    if (query.trim()) {
      handleSearch({ target: { value: query } });
    }
  };

  // Обработка клика по треку
  const handleTrackClick = async (trackId) => {
    const trackDetails = await fetchTrackDetails(trackId);
    if (trackDetails) {
      setCurrentTrack(trackDetails);
    }
  };

  return (
    <div className="search">
      <h2 className="search-title">Поиск</h2>
      <div className="search-bar">
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Введите трек, исполнителя или жанр..."
          className="search-input"
          disabled={isLoading}
        />
        <select
          className="genre-filter"
          onChange={handleFilterChange}
          value={filters.genre}
          disabled={isLoading}
        >
          <option value="All">Все жанры</option>
          <option value="Pop">Поп</option>
          <option value="Hip-Hop">Хип-хоп</option>
          <option value="Rock">Рок</option>
          <option value="Indie">Инди</option>
          <option value="R&B">R&B</option>
        </select>
      </div>
      <div className="search-results">
        {isLoading && <p>Загрузка...</p>}
        {error && <p className="error-message">{error}</p>}
        {searchResults.length === 0 && !isLoading && query && (
          <p>Результаты не найдены</p>
        )}
        {searchResults.map(track => (
          <div
            key={track.id}
            className="search-result-item"
            onClick={() => handleTrackClick(track.id)}
          >
            <img
              src={`http://localhost:8000${track.cover_path.replace(/\\/g, '/')}`}
              alt={track.title}
              className="track-thumbnail"
            />
            <div className="track-info">
              <span className="track-title">{track.title}</span>
              <span className="track-artist">{track.artist}</span>
              <span className="track-genre">{track.genre}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;
import React, { useState } from 'react';

const Search = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ genre: 'All' });

  const handleSearch = (e) => {
    setQuery(e.target.value);
    // Логика поиска (заглушка под бэк)
    console.log('Searching:', query, filters);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, genre: e.target.value });
    // Логика фильтрации (заглушка под бэк)
    console.log('Filtering by:', e.target.value);
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
        />
        <select className="genre-filter" onChange={handleFilterChange} value={filters.genre}>
          <option value="All">Все жанры</option>
          <option value="Pop">Pop</option>
          <option value="Hip-Hop">Hip-Hop</option>
          <option value="Rock">Rock</option>
          <option value="Indie">Indie</option>
          <option value="R&B">R&B</option>
        </select>
      </div>
      <div className="search-results">
        {/* Заглушка для сетки результатов */}
        <div>Результат поиска (заглушка под бэк)</div>
      </div>
    </div>
  );
};

export default Search;
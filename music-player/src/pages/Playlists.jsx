import React, { useState } from 'react';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      setPlaylists([...playlists, { id: Date.now(), name: newPlaylistName, tracks: [] }]);
      setNewPlaylistName('');
      // Заглушка под бэк: создание плейлиста
      console.log('Creating playlist:', newPlaylistName);
    }
  };

  return (
    <div className="playlists">
      <h2>Плейлисты</h2>
      <div className="create-playlist">
        <input
          type="text"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          placeholder="Название нового плейлиста"
        />
        <button onClick={handleCreatePlaylist}>Создать</button>
      </div>
      <div className="playlist-list">
        {playlists.length === 0 ? (
          <p>Плейлисты отсутствуют</p>
        ) : (
          playlists.map((playlist) => (
            <div key={playlist.id} className="playlist-item">
              <h3>{playlist.name}</h3>
              <div>Треки (заглушка под бэк)</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Playlists;
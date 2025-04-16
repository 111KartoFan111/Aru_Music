import React, { useState } from 'react';
import tracks from '../data/tracks';
import '../styles/components/AdminPanel.css';

const AdminPanel = () => {
  const [trackList, setTrackList] = useState(tracks);
  const [newTrack, setNewTrack] = useState({ title: '', artist: '', genre: '', coverPath: '', audioPath: '' });
  const [editTrack, setEditTrack] = useState(null);
  const [users, setUsers] = useState([
    { id: 1, name: 'Иван Иванов', email: 'ivan@example.com' },
    { id: 2, name: 'Мария Петрова', email: 'maria@example.com' },
  ]);

  const handleAddTrack = () => {
    const track = { ...newTrack, id: trackList.length + 1 };
    setTrackList([...trackList, track]);
    setNewTrack({ title: '', artist: '', genre: '', coverPath: '', audioPath: '' });
    console.log('Adding track:', track); // Заглушка под бэк
  };

  const handleEditTrack = (track) => {
    setEditTrack(track);
  };

  const handleSaveEdit = () => {
    setTrackList(trackList.map(t => (t.id === editTrack.id ? editTrack : t)));
    setEditTrack(null);
    console.log('Editing track:', editTrack); // Заглушка под бэк
  };

  const handleDeleteTrack = (id) => {
    setTrackList(trackList.filter(track => track.id !== id));
    console.log('Deleting track:', id); // Заглушка под бэк
  };

  const handleDeleteUser = (id) => {
    setUsers(users.filter(user => user.id !== id));
    console.log('Deleting user:', id); // Заглушка под бэк
  };

  return (
    <div className="admin-panel">
      <h2 className="admin-title">Админ-панель</h2>

      {/* Раздел добавления трека */}
      <div className="admin-section">
        <h3>Добавить трек</h3>
        <div className="add-track-form">
          <input
            type="text"
            placeholder="Название трека"
            value={newTrack.title}
            onChange={(e) => setNewTrack({ ...newTrack, title: e.target.value })}
          />
          <input
            type="text"
            placeholder="Исполнитель"
            value={newTrack.artist}
            onChange={(e) => setNewTrack({ ...newTrack, artist: e.target.value })}
          />
          <input
            type="text"
            placeholder="Жанр"
            value={newTrack.genre}
            onChange={(e) => setNewTrack({ ...newTrack, genre: e.target.value })}
          />
          <input
            type="text"
            placeholder="Путь к обложке (URL)"
            value={newTrack.coverPath}
            onChange={(e) => setNewTrack({ ...newTrack, coverPath: e.target.value })}
          />
          <input
            type="text"
            placeholder="Путь к аудио (URL)"
            value={newTrack.audioPath}
            onChange={(e) => setNewTrack({ ...newTrack, audioPath: e.target.value })}
          />
          <button onClick={handleAddTrack}>Добавить</button>
        </div>
      </div>

      {/* Раздел управления треками */}
      <div className="admin-section">
        <h3>Управление треками</h3>
        <div className="track-list">
          {trackList.map(track => (
            <div key={track.id} className="track-item">
              <span>{track.title} - {track.artist} ({track.genre})</span>
              <div className="track-actions">
                <button onClick={() => handleEditTrack(track)}>Редактировать</button>
                <button onClick={() => handleDeleteTrack(track.id)}>Удалить</button>
              </div>
            </div>
          ))}
        </div>

        {editTrack && (
          <div className="edit-track-form">
            <h4>Редактировать трек</h4>
            <input
              type="text"
              value={editTrack.title}
              onChange={(e) => setEditTrack({ ...editTrack, title: e.target.value })}
            />
            <input
              type="text"
              value={editTrack.artist}
              onChange={(e) => setEditTrack({ ...editTrack, artist: e.target.value })}
            />
            <input
              type="text"
              value={editTrack.genre}
              onChange={(e) => setEditTrack({ ...editTrack, genre: e.target.value })}
            />
            <input
              type="text"
              value={editTrack.coverPath}
              onChange={(e) => setEditTrack({ ...editTrack, coverPath: e.target.value })}
            />
            <input
              type="text"
              value={editTrack.audioPath}
              onChange={(e) => setEditTrack({ ...editTrack, audioPath: e.target.value })}
            />
            <button onClick={handleSaveEdit}>Сохранить</button>
            <button onClick={() => setEditTrack(null)}>Отмена</button>
          </div>
        )}
      </div>

      {/* Раздел управления пользователями */}
      <div className="admin-section">
        <h3>Управление пользователями</h3>
        <div className="user-list">
          {users.map(user => (
            <div key={user.id} className="user-item">
              <span>{user.name} ({user.email})</span>
              <button onClick={() => handleDeleteUser(user.id)}>Удалить</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
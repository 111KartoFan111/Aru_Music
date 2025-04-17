import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import '../styles/components/AdminPanel.css';

const API_URL = 'http://127.0.0.1:8000/api/v1';

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const [trackList, setTrackList] = useState([]);
  const [newTrack, setNewTrack] = useState({ 
    title: '', 
    artist: '', 
    genre: '', 
    duration: 0 
  });
  const [coverFile, setCoverFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [editTrack, setEditTrack] = useState(null);
  const [editCoverFile, setEditCoverFile] = useState(null);
  const [editAudioFile, setEditAudioFile] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загрузка данных при загрузке компонента
  useEffect(() => {
    fetchTracks();
    fetchUsers();
  }, []);

  // Получение списка треков
  const fetchTracks = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/tracks`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTrackList(response.data.items);
    } catch (err) {
      setError('Ошибка при загрузке треков: ' + (err.response?.data?.detail || err.message));
      console.error('Failed to fetch tracks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Получение списка пользователей (только для админа)
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  // Обработка загрузки обложки
  const handleCoverChange = (e) => {
    setCoverFile(e.target.files[0]);
  };

  // Обработка загрузки аудио
  const handleAudioChange = (e) => {
    setAudioFile(e.target.files[0]);
    
    // Попытка определить длительность аудио
    const audio = new Audio();
    audio.src = URL.createObjectURL(e.target.files[0]);
    audio.onloadedmetadata = () => {
      setNewTrack({ ...newTrack, duration: audio.duration });
    };
  };

  // Обработка загрузки обложки для редактирования
  const handleEditCoverChange = (e) => {
    setEditCoverFile(e.target.files[0]);
  };

  // Обработка загрузки аудио для редактирования
  const handleEditAudioChange = (e) => {
    setEditAudioFile(e.target.files[0]);
    
    // Попытка определить длительность аудио
    if (e.target.files[0]) {
      const audio = new Audio();
      audio.src = URL.createObjectURL(e.target.files[0]);
      audio.onloadedmetadata = () => {
        setEditTrack({ ...editTrack, duration: audio.duration });
      };
    }
  };

  // Добавление трека

  // Редактирование трека
  const handleEditTrack = (track) => {
    setEditTrack(track);
    setEditCoverFile(null);
    setEditAudioFile(null);
  };

  // Сохранение изменений
  const handleSaveEdit = async () => {
    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append('title', editTrack.title);
      formData.append('artist', editTrack.artist);
      formData.append('genre', editTrack.genre);
      
      if (editTrack.duration) {
        formData.append('duration', editTrack.duration);
      }
      
      if (editCoverFile) {
        formData.append('cover', editCoverFile);
      }
      
      if (editAudioFile) {
        formData.append('audio', editAudioFile);
      }
      
      await axios.put(`${API_URL}/tracks/${editTrack.id}`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
      });
      
      // Сброс формы редактирования
      setEditTrack(null);
      setEditCoverFile(null);
      setEditAudioFile(null);
      
      // Обновление списка треков
      fetchTracks();
    } catch (err) {
      setError('Ошибка при обновлении трека: ' + (err.response?.data?.detail || err.message));
      console.error('Failed to update track:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTrack = async () => {
    if (!coverFile || !audioFile) {
      setError('Необходимо выбрать файлы обложки и аудио');
      return;
    }
  
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Вы не авторизованы. Пожалуйста, войдите в систему.');
        return;
      }
      
      console.log('Using token for upload:', token);
      
      const formData = new FormData();
      formData.append('title', newTrack.title);
      formData.append('artist', newTrack.artist);
      formData.append('genre', newTrack.genre);
      formData.append('duration', newTrack.duration.toString()); // Преобразуйте в строку
      formData.append('cover', coverFile);
      formData.append('audio', audioFile);

      const response = await fetch(`${API_URL}/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Не устанавливайте 'Content-Type' для multipart/form-data
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Upload response:', data);

      // Сброс формы и обновление списка
      setNewTrack({ title: '', artist: '', genre: '', duration: 0 });
      setCoverFile(null);
      setAudioFile(null);
      fetchTracks();
    } catch (err) {
      console.error('Failed to add track. Full error:', err);
      setError('Ошибка при добавлении трека: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление трека
  const handleDeleteTrack = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить этот трек?')) return;
    try {
      setIsLoading(true);

      await axios.delete(`${API_URL}/tracks/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Обновление списка треков
      fetchTracks();
    } catch (err) {
      setError('Ошибка при удалении трека: ' + (err.response?.data?.detail || err.message));
      console.error('Failed to delete track:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление пользователя
  const handleDeleteUser = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return;
    
    try {
      setIsLoading(true);
      
      await axios.delete(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Обновление списка пользователей
      fetchUsers();
    } catch (err) {
      setError('Ошибка при удалении пользователя: ' + (err.response?.data?.detail || err.message));
      console.error('Failed to delete user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Проверка прав доступа
  if (!user || !user.isAuthenticated || user.role !== 'admin') {
    return (
      <div className="admin-panel">
        <h2 className="admin-title">Доступ запрещен</h2>
        <p>У вас нет прав для доступа к админ-панели.</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <h2 className="admin-title">Админ-панель</h2>
      
      {error && <div className="error-message">{error}</div>}

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
          <select
            value={newTrack.genre}
            onChange={(e) => setNewTrack({ ...newTrack, genre: e.target.value })}
          >
            <option value="">Выберите жанр</option>
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
          <div className="file-input">
            <label>Обложка:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
            />
            {coverFile && <span className="file-name">{coverFile.name}</span>}
          </div>
          <div className="file-input">
            <label>Аудио файл:</label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
            />
            {audioFile && <span className="file-name">{audioFile.name}</span>}
          </div>
          <button 
            onClick={handleAddTrack}
            disabled={isLoading || !newTrack.title || !newTrack.artist || !newTrack.genre || !coverFile || !audioFile}
          >
            {isLoading ? 'Добавление...' : 'Добавить'}
          </button>
        </div>
      </div>

      {/* Раздел управления треками */}
      <div className="admin-section">
        <h3>Управление треками</h3>
        {isLoading && !editTrack ? (
          <p>Загрузка треков...</p>
        ) : (
          <div className="track-list">
            {trackList.length === 0 ? (
              <p>Треки не найдены</p>
            ) : (
              trackList.map(track => (
                <div key={track.id} className="track-item">
                  <div className="track-info">
                  <img 
                  src={`http://localhost:8000${track.cover_path.replace(/\\/g, '/')}`}
                  alt={track.title} 
                  className="track-thumbnail" 
                />
                    <span>{track.title} - {track.artist} ({track.genre})</span>
                  </div>
                  <div className="track-actions">
                    <button onClick={() => handleEditTrack(track)}>Редактировать</button>
                    <button onClick={() => handleDeleteTrack(track.id)}>Удалить</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

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
            <select
              value={editTrack.genre}
              onChange={(e) => setEditTrack({ ...editTrack, genre: e.target.value })}
            >
              <option value="">Выберите жанр</option>
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
            <div className="file-input">
              <label>Новая обложка (опционально):</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleEditCoverChange}
              />
              {editCoverFile && <span className="file-name">{editCoverFile.name}</span>}
            </div>
            <div className="file-input">
              <label>Новый аудио файл (опционально):</label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleEditAudioChange}
              />
              {editAudioFile && <span className="file-name">{editAudioFile.name}</span>}
            </div>
            <div className="edit-buttons">
              <button 
                onClick={handleSaveEdit}
                disabled={isLoading || !editTrack.title || !editTrack.artist || !editTrack.genre}
              >
                {isLoading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button onClick={() => setEditTrack(null)}>Отмена</button>
            </div>
          </div>
        )}
      </div>

      {/* Раздел управления пользователями */}
      <div className="admin-section">
        <h3>Управление пользователями</h3>
        {isLoading ? (
          <p>Загрузка пользователей...</p>
        ) : (
          <div className="user-list">
            {users.length === 0 ? (
              <p>Пользователи не найдены</p>
            ) : (
              users.map(user => (
                <div key={user.id} className="user-item">
                  <span>{user.display_name || user.username} ({user.email})</span>
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={user.id === user.id} // Запрет удаления себя
                  >
                    Удалить
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
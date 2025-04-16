import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioContext } from '../context/AudioContext';
import '../styles/components/LikeMindedUsers.css';

// Имитация пользователей и их предпочтений
const simulatedUsers = [
  { id: 1, name: 'cardi b', likedTracks: [1, 3, 5, 7, 9] },
  { id: 2, name: 'rihanna', likedTracks: [1, 2, 4, 6, 8] },
  { id: 3, name: 'eminem', likedTracks: [2, 3, 5, 8, 9] },
  { id: 4, name: 'justin t', likedTracks: [1, 4, 6, 7, 10] },
  { id: 5, name: 'kendrick', likedTracks: [3, 5, 7, 9, 10] },
  { id: 6, name: 'kanye west', likedTracks: [2, 4, 6, 8, 10] },
  { id: 7, name: 'shakira', likedTracks: [1, 3, 5, 7, 9] },
  { id: 8, name: 'icespice', likedTracks: [2, 4, 6, 8, 10] },
  { id: 9, name: 'future', likedTracks: [1, 3, 5, 7, 9] },
  { id: 10, name: 'adele', likedTracks: [2, 4, 6, 8, 10] },
];

// Заглушка для аватаров (генерация случайного цвета фона с инициалами)
const UserAvatar = ({ name }) => {
  // Создаем уникальный цвет на основе имени
  const getColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 80%)`;
  };

  // Получаем инициалы
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="user-avatar" style={{ backgroundColor: getColor(name) }}>
      {getInitials(name)}
    </div>
  );
};

const LikeMindedUsers = () => {
  const { currentTrack } = useContext(AudioContext);
  const [likeMindedUsers, setLikeMindedUsers] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  // Находим "единомышленников" при изменении текущего трека или при событии лайка
  useEffect(() => {
    const updateLikeMindedUsers = () => {
      if (!currentTrack) {
        setLikeMindedUsers([]);
        return;
      }

      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      
      // Проверяем, поставил ли текущий пользователь лайк на этот трек
      const isCurrentTrackLiked = favorites.includes(currentTrack.id);
      
      if (isCurrentTrackLiked) {
        // Находим других пользователей, которые лайкнули этот трек
        const users = simulatedUsers.filter(user => 
          user.likedTracks.includes(currentTrack.id)
        );
        
        // Показываем максимум 5 пользователей
        setLikeMindedUsers(users.slice(0, 5));
        setIsVisible(true);
      } else {
        setLikeMindedUsers([]);
        setIsVisible(false);
      }
    };

    updateLikeMindedUsers();

    // Слушаем события обновления избранного
    window.addEventListener('favoritesUpdated', updateLikeMindedUsers);
    
    return () => {
      window.removeEventListener('favoritesUpdated', updateLikeMindedUsers);
    };
  }, [currentTrack]);

  // Анимации
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        staggerChildren: 0.1 
      } 
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { 
        duration: 0.2 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };

  if (!isVisible || likeMindedUsers.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="like-minded-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="like-minded-header">
          <h4>Кому тоже нравится</h4>
        </div>
        
        <div className="like-minded-users">
          {likeMindedUsers.map(user => (
            <motion.div 
              key={user.id}
              className="like-minded-user"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
            >
              <UserAvatar name={user.name} />
              <span className="user-name">{user.name}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LikeMindedUsers;
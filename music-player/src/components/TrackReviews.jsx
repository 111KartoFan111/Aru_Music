import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioContext } from '../context/AudioContext';
import '../styles/components/TrackReviews.css';

const TrackReviews = () => {
  const { currentTrack } = useContext(AudioContext);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [userName, setUserName] = useState('');

  // Загрузка отзывов из localStorage при изменении трека
  useEffect(() => {
    if (currentTrack) {
      const savedReviews = localStorage.getItem(`reviews_${currentTrack.id}`);
      if (savedReviews) {
        setReviews(JSON.parse(savedReviews));
      } else {
        setReviews([]);
      }
    }
  }, [currentTrack]);

  // Сохранение отзыва
  const handleAddReview = () => {
    if (!newReview.trim() || !userName.trim() || !currentTrack) return;

    const review = {
      id: Date.now(),
      text: newReview,
      user: userName,
      date: new Date().toLocaleString('ru-RU'),
    };

    const updatedReviews = [...reviews, review];
    setReviews(updatedReviews);
    localStorage.setItem(`reviews_${currentTrack.id}`, JSON.stringify(updatedReviews));
    
    setNewReview('');
  };

  // Анимация
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
    <div className="track-reviews-container">
      <h3 className="reviews-title">Отзывы</h3>
      
      {!currentTrack ? (
        <p className="no-track-selected">Выберите трек для просмотра отзывов</p>
      ) : (
        <>
          <div className="current-track-info">
            <span>Отзывы на: </span>
            <strong>{currentTrack.title}</strong> - {currentTrack.artist}
          </div>

          <div className="add-review-form">
            <input
              type="text"
              placeholder="Ваше имя"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="review-input name-input"
            />
            <textarea
              placeholder="Напишите ваш отзыв..."
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              className="review-input review-textarea"
            />
            <button onClick={handleAddReview} className="add-review-button">
              Добавить отзыв
            </button>
          </div>

          <motion.div
            className="reviews-list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {reviews.length === 0 ? (
                <p className="no-reviews">Пока нет отзывов на этот трек</p>
              ) : (
                reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    className="review-item"
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="review-header">
                      <span className="review-user">{review.user}</span>
                      <span className="review-date">{review.date}</span>
                    </div>
                    <div className="review-text">{review.text}</div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default TrackReviews;
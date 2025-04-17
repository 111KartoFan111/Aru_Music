import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { AudioContext } from '../context/AudioContext';
import { AuthContext } from '../context/AuthContext';
import '../styles/components/TrackReviews.css';

const API_URL = 'http://127.0.0.1:8000/api/v1';

const TrackReviews = () => {
  const { currentTrack } = useContext(AudioContext);
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch reviews for the current track
  const fetchReviews = async (trackId) => {
    if (!trackId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/reviews?track_id=${trackId}`, {
headers: getAuthHeaders()
      });
      
      if (response.data && response.data.items) {
        setReviews(response.data.items);
      } else {
        console.error('Unexpected API response format:', response.data);
        setError('Received unexpected data format from the server');
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch reviews when current track changes
  useEffect(() => {
    if (currentTrack) {
      fetchReviews(currentTrack.id);
    } else {
      setReviews([]);
    }
  }, [currentTrack]);

  // Save review
  const handleAddReview = async () => {
    if (!newReview.trim() || !currentTrack || !user.isAuthenticated) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Create the review on the server
      await axios.post(`${API_URL}/reviews`, 
        { 
          track_id: currentTrack.id, 
          text: newReview 
        },
        {
  headers: getAuthHeaders()
        }
      );
      
      // Refresh reviews
      await fetchReviews(currentTrack.id);
      
      // Clear the form
      setNewReview('');
    } catch (err) {
      console.error('Failed to add review:', err);
      setSubmitError(err.response?.data?.detail || 'Failed to add review');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation
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

  // Show loading state while fetching reviews
  const renderReviewsList = () => {
    if (isLoading) {
      return <p className="loading-state">Загрузка отзывов...</p>;
    }
    
    if (error) {
      return <p className="error-state">{error}</p>;
    }
    
    if (reviews.length === 0) {
      return <p className="no-reviews">Пока нет отзывов на этот трек</p>;
    }
    
    return (
      <motion.div
        className="reviews-list"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              className="review-item"
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
            >
              <div className="review-header">
                <span className="review-user">{review.user.display_name || review.user.username}</span>
                <span className="review-date">{new Date(review.created_at).toLocaleString('ru-RU')}</span>
              </div>
              <div className="review-text">{review.text}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
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

          {user.isAuthenticated ? (
            <div className="add-review-form">
              <textarea
                placeholder="Напишите ваш отзыв..."
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                className="review-input review-textarea"
                disabled={isSubmitting}
              />
              
              {submitError && <p className="submit-error">{submitError}</p>}
              
              <button 
                onClick={handleAddReview} 
                className="add-review-button"
                disabled={isSubmitting || !newReview.trim()}
              >
                {isSubmitting ? 'Добавление...' : 'Добавить отзыв'}
              </button>
            </div>
          ) : (
            <p className="login-prompt">Войдите в систему, чтобы оставлять отзывы</p>
          )}

          {renderReviewsList()}
        </>
      )}
    </div>
  );
};

export default TrackReviews;
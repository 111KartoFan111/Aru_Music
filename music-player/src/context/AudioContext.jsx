import React, { createContext, useState, useRef, useEffect } from 'react';
import tracks from '../data/tracks';

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [tracksList, setTracksList] = useState(tracks);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('All');
  
  const audioRef = useRef(new Audio());
  
  // Фильтрация треков по жанру
  useEffect(() => {
    if (selectedGenre === 'All') {
      setTracksList(tracks);
    } else {
      setTracksList(tracks.filter(track => track.genre === selectedGenre));
    }
  }, [selectedGenre]);
  
  // Загрузка последнего трека из LocalStorage
  useEffect(() => {
    const savedTrackId = localStorage.getItem('currentTrackId');
    if (savedTrackId) {
      const savedTrack = tracks.find(track => track.id === parseInt(savedTrackId));
      if (savedTrack) {
        setCurrentTrack(savedTrack);
      } else {
        setCurrentTrack(tracks[0]);
      }
    } else {
      setCurrentTrack(tracks[0]);
    }
  }, []);
  
  // Обновление аудио
  useEffect(() => {
    if (currentTrack) {
      audioRef.current.src = currentTrack.audioPath;
      audioRef.current.load();
      
      if (isPlaying) {
        audioRef.current.play();
      }
      
      // Сохраняем ID текущего трека в LocalStorage
      localStorage.setItem('currentTrackId', currentTrack.id);
    }
  }, [currentTrack]);
  
  // Обновление громкости
  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);
  
  // Обновление состояния воспроизведения
  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);
  
  // Функция воспроизведения следующего трека
  const playNext = () => {
    if (isShuffle) {
      // Воспроизведение случайного трека
      const randomIndex = Math.floor(Math.random() * tracksList.length);
      setCurrentTrack(tracksList[randomIndex]);
    } else {
      // Воспроизведение следующего трека по порядку
      const currentIndex = tracksList.findIndex(track => track.id === currentTrack.id);
      const nextIndex = (currentIndex + 1) % tracksList.length;
      setCurrentTrack(tracksList[nextIndex]);
    }
  };
  
  // Функция воспроизведения предыдущего трека
  const playPrev = () => {
    if (isShuffle) {
      // Воспроизведение случайного трека при включенном перемешивании
      const randomIndex = Math.floor(Math.random() * tracksList.length);
      setCurrentTrack(tracksList[randomIndex]);
    } else {
      // Воспроизведение предыдущего трека по порядку
      const currentIndex = tracksList.findIndex(track => track.id === currentTrack.id);
      const prevIndex = (currentIndex - 1 + tracksList.length) % tracksList.length;
      setCurrentTrack(tracksList[prevIndex]);
    }
  };
  
  // Обработчики событий аудио
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
    
    // Добавляем обработчики событий
    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      // Удаляем обработчики событий при размонтировании
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isRepeat, isShuffle, currentTrack, tracksList]); // Добавляем важные зависимости
  
  // Функция установки времени проигрывания трека
  const seekTime = (time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };
  
  // Функция переключения воспроизведение/пауза
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Функция переключения режима повтора
  const toggleRepeat = () => {
    setIsRepeat(!isRepeat);
  };
  
  // Функция переключения режима перемешивания
  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };
  
  // Функция установки громкости
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
        togglePlayPause,
        seekTime,
        playNext,
        playPrev,
        toggleRepeat,
        toggleShuffle,
        handleVolumeChange
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
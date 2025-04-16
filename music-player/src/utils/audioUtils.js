// Форматирование времени в формат mm:ss
export const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Функция для получения градиента цвета в зависимости от интенсивности
  export const getGradientColor = (value) => {
    // Значение от 0 до 1
    const hue = 240 - value * 240; // от синего (240) до красного (0)
    return `hsl(${hue}, 100%, 50%)`;
  };
  
  // Функция для создания пульсирующего эффекта для визуализации
  export const createPulseEffect = (intensity) => {
    return {
      scale: 1 + intensity * 0.2,
      opacity: 0.7 + intensity * 0.3,
    };
  };
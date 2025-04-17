import { useEffect } from 'react';

const GradientSettings = () => {
  useEffect(() => {
    const speedSlider = document.getElementById('gradient-speed');
    const handleSpeedChange = () => {
      document.documentElement.style.setProperty('--gradient-speed', speedSlider.value + 's');
    };
    
    speedSlider?.addEventListener('input', handleSpeedChange);
    
    return () => {
      speedSlider?.removeEventListener('input', handleSpeedChange);
    };
  }, []);

  return (
    <div className="settings">
      <label htmlFor="gradient-speed">Скорость градиента</label>
      <input
        type="range"
        id="gradient-speed"
        min="5"
        max="30"
        defaultValue="15"
      />
    </div>
  );
};

export default GradientSettings;
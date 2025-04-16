import React from 'react';

const About = () => {
  return (
    <div className="about">
      <h2 className="about-title">О нас</h2>
      <div className="about-content">
        <p>
          TuneViewer — это музыкальный оазис, где каждый может открыть для себя новые мелодии и создать свои плейлисты. Мы стремимся вдохновлять через музыку, объединяя людей по всему миру.
        </p>
        <p>
          Наша миссия — сделать прослушивание музыки уникальным и персонализированным. Мы постоянно развиваемся, чтобы предложить вам лучшее.
        </p>
        <p className="contact-info">
          <i className="fas fa-envelope"></i> Контакты: <a href="mailto:support@tuneviewer.com">support@tuneviewer.com</a>
        </p>
      </div>
    </div>
  );
};

export default About;
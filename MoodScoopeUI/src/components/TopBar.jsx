import React from 'react';
import './TopBar.css';

const getDateString = () => {
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  return new Date().toLocaleDateString(undefined, options);
};

const TopBar = () => (
  <div className="topbar">
    <div className="topbar-right">Today Special</div>
    
    <img className="title-img" src="src\assets\moodscope.png" alt="title"/>

    <div className="topbar-right">
      <span className="topbar-date">{getDateString()}</span>
      <span>🌤</span>
      <span className="topbar-weather">25°C, Sunny</span>
    </div>
  </div>
);

export default TopBar; 
import React from 'react';
import './LoadingOverlay.css';

const LoadingOverlay = () => (
  <div className="loading-overlay" aria-hidden>
    <div className="loading-dots">
      <span />
      <span />
      <span />
    </div>
  </div>
);

export default LoadingOverlay;

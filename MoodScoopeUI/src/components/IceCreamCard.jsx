import React from 'react';
import './IceCreamCard.css';

const IceCreamCard = ({ image, name, description, price }) => (
  <div className="icecream-card">
    <img src={image} alt={name} className="icecream-card-image" />
    <div className="icecream-card-info">
      <div className="icecream-card-title-row">
        <span className="icecream-card-title">{name}</span>
        <span className="icecream-card-price">Rs {price}</span>
      </div>
      <div className="icecream-card-desc">{description}</div>
    </div>
  </div>
);

export default IceCreamCard; 
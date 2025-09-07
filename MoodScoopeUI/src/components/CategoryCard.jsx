import React from 'react';
import './IceCreamCard.css';

// CategoryCard matches IceCreamCard style but without price
const CategoryCard = ({ image = 'src/assets/blueberry.jpg', name, description, active, onClick }) => (
  <div className={`icecream-card category-card ${active ? 'active' : ''}`} onClick={onClick} role="button">
    <img src={image} alt={name} className="icecream-card-image" />
    <div className="icecream-card-info">
      <div className="icecream-card-title-row">
        <span className="icecream-card-title">{name}</span>
        {/* no price for categories */}
      </div>
      {description && <div className="icecream-card-desc">{description}</div>}
    </div>
  </div>
);

export default CategoryCard;

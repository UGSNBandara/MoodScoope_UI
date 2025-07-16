import React from 'react';
import IceCreamCard from './IceCreamCard';
import './SideMenu.css';

const SideMenu = ({ data }) => (
  // This new container will manage the overall flex layout
  <div className="side-menu-container">

    <div className="side-menu-scrollable-content">
      {data.map((item, idx) => (
        <IceCreamCard
          key={item.name + idx}
          image={item.image}
          name={item.name}
          description={item.description}
          price={item.price}
        />
      ))}
    </div>

    {/* Footer: "See all list" button - This will be fixed at the bottom */}
    <div className="side-menu-footer">
      <button className="view-all-button">See all list</button>
    </div>

  </div>
);

export default SideMenu;
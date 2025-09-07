import React from 'react';
import OrderDetails from './OrderDetails';
import ChatInterface from './ChatInterface';
import './SideMenu.css';

const RightPanel = () => (
  <div className="right-panel-container">
    <OrderDetails />
    <ChatInterface />
  </div>
);

export default RightPanel;

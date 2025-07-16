import React from 'react';
import TopBar from '../components/TopBar';
import SideMenu from '../components/SideMenu';
import MiddleSection from '../components/MiddleSection';
import leftMenuData from '../data/leftMenuData';
import './Home.css';


function Home() {
  return (
    <div className="moodscope-app-root">
      <TopBar />
      <div className="moodscope-main-layout">
        <div className="moodscope-sidebar left">
          <SideMenu data={leftMenuData} />
        </div>
        <div className="moodscope-center">
          <MiddleSection />
        </div>
      </div>
    </div>
  );
}

export default Home; 
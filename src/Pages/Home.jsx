import React from 'react';
import './Home.css';



const Home = () => {
  return (
    <div className="home-container">
      <video className="home-video" src="/intro.mp4" autoPlay loop muted />


      
      <div className="home-overlay">
        <button className="home-button">New Arrivals .....</button>
      </div>
    </div>
  );
};

export default Home;

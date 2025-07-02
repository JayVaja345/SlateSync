import React from "react";
import "./Banner.css";

const Banner = () => {
  return (
    <div className="banner">
      <h1>
        Welcome to <span>SlateSync</span>
      </h1>
      <p>Your Real-Time Collaborative Document Platform.</p>
      <a href="#documents" className="banner-btn">
        Get Started
      </a>
    </div>
  );
};

export default Banner;

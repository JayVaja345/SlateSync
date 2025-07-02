import React from "react";
import "./Banner.css";

const slides = [
  "📝 Real-time editing with Socket.IO",
  "⚡ Operational Transform or CRDT for conflict resolution",
  "📄 Auto versioning and rollback",
  "🔐 Secure authentication & access control",
];

const Slider = () => {
  return (
    <div className="slider">
      <marquee behavior="scroll" direction="left" scrollamount="5">
        {slides.map((text, index) => (
          <span key={index} className="slide-item">
            {text}
          </span>
        ))}
      </marquee>
    </div>
  );
};

export default Slider;

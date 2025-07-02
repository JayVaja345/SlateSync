import React from "react";
import "./About.css";

const About = () => {
  return (
    <div className="about">
      <h2>What is SlateSync?</h2>
      <p>
        SlateSync is a modern web-based editor built using the MERN stack and
        Socket.IO. It allows teams to collaborate in real-time on shared
        documents, supports markdown, version history, and conflict resolution
        through OT/CRDT.
      </p>
    </div>
  );
};

export default About;

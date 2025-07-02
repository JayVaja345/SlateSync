import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../Context/AuthContext";

const Navbar = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/"); // redirect to login
  };
  return (
    <div>
      {user ? (
        <nav className="navbar">
          <div className="navbar-left">
            <h2>📝 SlateSync</h2>
          </div>
          <div className="navbar-right">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/editor/sample-doc">Editor</Link>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </nav>
      ) : (
        <nav className="navbar">
          <div className="navbar-left">
            <h2>📝 SlateSync</h2>
          </div>
          <div className="navbar-right">
            <button>Do Loginn</button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default Navbar;

import React, { useState, createContext, useContext } from "react";

// Create the context
const AuthContext = createContext();

// Export the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the context itself for useContext
export const useAuth = () => useContext(AuthContext);

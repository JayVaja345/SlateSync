import React, { useState } from "react";
import { loginfunc } from "../../Services/Apis";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

const Login = () => {
  const { setUser, setToken } = useAuth();

  const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await loginfunc(data);
      console.log("Login Response:", response);

      if (response.status === 200) {
        alert("Login Successfully");
        localStorage.setItem("token", response.data.token);
        setUser(response.data.user);
        setToken(response.data.token);

        navigate("/dashboard");
      } else {
        alert("Login Failed");
      }
    } catch (err) {
      alert("Login failed: " + err.response?.data);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          onChange={handleChange}
          value={data.email}
        />
        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          onChange={handleChange}
          value={data.password}
        />
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <a href="/register">Register</a>
      </p>
    </div>
  );
};

export default Login;

import React, { useState } from "react";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Configure your backend base URL if not using a proxy
// const API = axios.create({
//   baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080",
// });

function LoginPage() {
  const navigate = useNavigate();

  // Mode: "login" or "register"
  const [mode, setMode] = useState("login");

  // Form fields
  const [role, setRole] = useState("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Feedback states
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const resetMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    resetMessages();
  };

  const parseToken = (data) => {
    if (typeof data === "object" && data !== null) {
      return data.token || data.jwt || data.accessToken || "";
    }
    if (typeof data === "string") {
      return data.includes("Token: ") ? data.split("Token: ")[1].trim() : data.trim();
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
    const payload = mode === "login" 
      ? { username, password,role } 
      : { username, password, role };

    try {
      const response = await axios.post(endpoint, payload);
      const data = response.data;

      // Check for plain-text backend error responses (HTTP 200 with error text)
      if (typeof data === "string" && data.toLowerCase().includes("error")) {
        setErrorMessage(data);
        return;
      }

      if (mode === "register") {
        setSuccessMessage("Registration successful! Please log in.");
        setMode("login");
        setPassword("");
      } else {
        const token = parseToken(data);
        
        // Extract backend-assigned role if available, fallback to selected role
        const assignedRole = (typeof data === "object" && data.role) ? data.role : role;

        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        localStorage.setItem("role", assignedRole);

        // Redirect based on role
        
          navigate("/profile");
      
      }
    } catch (err) {
      if (err.response) {
        const resData = err.response.data;
        const msg = typeof resData === "object" ? resData.message || "Action failed." : resData;
        setErrorMessage(msg || "Action failed. Check credentials.");
      } else {
        setErrorMessage("Server unreachable. Ensure Spring Boot is running on port 8080.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        {/* Toggle Mode */}
        <div className="loger">
          <button
            type="button"
            className={`role-btn ${mode === "login" ? "active" : ""}`}
            onClick={() => handleModeSwitch("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`role-btn ${mode === "register" ? "active" : ""}`}
            onClick={() => handleModeSwitch("register")}
          >
            Register
          </button>
        </div>

        {/* Proper Form wrapper for HTML validation and Enter-key submission */}
        <form className="login-form-content" onSubmit={handleSubmit}>
          <div className="login-form-content2">
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Role dropdown only shown on registration */}
            
              <>
                <label htmlFor="role" style={{ marginTop: "10px" }}>Role:</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginBottom: "10px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Admin / Teacher</option>
                </select>
              </>
            

            {/* Error & Success Messages */}
            {errorMessage && (
              <p style={{ color: "red", fontSize: "13px", margin: "6px 0" }}>
                {errorMessage}
              </p>
            )}
            {successMessage && (
              <p style={{ color: "green", fontSize: "13px", margin: "6px 0" }}>
                {successMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ marginTop: "12px", width: "100%" }}
            >
              {loading
                ? mode === "login"
                  ? "Logging in..."
                  : "Registering..."
                : mode === "login"
                ? "Login"
                : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
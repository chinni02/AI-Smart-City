import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://ai-smart-city-backend.onrender.com";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }

    try {
      setLoading(true);

      console.log("Login API URL:", `${API_URL}/auth/login`);

      const response = await axios.post(
        `${API_URL}/auth/login`,
        {
          username: username.trim(),
          password: password,
        }
      );

      console.log("LOGIN RESPONSE:", response.data);

      const token = response.data.access_token;

      if (!token) {
        setError(
          "Login successful, but no access token was received."
        );
        return;
      }

      localStorage.setItem("access_token", token);

      console.log("Token saved successfully.");

      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error("LOGIN ERROR:", err);

      if (err.response) {
        console.error(
          "STATUS:",
          err.response.status
        );

        console.error(
          "SERVER RESPONSE:",
          err.response.data
        );

        setError(
          err.response.data?.detail ||
          "Invalid username or password."
        );

      } else if (err.request) {
        console.error(
          "Request error:",
          err.message
        );

        setError(
          "Unable to connect to the backend."
        );

      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-icon">
          🏙️
        </div>

        <h1>
          AI Smart City
        </h1>

        <p className="login-subtitle">
          Admin Portal
        </p>

        {error && (
          <div
            className="login-error"
            role="alert"
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

          {/* USERNAME */}

          <div className="login-field">

            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              name="username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              autoComplete="username"
              required
            />

          </div>

          {/* PASSWORD */}

          <div className="login-field">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              autoComplete="current-password"
              required
            />

          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>

        <p className="login-footer">
          AI-powered Smart City Complaint Management
        </p>

      </div>

    </div>
  );
}
export default Login;
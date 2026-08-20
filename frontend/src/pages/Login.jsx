import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

    const response = await axios.post(
      "http://127.0.0.1:8000/auth/login",
      {
        username: username,
        password: password,
      }
    );

    console.log("LOGIN RESPONSE:", response.data);

    const token = response.data.access_token;

    console.log("TOKEN:", token);

    if (!token) {
      setError("Login successful, but no access token was received.");
      return;
    }

    localStorage.setItem("access_token", token);

    console.log("Token saved successfully");

    navigate("/dashboard");

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    setError(
      err.response?.data?.detail ||
      "Invalid username or password."
    );

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

        <h1>AI Smart City</h1>

        <p className="login-subtitle">
          Admin Portal
        </p>

        {error && (
          <div className="login-error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

          <div className="login-field">
            <label>Username</label>

            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
            />
          </div>

          <div className="login-field">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
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
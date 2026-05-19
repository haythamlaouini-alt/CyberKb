import { useState } from "react";
import { useNavigate } from "react-router-dom";

import authService from "../services/authService";

export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await authService.login(
        username,
        password
      );

      localStorage.setItem(
        "token",
        data.access
      );

      navigate("/");
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="login-page">
      <form
        className="login-card"
        onSubmit={handleLogin}
      >
        <h1>CyberKB Login</h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        {error && <p>{error}</p>}

        <button type="submit">
          Login
        </button>
      </form>
    </div>
  );
}
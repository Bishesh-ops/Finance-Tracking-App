// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Logging in...");

    // 1. Create the x-www-form-urlencoded body
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    try {
      // 2. Send the request to the /token endpoint
      const response = await fetch("http://localhost:8000/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (response.ok) {
        // 3. Handle success
        login(data.access_token);
        setUsername("");
        setPassword("");
      } else {
        // 4. Handle errors from the backend
        setMessage(
          `Error: ${
            data.detail || response.statusText || "Something went wrong"
          }`
        );
      }
    } catch (error: unknown) {
      // 5. Handle network or other errors
      let errorMessage =
        "Network error: Could not connect to the backend. (Is it running?)";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setMessage(`Network error: ${errorMessage}`);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "50px auto",
        border: "1px solid #eee",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#333", marginBottom: "20px" }}>
        Login
      </h1>
      <form
        onSubmit={handleLogin}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "16px",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "16px",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "12px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          Login
        </button>
      </form>
      {message && (
        <p
          style={{
            marginTop: "20px",
            textAlign: "center",
            color:
              message.startsWith("Error") || message.startsWith("Network")
                ? "red"
                : "green",
            fontSize: "16px",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

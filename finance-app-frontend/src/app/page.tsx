'use client';

import { useState } from 'react';

export default function HomePage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Registering...');
    try {
      const response = await fetch('http://localhost:8000/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`User registered successfully: ${data.username} (ID: ${data.id})`);
        setUsername('');
        setPassword('');
      } else {
        setMessage(`Error: ${data.detail || response.statusText || 'Something went wrong'}`);
      }
    // --- FIX: Changed 'error: any' to 'error: unknown' and added type narrowing ---
    } catch (error: unknown) { // Use 'unknown' for better type safety
      let errorMessage = 'An unknown error occurred.';
      if (error instanceof Error) { // Check if it's a standard Error object
        errorMessage = error.message;
      } else if (typeof error === 'string') { // Check if it's a string
        errorMessage = error;
      }
      setMessage(`Network error: ${errorMessage}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '50px auto', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>Register New User</h1>
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
        />
        <button type="submit" style={{ padding: '12px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
          Register
        </button>
      </form>
      {message && <p style={{ marginTop: '20px', textAlign: 'center', color: message.startsWith('Error') || message.startsWith('Network error') ? 'red' : 'green', fontSize: '16px' }}>{message}</p>}
    </div>
  );
}
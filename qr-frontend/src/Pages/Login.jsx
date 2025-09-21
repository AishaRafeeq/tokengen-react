import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../Services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await API.post('auth/token/', { username, password });
      localStorage.setItem('accessToken', res.data.access);
      localStorage.setItem('refreshToken', res.data.refresh);
      navigate('/');
    } catch (err) {
      setError('Invalid username or password.');
    }
  };

  return (
    <div style={loginWrapper}>
      <div style={loginCard}>
        <div style={logoBox}>
          <span style={logoText}>FIRST FLIGHT</span>
        </div>
        <form onSubmit={handleSubmit} style={formStyle}>
          <h2 style={loginTitle}>Login</h2>
          {error && <p style={errorStyle}>{error}</p>}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
            required
          />
          <button type="submit" style={btnStyle}>Login</button>
        </form>
      </div>
    </div>
  );
}

const loginWrapper = {
  minHeight: '100vh',
  width: '100vw',
  background: '#F9FAFB',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const loginCard = {
  width: '100%',
  maxWidth: 380,
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  padding: '36px 32px 28px 32px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const logoBox = {
  width: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 24,
};

const logoText = {
  fontSize: 28,
  fontWeight: 800,
  color: "#2563EB",
  letterSpacing: 2,
  fontFamily: "Segoe UI, sans-serif",
};

const formStyle = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const loginTitle = {
  fontSize: 22,
  fontWeight: 700,
  marginBottom: 18,
  color: "#2563EB",
  letterSpacing: 1,
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  margin: '10px 0',
  borderRadius: '8px',
  border: '1px solid #CBD5E1',
  fontSize: 15,
  background: "#F3F4F6",
};

const btnStyle = {
  width: '100%',
  padding: '12px',
  marginTop: '14px',
  backgroundColor: '#2563EB',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 700,
  fontSize: 16,
  cursor: 'pointer',
  letterSpacing: 1,
  boxShadow: "0 2px 8px rgba(37,99,235,0.08)",
  transition: "background 0.2s",
};

const errorStyle = {
  color: 'red',
  marginBottom: '10px',
  width: "100%",
  textAlign: "center",
};
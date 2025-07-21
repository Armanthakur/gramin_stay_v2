import React, { useState } from 'react';
// Google login removed
import { useNavigate } from 'react-router-dom';

const UserLoginPage = () => {
  const [loginForm, setLoginForm] = useState({ username: '', phone: '', password: '' });
  const [loginMessage, setLoginMessage] = useState('');
  const navigate = useNavigate();

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginMessage('');
    console.log('Submitting login:', loginForm);
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (res.ok) {
        setLoginMessage('Login successful!');
        setLoginForm({ username: '', phone: '', password: '' });
        navigate('/');
        window.location.reload();
      } else {
        setLoginMessage(data.error || 'Login failed');
      }
    } catch (err) {
      setLoginMessage('Server error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #3c4d3f, #202e26)' }}>
      <h2 style={{ color: '#fff', marginBottom: '2rem' }}>User Login</h2>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', minWidth: 320, maxWidth: 400 }}>
        {/* User Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: 18 }}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={loginForm.username}
            onChange={handleLoginChange}
            required
            style={{ padding: '0.7rem', borderRadius: 8, border: '1px solid #ccc' }}
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={loginForm.phone}
            onChange={handleLoginChange}
            required
            style={{ padding: '0.7rem', borderRadius: 8, border: '1px solid #ccc' }}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={handleLoginChange}
            required
            style={{ padding: '0.7rem', borderRadius: 8, border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ background: '#4e7c50', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>
            Login
          </button>
          {loginMessage && <div style={{ color: loginMessage.includes('success') ? 'green' : 'red', marginTop: 8 }}>{loginMessage}</div>}
        </form>
      </div>
    </div>
  );
};

export default UserLoginPage; 
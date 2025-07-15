import React, { useState } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // TODO: Replace with your actual client ID

const UserLoginPage = () => {
  const [form, setForm] = useState({ username: '', phone: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Registration successful!');
        setForm({ username: '', phone: '', password: '' });
      } else {
        setMessage(data.error || 'Registration failed');
      }
    } catch (err) {
      setMessage('Server error');
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    // Handle successful Google login here
    console.log('Google login success:', credentialResponse);
    // Redirect or update UI as needed
  };

  const handleGoogleError = () => {
    console.log('Google login failed');
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #3c4d3f, #202e26)' }}>
        <h2 style={{ color: '#fff', marginBottom: '2rem' }}>User Login</h2>
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', minWidth: 320 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
              style={{ padding: '0.7rem', borderRadius: 8, border: '1px solid #ccc' }}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
              style={{ padding: '0.7rem', borderRadius: 8, border: '1px solid #ccc' }}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              style={{ padding: '0.7rem', borderRadius: 8, border: '1px solid #ccc' }}
            />
            <button type="submit" style={{ background: '#4e7c50', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>
              Register / Login
            </button>
            {message && <div style={{ color: message.includes('success') ? 'green' : 'red', marginTop: 8 }}>{message}</div>}
          </form>
          <div style={{ textAlign: 'center', margin: '1.5rem 0 0.5rem', color: '#888' }}>or</div>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            width="300"
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default UserLoginPage; 
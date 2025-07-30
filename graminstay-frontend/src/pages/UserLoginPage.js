import React, { useState } from 'react';
// Google login removed
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../AuthContext";

const UserLoginPage = () => {
  const [loginForm, setLoginForm] = useState({ username: '', phone: '', password: '' });
  const [loginMessage, setLoginMessage] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginMessage('');
    console.log('Submitting login:', loginForm);
    // Use correct backend URL depending on environment
    const backendUrl = process.env.NODE_ENV === 'production'
      ? 'https://gramin-stay-v2-backend.onrender.com'
      : '';
    try {
      const res = await fetch(`${backendUrl}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (res.ok) {
        setLoginMessage('Login successful!');
        setLoginForm({ username: '', phone: '', password: '' });
        setUser(data.user); // <-- set user in context
        navigate('/');
      } else {
        setLoginMessage(data.error || 'Login failed');
      }
    } catch (err) {
      setLoginMessage('Server error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '90vh', background: 'rgb(234, 234, 234)' }}>
      <h2 style={{ color: 'black', marginBottom: '2rem', animation: 'fadeInDown 1s ease' }}>User Login</h2>
      <div style={{
        background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', minWidth: 320, maxWidth: 400, animation: 'fadeIn 0.5s ease',
        transform: 'translateY(0)',
        transition: 'transform 0.3s ease',
        boxshadow: '0.3s ease'}}>
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
        <button type="submit" className="find-near-me">
          Login
        </button>
        {loginMessage && <div style={{ color: loginMessage.includes('success') ? 'green' : 'red', marginTop: 8 }}>{loginMessage}</div>}
      </form>
    </div>
    </div >
  );
};

export default UserLoginPage;
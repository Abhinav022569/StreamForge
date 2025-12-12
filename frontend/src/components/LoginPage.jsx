import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ParticlesBackground from './ParticlesBackground';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <ParticlesBackground>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="card" style={{ 
          width: '100%', 
          maxWidth: '400px',
          background: 'rgba(24, 24, 27, 0.8)', // Glassmorphism
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
        }}>
          <h2 style={{ textAlign: 'center' }}>Welcome Back</h2>
          {error && <p style={{color: '#ef4444', textAlign: 'center', fontSize: '14px', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '4px'}}>{error}</p>}
          
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input 
              className="input-field" 
              type="email" 
              placeholder="you@example.com"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              className="input-field" 
              type="password" 
              placeholder="••••••••"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} onClick={handleLogin}>
            Log In
          </button>

          <p className="muted" style={{ textAlign: 'center', fontSize: '14px', marginTop: '15px' }}>
            Don't have an account? <span className="link" onClick={() => navigate('/signup')}>Sign up</span>
          </p>

          <div style={{textAlign: 'center', marginTop: '20px'}}>
              <span className="link" style={{color: '#6b7280', fontSize: '12px'}} onClick={() => navigate('/')}>← Back to Home</span>
          </div>
        </div>
      </div>
    </ParticlesBackground>
  );
};

export default LoginPage;
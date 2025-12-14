import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ParticlesBackground from './ParticlesBackground';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    // Prevent default form submission if triggered by a form event
    if (e) e.preventDefault(); 
    
    try {
      const response = await axios.post('http://127.0.0.1:5000/login', formData);
      
      // 1. Store Token & User Data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // 2. Redirect Based on Role (Logic integrated from update)
      if (response.data.user.is_admin) {
          navigate('/admin');
      } else {
          navigate('/dashboard');
      }

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
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          padding: '40px',
          borderRadius: '16px'
        }}>
          <h2 style={{ textAlign: 'center', color: 'white', marginBottom: '20px' }}>Welcome Back</h2>
          
          {error && (
            <p style={{
                color: '#ef4444', 
                textAlign: 'center', 
                fontSize: '14px', 
                background: 'rgba(239, 68, 68, 0.1)', 
                padding: '8px', 
                borderRadius: '4px',
                marginBottom: '20px'
            }}>
                {error}
            </p>
          )}
          
          <div className="input-group" style={{ marginBottom: '15px' }}>
            <label className="input-label" style={{ display: 'block', color: '#9ca3af', marginBottom: '5px', fontSize: '14px' }}>Email Address</label>
            <input 
              className="input-field" 
              type="email" 
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#27272a',
                  border: '1px solid #3f3f46',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
              }}
            />
          </div>

          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label className="input-label" style={{ display: 'block', color: '#9ca3af', marginBottom: '5px', fontSize: '14px' }}>Password</label>
            <input 
              className="input-field" 
              type="password" 
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#27272a',
                  border: '1px solid #3f3f46',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
              }}
            />
          </div>

          <button 
            className="btn btn-success" 
            style={{ 
                width: '100%', 
                marginTop: '10px',
                padding: '10px',
                background: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
            }} 
            onClick={handleLogin}
          >
            Log In
          </button>

          <p className="muted" style={{ textAlign: 'center', fontSize: '14px', marginTop: '15px', color: '#9ca3af' }}>
            Don't have an account? <span className="link" onClick={() => navigate('/signup')} style={{ color: '#3b82f6', cursor: 'pointer' }}>Sign up</span>
          </p>

          <div style={{textAlign: 'center', marginTop: '20px'}}>
              <span className="link" style={{color: '#6b7280', fontSize: '12px', cursor: 'pointer'}} onClick={() => navigate('/')}>← Back to Home</span>
          </div>
        </div>
      </div>
    </ParticlesBackground>
  );
};

export default LoginPage;
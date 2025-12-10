import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/login', formData);
      
      // SAVE THE TOKEN
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect to the App
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center' }}>Welcome Back</h2>
        {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}
        
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
  );
};

export default LoginPage;
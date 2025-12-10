import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Placeholder logic
    alert("Login logic will be connected later!");
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center' }}>Welcome Back</h2>
        
        <div className="input-group">
          <label className="input-label">Email Address</label>
          <input className="input-field" type="email" placeholder="you@example.com" />
        </div>

        <div className="input-group">
          <label className="input-label">Password</label>
          <input className="input-field" type="password" placeholder="••••••••" />
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
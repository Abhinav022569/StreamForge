import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSignup = async () => {
    try {
      await axios.post('http://127.0.0.1:5000/signup', formData);
      alert("Account created! Please log in.");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center' }}>Create Account</h2>
        {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}
        
        <div className="input-group">
          <label className="input-label">Full Name</label>
          <input 
            className="input-field" 
            type="text" 
            placeholder="John Doe"
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
          />
        </div>

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

        <button className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} onClick={handleSignup}>
          Sign Up Free
        </button>

        <p className="muted" style={{ textAlign: 'center', fontSize: '14px', marginTop: '15px' }}>
          Already have an account? <span className="link" onClick={() => navigate('/login')}>Log in</span>
        </p>
        
        <div style={{textAlign: 'center', marginTop: '20px'}}>
            <span className="link" style={{color: '#6b7280', fontSize: '12px'}} onClick={() => navigate('/')}>← Back to Home</span>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
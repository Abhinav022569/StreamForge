import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import ParticlesBackground from './ParticlesBackground';
import '../App.css'; 

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post('http://192.168.1.12:5000/login', formData);
      
      // 1. Store Token & User Data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // 2. Redirect Based on Role
      if (response.data.user.is_admin) {
          navigate('/admin');
      } else {
          navigate('/dashboard');
      }

    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { 
        duration: 0.5, 
        ease: "easeOut",
        staggerChildren: 0.1 
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <ParticlesBackground>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', position: 'relative' }}>
        
        {/* Background Glow Effect */}
        <div style={{
          position: 'absolute',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}></div>

        <motion.div 
          className="card" 
          style={{ 
            width: '100%', 
            maxWidth: '420px',
            background: 'rgba(24, 24, 27, 0.65)', // Glass effect matching Signup
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(16, 185, 129, 0.2)', // Emerald tint border
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            padding: '40px',
            borderRadius: '16px',
            position: 'relative',
            zIndex: 1,
            overflow: 'hidden'
          }}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Top Decorative Line */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, #10b981, transparent)' }}></div>

          <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 10px 0', color: 'white' }}>Welcome Back</h2>
            <p style={{ color: '#a1a1aa', fontSize: '15px', margin: 0 }}>
               Log in to manage your pipelines.
            </p>
          </motion.div>
          
          {error && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }}
              style={{
                color: '#f87171', 
                textAlign: 'center', 
                fontSize: '14px', 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '10px', 
                borderRadius: '6px',
                marginBottom: '20px'
            }}>
                {error}
            </motion.p>
          )}
          
          <form onSubmit={handleLogin}>
            <motion.div variants={itemVariants} className="input-group" style={{ marginBottom: '20px' }}>
              <label className="input-label" style={{ color: '#10b981', fontWeight: '600', fontSize: '12px', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>EMAIL ADDRESS</label>
              <input 
                className="input-field" 
                type="email" 
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="input-group" style={{ marginBottom: '25px' }}>
              <label className="input-label" style={{ color: '#10b981', fontWeight: '600', fontSize: '12px', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>PASSWORD</label>
              <input 
                className="input-field" 
                type="password" 
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </motion.div>

            <motion.button 
              variants={itemVariants}
              className="btn btn-success" 
              style={{ 
                  width: '100%', 
                  padding: '12px',
                  background: '#10b981',
                  color: 'black', // Black text on green button for contrast
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)'
              }}
              whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(16, 185, 129, 0.5)' }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? 'Logging In...' : 'Log In'}
            </motion.button>
          </form>

          <motion.p variants={itemVariants} className="muted" style={{ textAlign: 'center', fontSize: '14px', marginTop: '25px', color: '#a1a1aa' }}>
            Don't have an account? <span className="link" onClick={() => navigate('/signup')} style={{ color: '#10b981', cursor: 'pointer', fontWeight: '500' }}>Sign up</span>
          </motion.p>

          <motion.div variants={itemVariants} style={{textAlign: 'center', marginTop: '15px'}}>
              <span 
                className="link" 
                style={{color: '#6b7280', fontSize: '13px', cursor: 'pointer', transition: 'color 0.2s'}} 
                onClick={() => navigate('/')}
                onMouseEnter={(e) => e.target.style.color = 'white'}
                onMouseLeave={(e) => e.target.style.color = '#6b7280'}
              >
                ← Back to Home
              </span>
          </motion.div>
        </motion.div>
      </div>
    </ParticlesBackground>
  );
};

export default LoginPage;
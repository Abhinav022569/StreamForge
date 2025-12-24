import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ParticlesBackground from './ParticlesBackground';
import '../App.css'; 

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // NEW: Success state
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault(); 
    setIsLoading(true);
    setError('');   // Clear previous errors
    setSuccess(''); // Clear previous success messages

    try {
      await axios.post('http://127.0.0.1:5000/signup', formData);
      
      // REPLACED ALERT WITH IN-APP MESSAGE
      setSuccess("Account created successfully! Redirecting to login...");
      
      // Small delay before redirect so user can see the message
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      // Ensure specific error message from backend is shown
      setError(err.response?.data?.error || "Signup failed. Please try again.");
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
      transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <ParticlesBackground>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', position: 'relative', padding: '20px' }}>
        
        {/* Background Glow Effect */}
        <div style={{
          position: 'absolute', width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0
        }}></div>

        <motion.div 
          className="card auth-card-responsive" 
          style={{ 
            width: '100%', maxWidth: '420px',
            background: 'rgba(24, 24, 27, 0.65)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(16, 185, 129, 0.2)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            padding: '40px', position: 'relative', zIndex: 1, overflow: 'hidden'
          }}
          initial="hidden" animate="visible" variants={containerVariants}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, #10b981, transparent)' }}></div>

          <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '30px' }}>
             <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 10px 0', color: 'white' }}>Join StreamForge</h2>
             <p style={{ color: '#a1a1aa', fontSize: '15px', margin: 0 }}>Start building visual data pipelines today.</p>
          </motion.div>

          {/* ERROR MESSAGE BLOCK */}
          <AnimatePresence>
            {error && (
                <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ 
                    color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', 
                    border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px', 
                    borderRadius: '6px', fontSize: '14px', marginBottom: '20px', textAlign: 'center'
                }}
                >
                {error}
                </motion.div>
            )}
          </AnimatePresence>

          {/* SUCCESS MESSAGE BLOCK */}
          <AnimatePresence>
            {success && (
                <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ 
                    color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', 
                    border: '1px solid rgba(16, 185, 129, 0.2)', padding: '10px', 
                    borderRadius: '6px', fontSize: '14px', marginBottom: '20px', textAlign: 'center'
                }}
                >
                {success}
                </motion.div>
            )}
          </AnimatePresence>
          
          <form onSubmit={handleSignup}>
            <motion.div variants={itemVariants} className="input-group">
              <label className="input-label" style={{ color: '#10b981', fontWeight: '600', fontSize: '12px', letterSpacing: '0.5px' }}>FULL NAME</label>
              <input 
                className="input-field" type="text" placeholder="John Doe"
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.3s ease' }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="input-group">
              <label className="input-label" style={{ color: '#10b981', fontWeight: '600', fontSize: '12px', letterSpacing: '0.5px' }}>EMAIL ADDRESS</label>
              <input 
                className="input-field" type="email" placeholder="you@company.com"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.3s ease' }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="input-group">
              <label className="input-label" style={{ color: '#10b981', fontWeight: '600', fontSize: '12px', letterSpacing: '0.5px' }}>PASSWORD</label>
              <input 
                className="input-field" type="password" placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.3s ease' }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </motion.div>

            <motion.button 
              variants={itemVariants}
              className="btn btn-success" 
              style={{ width: '100%', marginTop: '15px', padding: '12px', fontSize: '16px', fontWeight: 'bold', boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)' }}
              whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(16, 185, 129, 0.5)' }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up Free'}
            </motion.button>
          </form>

          <motion.p variants={itemVariants} className="muted" style={{ textAlign: 'center', fontSize: '14px', marginTop: '25px', color: '#a1a1aa' }}>
            Already have an account? <span className="link" onClick={() => navigate('/login')} style={{ color: '#10b981', cursor: 'pointer', fontWeight: '500' }}>Log in</span>
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

export default SignupPage;
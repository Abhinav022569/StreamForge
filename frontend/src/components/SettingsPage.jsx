import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Network, 
  Users, 
  Database, 
  HardDrive, 
  Settings, 
  LogOut, 
  User, 
  Zap,
  Save,
  Lock,
  UserX,
  Mail,
  Type
} from 'lucide-react';
import logo from '../assets/logo.png';
import '../App.css'; 

const SettingsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: '', email: '' });
  
  // Profile Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Password Form States
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!token) {
        navigate('/login');
        return;
    }

    if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        
        // Split username into First/Last for UI display
        const nameParts = (parsed.username || '').split(' ');
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleProfileUpdate = async () => {
      const token = localStorage.getItem('token');
      const fullName = `${firstName} ${lastName}`.trim();
      
      try {
          const res = await axios.put('http://127.0.0.1:5000/user/profile', 
            { username: fullName, email: user.email }, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          const updatedUser = res.data.user;
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser)); // Update local storage
          alert("Profile updated successfully!");
      } catch (err) {
          alert("Failed to update profile: " + (err.response?.data?.error || err.message));
      }
  };

  const handlePasswordChange = async () => {
      if (passData.newPassword !== passData.confirmPassword) {
          alert("New passwords do not match!");
          return;
      }
      
      const token = localStorage.getItem('token');
      try {
          await axios.put('http://127.0.0.1:5000/user/password', 
            { currentPassword: passData.currentPassword, newPassword: passData.newPassword }, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          alert("Password changed successfully!");
          setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } catch (err) {
          alert("Password change failed: " + (err.response?.data?.error || err.message));
      }
  };

  const handleDeleteAccount = async () => {
      if (!window.confirm("Are you SURE you want to delete your account? This action cannot be undone.")) return;
      
      const token = localStorage.getItem('token');
      try {
          await axios.delete('http://127.0.0.1:5000/user/account', {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          localStorage.clear();
          navigate('/login');
          alert("Account deleted.");
      } catch (err) {
          alert("Failed to delete account: " + (err.response?.data?.error || err.message));
      }
  };

  // --- Animations ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
  };

  return (
    <div className="app-container" style={{ background: '#0f1115', position: 'relative', overflow: 'hidden', height: '100vh', display: 'flex' }}>
      
      {/* Background Decor */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>

      {/* 1. SIDEBAR - NON-SCROLLABLE */}
      <motion.aside 
        className="sidebar"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
            background: 'rgba(24, 24, 27, 0.6)', 
            backdropFilter: 'blur(12px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',          
            flexDirection: 'column',  
            justifyContent: 'space-between',
            padding: 0,
            height: '100%',
            overflow: 'hidden',
            flexShrink: 0,
            width: '260px'
        }}
      >
        {/* TOP SECTION */}
        <div style={{ padding: '20px' }}>
            <div className="sidebar-logo" style={{ marginBottom: '40px', paddingLeft: '10px' }}>
              <img src={logo} alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '4px', boxShadow: '0 0 10px rgba(16,185,129,0.4)' }} />
              <span style={{ fontWeight: '700', letterSpacing: '0.5px' }}>StreamForge</span>
            </div>

            <nav className="sidebar-nav">
              <SidebarItem label="Overview" icon={<LayoutDashboard size={20} />} onClick={() => navigate('/dashboard')} />
              <SidebarItem label="All Pipelines" icon={<Network size={20} />} onClick={() => navigate('/pipelines')} />
              <SidebarItem label="Collaboration" icon={<Users size={20} />} onClick={() => navigate('/collaboration')} />
              <SidebarItem label="Data Sources" icon={<Database size={20} />} onClick={() => navigate('/datasources')} />
              <SidebarItem label="Processed Data" icon={<HardDrive size={20} />} onClick={() => navigate('/processed')} />
              <SidebarItem label="Settings" icon={<Settings size={20} />} active />
            </nav>
        </div>

        {/* BOTTOM SECTION */}
        <div style={{ 
            padding: '20px', 
            borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
            background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ 
                    width: '40px', height: '40px', 
                    borderRadius: '10px', 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 4px 10px rgba(16,185,129,0.2)'
                }}>
                    <User size={20} strokeWidth={2.5} />
                </div>
                <div style={{ overflow: 'hidden' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'white' }}>{user.username}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                       <Zap size={10} fill="#eab308" color="#eab308" /> Pro Plan
                    </p>
                </div>
            </div>

            <motion.button 
                onClick={handleLogout}
                style={{ 
                    width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    background: 'rgba(239, 68, 68, 0.05)',
                    color: '#f87171',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
                whileHover={{ 
                    background: 'rgba(239, 68, 68, 0.15)', 
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    boxShadow: '0 0 15px rgba(239, 68, 68, 0.1)' 
                }}
                whileTap={{ scale: 0.98 }}
            >
                <LogOut size={16} />
                Logout
            </motion.button>
        </div>
      </motion.aside>

      {/* 2. MAIN CONTENT - Independently Scrollable */}
      <main className="main-content" style={{ position: 'relative', zIndex: 1, overflowY: 'auto', flexGrow: 1, height: '100%' }}>
        <motion.div 
          className="content-wrapper" 
          style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '60px' }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          
          <motion.div style={{ marginBottom: '40px' }} variants={itemVariants}>
            <h1 style={{ fontSize: '32px', marginBottom: '5px', margin: 0, background: 'linear-gradient(90deg, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>My Profile</h1>
            <p className="text-muted" style={{ margin: 0, fontSize: '14px' }}>Manage your personal information and profile details.</p>
          </motion.div>

          {/* SECTION 1: PERSONAL INFORMATION */}
          <motion.div 
            className="card" 
            variants={itemVariants}
            style={{ 
                padding: '30px', marginBottom: '30px',
                background: 'rgba(24, 24, 27, 0.4)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>Personal Information</h3>
            
            <div className="flex gap-20" style={{ marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                    <label className="input-label" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><Type size={14}/> First Name</label>
                    <input 
                        className="input-field" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        style={{ background: '#18181b', border: '1px solid #3f3f46', color: 'white', width: '100%', padding: '10px', borderRadius: '6px' }}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label className="input-label" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><Type size={14}/> Last Name</label>
                    <input 
                        className="input-field" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        style={{ background: '#18181b', border: '1px solid #3f3f46', color: 'white', width: '100%', padding: '10px', borderRadius: '6px' }}
                    />
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label className="input-label" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><Mail size={14}/> Email Address</label>
                <input 
                    className="input-field" 
                    value={user.email} 
                    disabled
                    style={{ background: '#18181b', border: '1px solid #3f3f46', color: 'white', width: '100%', padding: '10px', borderRadius: '6px', opacity: 0.6, cursor: 'not-allowed' }}
                />
            </div>

            <div style={{ textAlign: 'right' }}>
                <motion.button 
                    className="btn btn-success" 
                    onClick={handleProfileUpdate}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Save size={16} /> Save Changes
                </motion.button>
            </div>
          </motion.div>

          {/* SECTION 2: PASSWORD */}
          <motion.div 
            className="card" 
            variants={itemVariants}
            style={{ 
                padding: '30px', marginBottom: '30px',
                background: 'rgba(24, 24, 27, 0.4)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>Password & Security</h3>
            
            <div style={{ marginBottom: '20px' }}>
                <label className="input-label" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><Lock size={14}/> Current Password</label>
                <input 
                    className="input-field" 
                    type="password" 
                    placeholder="••••••••" 
                    value={passData.currentPassword}
                    onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                    style={{ background: '#18181b', border: '1px solid #3f3f46', color: 'white', width: '100%', padding: '10px', borderRadius: '6px' }}
                />
            </div>

            <div className="flex gap-20" style={{ marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                    <label className="input-label" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><Lock size={14}/> New Password</label>
                    <input 
                        className="input-field" 
                        type="password" 
                        placeholder="Enter new password" 
                        value={passData.newPassword}
                        onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                        style={{ background: '#18181b', border: '1px solid #3f3f46', color: 'white', width: '100%', padding: '10px', borderRadius: '6px' }}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label className="input-label" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><Lock size={14}/> Confirm Password</label>
                    <input 
                        className="input-field" 
                        type="password" 
                        placeholder="Confirm new password" 
                        value={passData.confirmPassword}
                        onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                        style={{ background: '#18181b', border: '1px solid #3f3f46', color: 'white', width: '100%', padding: '10px', borderRadius: '6px' }}
                    />
                </div>
            </div>

            <div style={{ textAlign: 'right' }}>
                <motion.button 
                    className="btn btn-ghost" 
                    onClick={handlePasswordChange}
                    style={{ border: '1px solid rgba(255,255,255,0.2)', color: '#d4d4d8' }}
                    whileHover={{ background: 'rgba(255,255,255,0.05)', borderColor: 'white' }}
                    whileTap={{ scale: 0.95 }}
                >
                    Update Password
                </motion.button>
            </div>
          </motion.div>

          {/* SECTION 3: DELETE ACCOUNT */}
          <motion.div 
            className="card" 
            variants={itemVariants}
            style={{ 
                padding: '30px', 
                border: '1px solid rgba(239, 68, 68, 0.3)', 
                background: 'rgba(239, 68, 68, 0.05)' 
            }}
          >
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserX size={20} /> Delete Account
            </h3>
            
            <p className="text-muted" style={{ fontSize: '14px', marginBottom: '20px' }}>
                Permanently remove your account and all of its contents from the StreamForge platform. This action is not reversible, so please continue with caution.
            </p>

            <div style={{ textAlign: 'right' }}>
                <motion.button 
                    className="btn" 
                    style={{ 
                        border: '1px solid #f87171', 
                        color: '#f87171', 
                        background: 'transparent',
                        display: 'inline-flex', alignItems: 'center', gap: '6px'
                    }}
                    onClick={handleDeleteAccount}
                    whileHover={{ background: 'rgba(239, 68, 68, 0.1)' }}
                    whileTap={{ scale: 0.95 }}
                >
                    Delete Account
                </motion.button>
            </div>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
};

// Helper for Sidebar Items
const SidebarItem = ({ label, icon, active, onClick }) => (
  <motion.div 
    className={`sidebar-item ${active ? 'active' : ''}`} 
    onClick={onClick}
    whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.05)' }}
    whileTap={{ scale: 0.98 }}
    style={{ 
        cursor: 'pointer', 
        borderLeft: active ? '3px solid #10b981' : '3px solid transparent',
        background: active ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
        padding: '10px 15px',
        marginBottom: '5px',
        borderRadius: '0 6px 6px 0',
        color: active ? '#fff' : '#a1a1aa',
        transition: 'none',
        display: 'flex',
        alignItems: 'center'
    }}
  >
    <span style={{ marginRight: '12px', display: 'flex', alignItems: 'center', color: active ? '#10b981' : 'inherit' }}>{icon}</span>
    <span style={{ fontWeight: active ? '600' : '400', fontSize: '14px' }}>{label}</span>
  </motion.div>
);

export default SettingsPage;
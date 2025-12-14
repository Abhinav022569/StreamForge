import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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

  return (
    // FIXED LAYOUT: Container takes full height, no scroll on body
    <div className="app-container" style={{ height: '100vh', overflow: 'hidden' }}>
      
      {/* 1. SIDEBAR - Fixed height due to container flex */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '4px' }} />
          StreamForge
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-item" onClick={() => navigate('/dashboard')}><span>🏠</span> Overview</div>
          <div className="sidebar-item" onClick={() => navigate('/pipelines')}><span>🚀</span> All Pipelines</div>
          <div className="sidebar-item" onClick={() => navigate('/datasources')}><span>🗄️</span> Data Sources</div>
          <div className="sidebar-item" onClick={() => navigate('/processed')}><span>📦</span> Processed Data</div>
          <div className="sidebar-item active"><span>⚙️</span> Settings</div>
        </nav>

        <div className="sidebar-profile">
            <div className="flex items-center gap-10" style={{ overflow: 'hidden' }}>
                <div className="profile-avatar">👤</div>
                <div style={{ overflow: 'hidden' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85px' }}>{user.username}</p>
                </div>
            </div>
            <button onClick={handleLogout} className="btn-sidebar-logout"><span>🚪</span> Logout</button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT - Independently Scrollable */}
      <main className="main-content" style={{ height: '100%', overflowY: 'auto' }}>
        <div className="content-wrapper" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '60px' }}>
          
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '32px', marginBottom: '10px', margin: 0 }}>My Profile</h1>
            <p className="text-muted" style={{ margin: 0 }}>Manage your personal information and profile details.</p>
          </div>

          {/* SECTION 1: PERSONAL INFORMATION */}
          <div className="card" style={{ padding: '30px', marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Personal Information</h3>
            
            <div className="flex gap-20" style={{ marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                    <label className="input-label">First Name</label>
                    <input 
                        className="input-field" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label className="input-label">Last Name</label>
                    <input 
                        className="input-field" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                    />
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label className="input-label">Email Address</label>
                <input 
                    className="input-field" 
                    value={user.email} 
                    disabled
                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
            </div>

            <div style={{ textAlign: 'right' }}>
                <button className="btn btn-success" onClick={handleProfileUpdate}>Save Changes</button>
            </div>
          </div>

          {/* SECTION 2: PASSWORD */}
          <div className="card" style={{ padding: '30px', marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Password & Security</h3>
            
            <div style={{ marginBottom: '20px' }}>
                <label className="input-label">Current Password</label>
                <input 
                    className="input-field" 
                    type="password" 
                    placeholder="••••••••" 
                    value={passData.currentPassword}
                    onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                />
            </div>

            <div className="flex gap-20" style={{ marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                    <label className="input-label">New Password</label>
                    <input 
                        className="input-field" 
                        type="password" 
                        placeholder="Enter new password" 
                        value={passData.newPassword}
                        onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label className="input-label">Confirm Password</label>
                    <input 
                        className="input-field" 
                        type="password" 
                        placeholder="Confirm new password" 
                        value={passData.confirmPassword}
                        onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                    />
                </div>
            </div>

            <div style={{ textAlign: 'right' }}>
                <button className="btn btn-ghost" onClick={handlePasswordChange}>Update Password</button>
            </div>
          </div>

          {/* SECTION 3: DELETE ACCOUNT */}
          <div className="card" style={{ padding: '30px', borderColor: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: 'var(--danger)' }}>Delete Account</h3>
            
            <p className="text-muted" style={{ fontSize: '14px', marginBottom: '20px' }}>
                Permanently remove your account and all of its contents from the StreamForge platform. This action is not reversible, so please continue with caution.
            </p>

            <div style={{ textAlign: 'right' }}>
                <button 
                    className="btn btn-ghost-danger" 
                    style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                    onClick={handleDeleteAccount}
                >
                    Delete Account
                </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png';
import '../App.css'; 
import { 
  Bell, Mail, Send, AlertTriangle, CheckCircle, Info, 
  X, Monitor, Smartphone, Layout 
} from 'lucide-react';

const AdminCommunication = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: 'Admin' });
  const [activeTab, setActiveTab] = useState('broadcast');
  
  // Broadcast State
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastType, setBroadcastType] = useState('info'); // info, warning, success
  const [broadcastStatus, setBroadcastStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Email State
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailStatus, setEmailStatus] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser.is_admin) {
            navigate('/dashboard'); 
            return;
        }
        setUser(parsedUser);
    } else {
        navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const sendBroadcast = async (e) => {
      e.preventDefault();
      setBroadcastStatus('sending');
      setErrorMessage('');
      try {
          const token = localStorage.getItem('token');
          await axios.post('http://127.0.0.1:5000/admin/broadcast', 
            { message: broadcastMsg, type: broadcastType },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setBroadcastStatus('success');
          // Don't clear msg immediately so they can see what sent
          setTimeout(() => setBroadcastStatus(null), 4000);
      } catch (err) {
          console.error(err);
          const msg = err.response?.data?.error || err.message;
          setErrorMessage(msg);
          setBroadcastStatus('error');
      }
  };

  const sendEmailBlast = async (e) => {
      e.preventDefault();
      setEmailStatus('sending');
      try {
          const token = localStorage.getItem('token');
          await axios.post('http://127.0.0.1:5000/admin/email', 
            { subject: emailSubject, body: emailBody },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setEmailStatus('success');
          setEmailSubject('');
          setEmailBody('');
          setTimeout(() => setEmailStatus(null), 4000);
      } catch (err) {
          console.error(err);
          setEmailStatus('error');
      }
  };

  // Helper to get color based on type
  const getTypeColor = (type) => {
      if (type === 'warning') return '#f59e0b'; // Amber
      if (type === 'success') return '#10b981'; // Emerald
      return '#3b82f6'; // Blue
  };

  const getTypeIcon = (type) => {
      if (type === 'warning') return <AlertTriangle size={20} color="#f59e0b" />;
      if (type === 'success') return <CheckCircle size={20} color="#10b981" />;
      return <Info size={20} color="#3b82f6" />;
  };

  return (
    <div className="app-container">
      
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="Logo" style={{ width: '28px', height: '28px' }} />
          StreamForge <span style={{fontSize:'10px', background:'#ef4444', padding:'2px 4px', borderRadius:'4px', marginLeft:'5px'}}>ADMIN</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-item" onClick={() => navigate('/admin')}><span>🏠</span> Overview</div>
          <div className="sidebar-item" onClick={() => navigate('/admin/users')}><span>👥</span> Users</div>
          <div className="sidebar-item active"><span>📢</span> Communication</div>
        </nav>

        <div className="sidebar-profile">
            <div className="flex items-center gap-10">
                <div className="profile-avatar">🛡️</div>
                <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: 'white' }}>{user.username}</p>
                    <p className="text-muted" style={{ margin: 0, fontSize: '12px' }}>Super Admin</p>
                </div>
            </div>
            <button onClick={handleLogout} className="btn-sidebar-logout"><span>🚪</span> Logout</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <div className="content-wrapper">
          
          <header style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '32px', marginBottom: '8px', marginTop: 0 }}>Communication Center</h1>
            <p className="text-muted" style={{ margin: 0 }}>Manage system-wide announcements and notifications.</p>
          </header>

          {/* TABS */}
          <div style={{ display: 'flex', gap: '5px', marginBottom: '25px', background: 'rgba(255,255,255,0.03)', padding: '5px', borderRadius: '12px', width: 'fit-content' }}>
              <button 
                className="btn"
                style={{ 
                    background: activeTab === 'broadcast' ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: activeTab === 'broadcast' ? '#fff' : '#a1a1aa',
                    border: 'none', borderRadius: '8px', padding: '10px 20px'
                }}
                onClick={() => setActiveTab('broadcast')}
              >
                  <Bell size={16} style={{marginRight: '8px'}}/> System Announcement
              </button>
              <button 
                className="btn"
                style={{ 
                    background: activeTab === 'email' ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: activeTab === 'email' ? '#fff' : '#a1a1aa',
                    border: 'none', borderRadius: '8px', padding: '10px 20px'
                }}
                onClick={() => setActiveTab('email')}
              >
                  <Mail size={16} style={{marginRight: '8px'}}/> Email Blast
              </button>
          </div>

          {/* --- BROADCAST VIEW (2 COLUMN LAYOUT) --- */}
          {activeTab === 'broadcast' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', alignItems: 'start' }}>
                  
                  {/* LEFT: FORM */}
                  <div className="card">
                      <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <h3 style={{ margin: 0 }}>Compose Notification</h3>
                      </div>
                      
                      <div style={{ padding: '25px' }}>
                          {/* Status Alerts */}
                          {broadcastStatus === 'success' && (
                              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                  <CheckCircle size={18} /> Broadcast sent successfully to all active users.
                              </div>
                          )}
                          {broadcastStatus === 'error' && (
                              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                  <AlertTriangle size={18} /> {errorMessage || "Failed to send broadcast."}
                              </div>
                          )}

                          <form onSubmit={sendBroadcast}>
                              <div className="input-group">
                                  <label className="input-label" style={{marginBottom: '12px'}}>Notification Severity</label>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                                      {['info', 'warning', 'success'].map(type => (
                                          <div 
                                            key={type}
                                            onClick={() => setBroadcastType(type)}
                                            style={{
                                                padding: '15px', borderRadius: '8px', cursor: 'pointer',
                                                border: `1px solid ${broadcastType === type ? getTypeColor(type) : 'rgba(255,255,255,0.1)'}`,
                                                background: broadcastType === type ? `${getTypeColor(type)}1A` : 'rgba(255,255,255,0.02)',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                                                transition: 'all 0.2s'
                                            }}
                                          >
                                              {getTypeIcon(type)}
                                              <span style={{ textTransform: 'capitalize', fontSize: '13px', fontWeight: '500', color: broadcastType === type ? '#fff' : '#a1a1aa' }}>{type}</span>
                                          </div>
                                      ))}
                                  </div>
                              </div>

                              <div className="input-group">
                                  <label className="input-label">Message Content</label>
                                  <textarea 
                                    className="input-field" 
                                    rows="5" 
                                    placeholder="Enter your announcement here..."
                                    value={broadcastMsg}
                                    onChange={(e) => setBroadcastMsg(e.target.value)}
                                    style={{ resize: 'vertical', fontSize: '14px', lineHeight: '1.5' }}
                                    required
                                  />
                              </div>

                              <div style={{ textAlign: 'right' }}>
                                  <button 
                                    type="submit" 
                                    className="btn"
                                    disabled={broadcastStatus === 'sending'}
                                    style={{ 
                                        background: '#3b82f6', color: 'white', border: 'none', 
                                        padding: '12px 24px', borderRadius: '8px', fontWeight: '600',
                                        opacity: broadcastStatus === 'sending' ? 0.7 : 1,
                                        display: 'inline-flex', alignItems: 'center', gap: '8px'
                                    }}
                                  >
                                      {broadcastStatus === 'sending' ? 'Broadcasting...' : 'Send Broadcast'} <Send size={16} />
                                  </button>
                              </div>
                          </form>
                      </div>
                  </div>

                  {/* RIGHT: LIVE PREVIEW */}
                  <div style={{ position: 'sticky', top: '20px' }}>
                      <div className="card" style={{ overflow: 'hidden' }}>
                          <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Monitor size={16} color="#a1a1aa" /> 
                              <span style={{ fontSize: '13px', color: '#a1a1aa', fontWeight: '600' }}>LIVE PREVIEW</span>
                          </div>
                          
                          <div style={{ padding: '30px', background: '#000', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                              <p style={{ color: '#52525b', fontSize: '12px', marginBottom: '20px' }}>User's Screen</p>
                              
                              {/* Notification Mockup */}
                              <div style={{ 
                                  width: '320px', 
                                  background: '#18181b', 
                                  border: '1px solid rgba(255,255,255,0.1)', 
                                  borderRadius: '12px',
                                  boxShadow: '0 20px 50px -10px rgba(0,0,0,0.5)',
                                  overflow: 'hidden',
                                  position: 'relative'
                              }}>
                                  <div style={{ padding: '16px', display: 'flex', gap: '15px' }}>
                                      <div style={{ 
                                          width: '40px', height: '40px', borderRadius: '50%', 
                                          background: `${getTypeColor(broadcastType)}20`, 
                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          flexShrink: 0
                                      }}>
                                          {getTypeIcon(broadcastType)}
                                      </div>
                                      <div>
                                          <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#fff' }}>System Notification</h4>
                                          <p style={{ margin: 0, fontSize: '13px', color: '#a1a1aa', lineHeight: '1.4' }}>
                                              {broadcastMsg || "Your announcement message will appear here..."}
                                          </p>
                                          <span style={{ display: 'block', marginTop: '8px', fontSize: '11px', color: '#52525b' }}>Just now</span>
                                      </div>
                                  </div>
                                  {/* Progress bar line for visual effect */}
                                  <div style={{ height: '3px', background: getTypeColor(broadcastType), width: '60%' }}></div>
                              </div>

                          </div>
                      </div>
                  </div>

              </div>
          )}

          {/* --- EMAIL BLAST VIEW --- */}
          {activeTab === 'email' && (
              <div className="card" style={{ maxWidth: '800px' }}>
                  <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <h3 style={{ margin: 0 }}>Create Email Campaign</h3>
                  </div>
                  <div style={{ padding: '25px' }}>
                      
                      {emailStatus === 'success' && (
                          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                              ✓ Emails queued successfully!
                          </div>
                      )}

                      <form onSubmit={sendEmailBlast}>
                          <div className="input-group">
                              <label className="input-label">Subject Line</label>
                              <input 
                                type="text"
                                className="input-field" 
                                placeholder="e.g., New Features: Gemini AI Integration"
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                                required
                              />
                          </div>

                          <div className="input-group">
                              <label className="input-label">Email Body</label>
                              <textarea 
                                className="input-field" 
                                rows="8" 
                                placeholder="Dear users..."
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.target.value)}
                                required
                              />
                          </div>

                          <button 
                            type="submit" 
                            className="btn"
                            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px' }}
                            disabled={emailStatus === 'sending'}
                          >
                              {emailStatus === 'sending' ? 'Sending...' : 'Queue Emails'}
                          </button>
                      </form>
                  </div>
              </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminCommunication;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png';
import '../App.css'; 
import { Bell, Mail, Send, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const AdminCommunication = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: 'Admin' });
  const [activeTab, setActiveTab] = useState('broadcast');
  
  // Broadcast State
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastType, setBroadcastType] = useState('info');
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
          setBroadcastMsg('');
          setTimeout(() => setBroadcastStatus(null), 3000);
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
          setTimeout(() => setEmailStatus(null), 3000);
      } catch (err) {
          console.error(err);
          setEmailStatus('error');
      }
  };

  return (
    <div className="app-container">
      
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="Logo" style={{ width: '28px', height: '28px' }} />
          StreamForge <span style={{fontSize:'10px', background:'red', padding:'2px 4px', borderRadius:'4px', marginLeft:'5px'}}>ADMIN</span>
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
          
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '32px', marginBottom: '10px', margin: 0 }}>Communication Center</h1>
            <p className="text-muted" style={{ margin: 0 }}>Send system-wide announcements and updates.</p>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
              <button 
                className={`btn ${activeTab === 'broadcast' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveTab('broadcast')}
              >
                  <Bell size={16} /> System Announcement
              </button>
              <button 
                className={`btn ${activeTab === 'email' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveTab('email')}
              >
                  <Mail size={16} /> Email Blast
              </button>
          </div>

          {activeTab === 'broadcast' && (
              <div className="card" style={{ maxWidth: '600px' }}>
                  <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
                      <h3 style={{ margin: 0 }}>Create System Notification</h3>
                      <p className="text-muted" style={{ fontSize: '13px', marginTop: '5px' }}>
                          This will trigger a popup notification for all active users immediately.
                      </p>
                  </div>
                  <div style={{ padding: '20px' }}>
                      <form onSubmit={sendBroadcast}>
                          <div className="input-group">
                              <label className="input-label">Notification Type</label>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                  {['info', 'warning', 'success'].map(type => (
                                      <div 
                                        key={type}
                                        onClick={() => setBroadcastType(type)}
                                        style={{
                                            padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
                                            border: `1px solid ${broadcastType === type ? '#3b82f6' : 'var(--border-light)'}`,
                                            background: broadcastType === type ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                            textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '5px'
                                        }}
                                      >
                                          {type === 'info' && <Info size={14} color="#3b82f6" />}
                                          {type === 'warning' && <AlertTriangle size={14} color="#fbbf24" />}
                                          {type === 'success' && <CheckCircle size={14} color="#10b981" />}
                                          {type}
                                      </div>
                                  ))}
                              </div>
                          </div>

                          <div className="input-group">
                              <label className="input-label">Message</label>
                              <textarea 
                                className="input-field" 
                                rows="4" 
                                placeholder="e.g., Scheduled maintenance at 10 PM EST..."
                                value={broadcastMsg}
                                onChange={(e) => setBroadcastMsg(e.target.value)}
                                required
                              />
                          </div>

                          <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={broadcastStatus === 'sending'}
                          >
                              {broadcastStatus === 'sending' ? 'Sending...' : 'Send Broadcast'} <Send size={14} />
                          </button>

                          {broadcastStatus === 'success' && <p className="text-success" style={{ marginTop: '15px' }}>✓ Broadcast sent successfully!</p>}
                          {broadcastStatus === 'error' && (
                              <div className="text-danger" style={{ marginTop: '15px' }}>
                                  ✗ Failed to send broadcast.<br/>
                                  <span style={{ fontSize: '12px', opacity: 0.8 }}>Error: {errorMessage}</span>
                              </div>
                          )}
                      </form>
                  </div>
              </div>
          )}

          {activeTab === 'email' && (
              <div className="card" style={{ maxWidth: '600px' }}>
                  <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
                      <h3 style={{ margin: 0 }}>Send Email Newsletter</h3>
                      <p className="text-muted" style={{ fontSize: '13px', marginTop: '5px' }}>
                          Send an email to all registered users (currently in stub mode).
                      </p>
                  </div>
                  <div style={{ padding: '20px' }}>
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
                            className="btn btn-primary"
                            disabled={emailStatus === 'sending'}
                          >
                              {emailStatus === 'sending' ? 'Sending...' : 'Send Emails'} <Mail size={14} />
                          </button>

                          {emailStatus === 'success' && <p className="text-success" style={{ marginTop: '15px' }}>✓ Emails queued successfully!</p>}
                          {emailStatus === 'error' && <p className="text-danger" style={{ marginTop: '15px' }}>✗ Failed to queue emails.</p>}
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
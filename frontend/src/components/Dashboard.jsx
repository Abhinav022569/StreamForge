import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png';
import '../App.css'; // Import shared styles

// --- HELPER FUNCTION: Format Bytes ---
const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: 'User' });
  const [pipelines, setPipelines] = useState([]);
  const [recentPipelines, setRecentPipelines] = useState([]);
  
  // --- NEW STATES ---
  const [totalDataSize, setTotalDataSize] = useState('0 B'); 
  const [activeRuns, setActiveRuns] = useState(0);

  useEffect(() => {
    // 1. Load User
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // 2. Fetch Data
    if (token) {
        // A. Fetch Pipelines (For List + Active Count)
        axios.get('http://127.0.0.1:5000/pipelines', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            const allPipelines = res.data;
            setPipelines(allPipelines);
            setRecentPipelines(allPipelines.slice(0, 5)); // Show top 5
            
            // Calculate Active Runs
            const runningCount = allPipelines.filter(p => p.status === 'Active').length;
            setActiveRuns(runningCount);
        })
        .catch(err => console.error("Error fetching pipelines:", err));

        // B. Fetch User Stats (Total Data Processed)
        axios.get('http://127.0.0.1:5000/user-stats', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            setTotalDataSize(formatBytes(res.data.total_processed_bytes));
        })
        .catch(err => console.error("Error fetching stats:", err));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="app-container">
      
      {/* 1. SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '4px' }} />
          StreamForge
        </div>

        <nav className="sidebar-nav">
          <SidebarItem label="Overview" icon="🏠" active />
          <SidebarItem label="All Pipelines" icon="🚀" onClick={() => navigate('/pipelines')} />
          <SidebarItem label="Data Sources" icon="🗄️" onClick={() => navigate('/datasources')} />
          <SidebarItem label="Processed Data" icon="📦" onClick={() => navigate('/processed')} />
          <SidebarItem label="Settings" icon="⚙️" onClick={() => navigate('/settings')} />
        </nav>

        {/* PROFILE SECTION */}
        <div className="sidebar-profile">
            <div className="flex items-center gap-10" style={{ overflow: 'hidden' }}>
                <div className="profile-avatar">
                    👤
                </div>
                <div style={{ overflow: 'hidden' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85px' }}>{user.username}</p>
                    <p className="text-muted" style={{ margin: 0, fontSize: '12px' }}>Free Plan</p>
                </div>
            </div>

            <button 
                onClick={handleLogout}
                className="btn-sidebar-logout"
            >
                <span>🚪</span> Logout
            </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT */}
      <main className="main-content">
        <div className="content-wrapper">
          
          {/* Header */}
          <div className="flex justify-between items-center" style={{ marginBottom: '30px' }}>
            <div>
              <h1 style={{ fontSize: '32px', marginBottom: '10px', margin: 0 }}>Dashboard</h1>
              <p className="text-muted" style={{ margin: 0 }}>Welcome back, {user.username}</p>
            </div>
            
            <button className="btn btn-success" onClick={() => navigate('/builder')}>
              + Create New Pipeline
            </button>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-20" style={{ marginBottom: '30px' }}>
            <StatCard label="Total Pipelines" value={pipelines.length} icon="🚀" />
            
            {/* Active Runs Card */}
            <StatCard label="Active Runs" value={activeRuns} icon="⚡" />
            
            {/* Data Processed Card */}
            <StatCard label="Data Processed" value={totalDataSize} icon="💾" />
          </div>

          {/* Recent Activity Table */}
          <div className="card">
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Recent Activity</h3>
            </div>
            
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pipeline Name</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentPipelines.length === 0 ? (
                    <tr>
                        <td colSpan="4" className="text-center text-muted" style={{ padding: '30px' }}>
                            No pipelines found. Create one to get started!
                        </td>
                    </tr>
                ) : (
                    recentPipelines.map(pipe => (
                        <tr key={pipe.id}>
                            <td className="font-medium">{pipe.name}</td>
                            <td>
                                {/* DYNAMIC STATUS BADGE */}
                                <span className={`status-badge ${pipe.status === 'Active' ? 'status-active' : 'status-ready'}`}
                                      style={{
                                          background: pipe.status === 'Active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                          color: pipe.status === 'Active' ? '#22c55e' : '#64748b',
                                          padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500'
                                      }}>
                                    {pipe.status || 'Ready'}
                                </span>
                            </td>
                            <td className="text-muted">{pipe.created_at || 'Just now'}</td>
                            <td>
                                <button 
                                    className="btn btn-ghost" 
                                    style={{ fontSize: '12px', padding: '4px 8px' }}
                                    onClick={() => navigate(`/builder/${pipe.id}`)}
                                >
                                    Open
                                </button>
                            </td>
                        </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
};

// Helper Components
const SidebarItem = ({ label, icon, active, onClick }) => (
  <div className={`sidebar-item ${active ? 'active' : ''}`} onClick={onClick}>
    <span>{icon}</span>
    <span>{label}</span>
  </div>
);

const StatCard = ({ label, value, icon }) => (
  <div className="card" style={{ flex: 1, padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
    <div style={{ fontSize: '24px', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
      {icon}
    </div>
    <div>
      <h3 style={{ margin: 0, fontSize: '24px' }}>{value}</h3>
      <p className="text-muted" style={{ margin: 0, fontSize: '14px' }}>{label}</p>
    </div>
  </div>
);

export default Dashboard;
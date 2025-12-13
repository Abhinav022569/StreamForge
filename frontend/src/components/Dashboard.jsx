import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png';
import '../App.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: 'User' });
  const [pipelines, setPipelines] = useState([]);

  // Load User & Pipelines on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (token) {
      axios.get('http://127.0.0.1:5000/pipelines', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setPipelines(res.data))
      .catch(err => console.error("Error fetching pipelines:", err));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="app-container">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '4px' }} />
          StreamForge
        </div>

        <nav className="sidebar-nav">
          <SidebarItem label="Overview" icon="🏠" active />
          <SidebarItem label="All Pipelines" icon="🚀" onClick={() => navigate('/pipelines')} />
          <SidebarItem label="Data Sources" icon="🗄️" onClick={()=>navigate('/datasources')}/>
          <SidebarItem label="Processed Data" icon="📦" onClick={() => navigate('/processed')} />
          <SidebarItem label="Settings" icon="⚙️" />
        </nav>

        {/* BOTTOM SECTION: Profile + Logout */}
        <div className="sidebar-profile">
            
            {/* Profile Info */}
            <div className="flex items-center gap-10" style={{ overflow: 'hidden' }}>
                <div className="profile-avatar">
                    👤
                </div>
                <div style={{ overflow: 'hidden' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85px' }}>{user.username}</p>
                    <p className="text-muted" style={{ margin: 0, fontSize: '12px' }}>Free Plan</p>
                </div>
            </div>

            {/* Logout Button */}
            <button 
                onClick={handleLogout}
                className="btn-sidebar-logout"
            >
                <span>🚪</span> Logout
            </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="main-content">
        
        <div className="content-wrapper">
          
          {/* Header Row */}
          <div className="flex justify-between" style={{ alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <h1 style={{ fontSize: '32px', marginBottom: '5px', margin: 0 }}>Dashboard</h1>
              <h2 className="text-success" style={{ fontSize: '18px', fontWeight: '500', marginBottom: '5px', marginTop: '5px' }}>
                Welcome back, {user.username}
              </h2>
              <p className="text-muted" style={{ margin: 0 }}>Manage your data workflows and executions.</p>
            </div>
            
            <button className="btn btn-primary" onClick={() => navigate('/builder')}>
              + Create New Pipeline
            </button>
          </div>

          {/* Stats Row - Grid layout is specific here, so keeping inline style for grid logic */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <StatCard title="Total Pipelines" value={pipelines.length} icon="📊" />
            <StatCard title="Active Runs" value="0" icon="⚡" />
            <StatCard title="Data Processed" value="0 MB" icon="💾" />
          </div>

          {/* Pipelines Table */}
          <div className="card">
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-light)' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Recent Pipelines</h3>
            </div>
            
            {pipelines.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <p className="text-muted">No pipelines found. Create one to get started!</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr className="table-header">
                    <th>Name</th>
                    <th>ID</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pipelines.map(pipe => (
                    <tr key={pipe.id} className="table-row">
                      <td className="font-bold">{pipe.name}</td>
                      <td className="text-muted">#{pipe.id}</td>
                      <td>
                        <span className="status-badge status-active">Active</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-ghost" 
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                          onClick={() => navigate(`/builder/${pipe.id}`)}
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

// --- Helper Components ---

const StatCard = ({ title, value, icon }) => (
  <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: 0 }}>
    <div style={{ fontSize: '24px', background: 'rgba(255,255,255,0.05)', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}>
      {icon}
    </div>
    <div>
      <p className="text-muted" style={{ margin: 0, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
      <h2 style={{ margin: '5px 0 0 0', fontSize: '24px' }}>{value}</h2>
    </div>
  </div>
);

const SidebarItem = ({ label, icon, active, onClick }) => (
  <div className={`sidebar-item ${active ? 'active' : ''}`} onClick={onClick}>
    <span>{icon}</span>
    <span>{label}</span>
  </div>
);

export default Dashboard;
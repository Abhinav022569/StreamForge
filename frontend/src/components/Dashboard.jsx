import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
    <div style={{ minHeight: '100vh', backgroundColor: '#0f1115', display: 'flex' }}>
      
      {/* 1. LEFT SIDEBAR */}
      <aside style={{ 
        width: '260px', 
        backgroundColor: '#18181b', 
        borderRight: '1px solid #27272a', 
        display: 'flex', 
        flexDirection: 'column',
        padding: '20px',
        flexShrink: 0 
      }}>
        {/* Logo Area */}
        <div style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', color: 'white', marginBottom: '40px', paddingLeft: '10px' }}>
          <div style={{ width: '24px', height: '24px', background: '#10b981', borderRadius: '4px' }}></div>
          StreamForge
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
          <SidebarItem label="Overview" icon="🏠" active />
          <SidebarItem label="All Pipelines" icon="🚀" />
          <SidebarItem label="Data Sources" icon="🗄️" />
          <SidebarItem label="Settings" icon="⚙️" />
        </nav>

        {/* BOTTOM SECTION: Profile + Logout */}
        <div style={{ 
          borderTop: '1px solid #27272a', 
          paddingTop: '20px', 
          marginTop: '10px',
          display: 'flex',           
          alignItems: 'center',      
          justifyContent: 'space-between', 
          gap: '10px'
        }}>
            
            {/* Profile Info (Left side) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <div style={{ width: '32px', height: '32px', background: '#3f3f46', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                    👤
                </div>
                <div style={{ overflow: 'hidden' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85px' }}>{user.username}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>Free Plan</p>
                </div>
            </div>

            {/* Logout Button (Right side) */}
            <button 
                onClick={handleLogout}
                style={{
                    background: '#27272a',
                    border: '1px solid #3f3f46',
                    color: '#ef4444', 
                    padding: '8px 12px',  // Increased padding for text
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexShrink: 0,
                    transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#3f3f46'}
                onMouseOut={(e) => e.currentTarget.style.background = '#27272a'}
            >
                <span>🚪</span> Logout
            </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        
        {/* Dashboard Content */}
        <div style={{ padding: '40px', width: '100%', boxSizing: 'border-box' }}>
          
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <h1 style={{ fontSize: '32px', marginBottom: '5px' }}>Dashboard</h1>
              <h2 style={{ fontSize: '18px', color: '#10b981', fontWeight: '500', marginBottom: '5px' }}>
                Welcome back, {user.username}
              </h2>
              <p className="muted" style={{ margin: 0 }}>Manage your data workflows and executions.</p>
            </div>
            
            <button className="btn btn-primary" onClick={() => navigate('/builder')}>
              + Create New Pipeline
            </button>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <StatCard title="Total Pipelines" value={pipelines.length} icon="📊" />
            <StatCard title="Active Runs" value="0" icon="⚡" />
            <StatCard title="Data Processed" value="0 MB" icon="💾" />
          </div>

          {/* Pipelines Table */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #27272a' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Recent Pipelines</h3>
            </div>
            
            {pipelines.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <p className="muted">No pipelines found. Create one to get started!</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #27272a', color: '#9ca3af', fontSize: '14px' }}>
                    <th style={{ padding: '15px 20px', fontWeight: '500' }}>Name</th>
                    <th style={{ padding: '15px 20px', fontWeight: '500' }}>ID</th>
                    <th style={{ padding: '15px 20px', fontWeight: '500' }}>Status</th>
                    <th style={{ padding: '15px 20px', fontWeight: '500', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pipelines.map(pipe => (
                    <tr key={pipe.id} style={{ borderBottom: '1px solid #27272a', color: 'white', fontSize: '14px' }}>
                      <td style={{ padding: '15px 20px', fontWeight: '600' }}>{pipe.name}</td>
                      <td style={{ padding: '15px 20px', color: '#666' }}>#{pipe.id}</td>
                      <td style={{ padding: '15px 20px' }}>
                        <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Active</span>
                      </td>
                      <td style={{ padding: '15px 20px', textAlign: 'right' }}>
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
  <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
    <div style={{ fontSize: '24px', background: 'rgba(255,255,255,0.05)', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}>
      {icon}
    </div>
    <div>
      <p className="muted" style={{ margin: 0, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
      <h2 style={{ margin: '5px 0 0 0', fontSize: '24px' }}>{value}</h2>
    </div>
  </div>
);

const SidebarItem = ({ label, icon, active }) => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    padding: '10px 15px', 
    borderRadius: '6px', 
    cursor: 'pointer',
    backgroundColor: active ? '#27272a' : 'transparent',
    color: active ? 'white' : '#9ca3af',
    transition: 'background 0.2s'
  }}>
    <span>{icon}</span>
    <span style={{ fontSize: '14px', fontWeight: '500' }}>{label}</span>
  </div>
);

export default Dashboard;
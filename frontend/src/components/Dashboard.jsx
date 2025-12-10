import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: 'User' });
  const [pipelines, setPipelines] = useState([]);

  // Load User & Pipelines on mount
  useEffect(() => {
    // 1. Get User from LocalStorage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // 2. Fetch Pipelines from Backend
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
    <div style={{ minHeight: '100vh', backgroundColor: '#0f1115' }}>
      
      {/* 1. NAVBAR */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 50px', borderBottom: '1px solid #27272a', alignItems: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}>
          <div style={{ width: '24px', height: '24px', background: '#10b981', borderRadius: '4px' }}></div>
          StreamForge
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span className="muted" style={{ fontSize: '14px' }}>Signed in as <strong style={{ color: 'white' }}>{user.username}</strong></span>
          <button className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '14px' }} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="container" style={{ paddingTop: '50px' }}>
        
        {/* 2. WELCOME HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Dashboard</h1>
            <p className="muted">Manage your data workflows and executions.</p>
          </div>
          {/* THE CREATE BUTTON */}
          <button className="btn btn-primary" onClick={() => navigate('/builder')}>
            + Create New Pipeline
          </button>
        </div>

        {/* 3. STATS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <StatCard title="Total Pipelines" value={pipelines.length} icon="📊" />
          <StatCard title="Active Runs" value="0" icon="⚡" />
          <StatCard title="Data Processed" value="0 MB" icon="💾" />
        </div>

        {/* 4. PIPELINES TABLE */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                        onClick={() => navigate('/builder')} // Ideally pass ID here later
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
    </div>
  );
};

// Helper Component for Stats
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

export default Dashboard;
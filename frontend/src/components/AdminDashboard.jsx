import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png';
import '../App.css'; 

// Helper for formatting bytes
const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_users: 0,
    total_pipelines: 0,
    active_pipelines: 0,
    total_processed_bytes: 0,
    recent_users: []
  });
  const [user, setUser] = useState({ username: 'Admin' });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser.is_admin) {
            navigate('/dashboard'); // Kick non-admins out
            return;
        }
        setUser(parsedUser);
    } else {
        navigate('/login');
        return;
    }

    if (token) {
        axios.get('http://127.0.0.1:5000/admin/stats', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setStats(res.data))
        .catch(err => console.error("Error fetching admin stats:", err));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="app-container">
      
      {/* SIDEBAR (Simplified for Admin) */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="Logo" style={{ width: '28px', height: '28px' }} />
          StreamForge <span style={{fontSize:'10px', background:'red', padding:'2px 4px', borderRadius:'4px', marginLeft:'5px'}}>ADMIN</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-item active"><span>🏠</span> Overview</div>
          <div className="sidebar-item" onClick={() => navigate('/admin/users')}><span>👥</span> Users</div>
          <div className="sidebar-item"><span>⚙️</span> Settings</div>
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
            <h1 style={{ fontSize: '32px', marginBottom: '10px', margin: 0 }}>System Overview</h1>
            <p className="text-muted" style={{ margin: 0 }}>Global statistics for StreamForge platform.</p>
          </div>

          {/* GLOBAL STATS */}
          <div className="flex gap-20" style={{ marginBottom: '30px' }}>
            <StatCard label="Total Users" value={stats.total_users} icon="👥" />
            <StatCard label="Total Pipelines" value={stats.total_pipelines} icon="🚀" />
            <StatCard label="Active Runs" value={stats.active_pipelines} icon="⚡" />
            <StatCard label="Global Data Processed" value={formatBytes(stats.total_processed_bytes)} icon="💾" />
          </div>

          {/* RECENT USERS TABLE */}
          <div className="card">
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Newest Users</h3>
            </div>
            
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Pipelines</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_users.map(u => (
                    <tr key={u.id}>
                        <td>#{u.id}</td>
                        <td className="font-bold">{u.username}</td>
                        <td className="text-muted">{u.email}</td>
                        <td>{u.pipelines}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
};

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

export default AdminDashboard;
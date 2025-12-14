import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png';
import '../App.css'; 

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState({ username: 'Admin' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser.is_admin) {
            navigate('/dashboard'); 
            return;
        }
        setUser(parsedUser);
    } else {
        navigate('/login');
        return;
    }

    if (token) {
        fetchUsers(token);
    }
  }, [navigate]);

  const fetchUsers = async (token) => {
      try {
          const res = await axios.get('http://127.0.0.1:5000/admin/users', {
              headers: { Authorization: `Bearer ${token}` }
          });
          setUsers(res.data);
      } catch (err) {
          console.error("Failed to fetch users", err);
      }
  };

  const toggleSuspend = async (userId, currentStatus) => {
      const action = currentStatus ? "ACTIVATE" : "SUSPEND";
      if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

      const token = localStorage.getItem('token');
      try {
          await axios.put(`http://127.0.0.1:5000/admin/users/${userId}/suspend`, 
            { is_suspended: !currentStatus }, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          // Update local state
          setUsers(users.map(u => 
              u.id === userId ? { ...u, is_suspended: !currentStatus } : u
          ));
          
      } catch (err) {
          alert("Action failed: " + (err.response?.data?.error || err.message));
      }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const filteredUsers = users.filter(u => 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="sidebar-item active"><span>👥</span> Users</div>
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
          
          <div className="flex justify-between items-end" style={{ marginBottom: '30px' }}>
            <div>
                <h1 style={{ fontSize: '32px', marginBottom: '10px', margin: 0 }}>User Management</h1>
                <p className="text-muted" style={{ margin: '5px 0 0 0' }}>Manage system access and monitor user quotas.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                    className="search-input"
                    type="text" 
                    placeholder="Search users..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>

          {/* USERS TABLE */}
          <div className="card">
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display:'flex', gap:'15px' }}>
                <span className="text-white font-bold">All Users <span className="text-muted" style={{fontWeight:'normal', marginLeft:'5px'}}>{users.length}</span></span>
                <span className="text-muted">Suspended <span className="text-white" style={{marginLeft:'5px'}}>{users.filter(u => u.is_suspended).length}</span></span>
            </div>
            
            <table className="data-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Pipelines</th>
                  <th>Data Used</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                    <tr key={u.id}>
                        <td>
                            <div className="flex items-center gap-10">
                                <div className="profile-avatar" style={{width:'30px', height:'30px', fontSize:'12px'}}>
                                    {u.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-bold">{u.username}</div>
                                    <div className="text-muted" style={{fontSize:'12px'}}>{u.email}</div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <span 
                                className="status-badge"
                                style={{
                                    background: u.is_suspended ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                    color: u.is_suspended ? '#ef4444' : '#22c55e'
                                }}
                            >
                                {u.is_suspended ? 'Suspended' : 'Active'}
                            </span>
                        </td>
                        <td className="text-muted">{u.is_admin ? 'Admin' : 'User'}</td>
                        <td className="text-muted font-bold">{u.pipelines_count} pipelines</td>
                        <td className="text-muted">{u.processed_bytes}</td>
                        <td style={{ textAlign: 'right' }}>
                            {!u.is_admin && (
                                <button 
                                    className={`btn ${u.is_suspended ? 'btn-success' : 'btn-ghost-danger'}`}
                                    style={{ padding: '4px 12px', fontSize: '12px' }}
                                    onClick={() => toggleSuspend(u.id, u.is_suspended)}
                                >
                                    {u.is_suspended ? 'Activate' : 'Suspend'}
                                </button>
                            )}
                        </td>
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

export default AdminUsers;
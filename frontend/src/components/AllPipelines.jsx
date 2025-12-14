import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png';
import '../App.css'; // Import shared styles

const AllPipelines = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: 'User' });
  const [pipelines, setPipelines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (token) {
      fetchPipelines(token);
    }
  }, []);

  const fetchPipelines = (token) => {
    axios.get('http://127.0.0.1:5000/pipelines', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setPipelines(res.data))
    .catch(err => console.error("Error fetching pipelines:", err));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pipeline? This cannot be undone.")) {
        return;
    }

    const token = localStorage.getItem('token');
    try {
        await axios.delete(`http://127.0.0.1:5000/pipelines/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        // Remove the deleted pipeline from the local state so the UI updates instantly
        setPipelines(pipelines.filter(p => p.id !== id));
    } catch (err) {
        alert("Failed to delete pipeline");
        console.error(err);
    }
  };

  const filteredPipelines = pipelines.filter(pipe => 
    pipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '4px' }} />
          StreamForge
        </div>

        <nav className="sidebar-nav">
          <SidebarItem label="Overview" icon="🏠" onClick={() => navigate('/dashboard')} />
          <SidebarItem label="All Pipelines" icon="🚀" active /> 
          <SidebarItem label="Data Sources" icon="🗄️" onClick={()=> navigate('/datasources')} />
          <SidebarItem label="Processed Data" icon="📦" onClick={() => navigate('/processed')} />
          <SidebarItem label="Settings" icon="⚙️" onClick={() => navigate('/settings')}/>
        </nav>

        {/* BOTTOM SECTION: Profile + Logout */}
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

      {/* 2. MAIN CONTENT AREA */}
      <main className="main-content">
        
        <div className="content-wrapper">
          
          {/* Header Row */}
          <div className="flex justify-between" style={{ marginBottom: '30px', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontSize: '32px', marginBottom: '10px', margin: 0 }}>All Pipelines</h1>
              <p className="text-muted" style={{ margin: '5px 0 0 0' }}>View and manage all your data workflows.</p>
            </div>
            
            <div className="flex gap-10">
                <input 
                    className="search-input"
                    type="text" 
                    placeholder="Search pipelines..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn btn-success" onClick={() => navigate('/builder')}>
                  + Create New
                </button>
            </div>
          </div>

          {/* Table Card */}
          <div className="card">
            <table className="data-table">
              <thead>
                <tr className="table-header">
                  <th>Pipeline Name</th>
                  <th>ID</th>
                  <th>Nodes</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPipelines.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="text-center text-muted" style={{ padding: '40px' }}>
                            No pipelines found matching "{searchTerm}"
                        </td>
                    </tr>
                ) : (
                    filteredPipelines.map(pipe => (
                    <tr key={pipe.id} className="table-row">
                        <td className="font-bold">{pipe.name}</td>
                        <td className="text-muted" style={{ fontFamily: 'monospace' }}>#{pipe.id}</td>
                        <td className="text-muted">
                            {pipe.flow?.nodes?.length || 0} nodes
                        </td>
                        <td>
                          {/* UPDATED: Dynamic Status Badge */}
                          <span 
                            className={`status-badge ${pipe.status === 'Active' ? 'status-active' : 'status-ready'}`}
                            style={{
                                background: pipe.status === 'Active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                color: pipe.status === 'Active' ? '#22c55e' : '#64748b',
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                fontSize: '12px', 
                                fontWeight: '500'
                            }}
                          >
                            {pipe.status || 'Ready'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                        
                        {/* OPEN BUTTON */}
                        <button 
                            className="btn btn-ghost" 
                            style={{ marginRight: '10px', fontSize: '12px', padding: '6px 12px' }}
                            onClick={() => navigate(`/builder/${pipe.id}`)}
                        >
                            Open
                        </button>

                        {/* DELETE BUTTON */}
                        <button 
                            className="btn btn-danger" 
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                            onClick={() => handleDelete(pipe.id)}
                        >
                            Delete
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

const SidebarItem = ({ label, icon, active, onClick }) => (
  <div className={`sidebar-item ${active ? 'active' : ''}`} onClick={onClick}>
    <span>{icon}</span>
    <span>{label}</span>
  </div>
);

export default AllPipelines;
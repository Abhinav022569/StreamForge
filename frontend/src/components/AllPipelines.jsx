import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png'; // <--- IMPORT YOUR LOGO

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

  // --- NEW DELETE FUNCTION ---
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
        {/* Logo Area - UPDATED WITH REAL LOGO */}
        <div style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', color: 'white', marginBottom: '40px', paddingLeft: '10px' }}>
          <img src={logo} alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '4px' }} />
          StreamForge
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
          <SidebarItem label="Overview" icon="🏠" onClick={() => navigate('/dashboard')} />
          <SidebarItem label="All Pipelines" icon="🚀" active /> 
          <SidebarItem label="Data Sources" icon="🗄️" onClick={()=> navigate('/datasources')} />
          <SidebarItem label="Processed Data" icon="📦" onClick={() => navigate('/processed')} />
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <div style={{ width: '32px', height: '32px', background: '#3f3f46', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                    👤
                </div>
                <div style={{ overflow: 'hidden' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85px' }}>{user.username}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>Free Plan</p>
                </div>
            </div>

            <button 
                onClick={handleLogout}
                style={{
                    background: '#27272a',
                    border: '1px solid #3f3f46',
                    color: '#ef4444', 
                    padding: '8px 12px',
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
            >
                <span>🚪</span> Logout
            </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        
        <div style={{ padding: '40px', width: '100%', boxSizing: 'border-box' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
            <div>
              <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>All Pipelines</h1>
              <p className="muted" style={{ margin: 0 }}>View and manage all your data workflows.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
                <input 
                    type="text" 
                    placeholder="Search pipelines..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        background: '#18181b',
                        border: '1px solid #3f3f46',
                        padding: '10px 15px',
                        borderRadius: '6px',
                        color: 'white',
                        outline: 'none',
                        minWidth: '250px'
                    }}
                />
                <button className="btn btn-primary" onClick={() => navigate('/builder')}>
                + Create New
                </button>
            </div>
          </div>

          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #27272a', color: '#9ca3af', fontSize: '14px', backgroundColor: '#1f1f23' }}>
                  <th style={{ padding: '15px 20px', fontWeight: '500' }}>Pipeline Name</th>
                  <th style={{ padding: '15px 20px', fontWeight: '500' }}>ID</th>
                  <th style={{ padding: '15px 20px', fontWeight: '500' }}>Nodes</th>
                  <th style={{ padding: '15px 20px', fontWeight: '500' }}>Status</th>
                  <th style={{ padding: '15px 20px', fontWeight: '500', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPipelines.length === 0 ? (
                    <tr>
                        <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                            No pipelines found matching "{searchTerm}"
                        </td>
                    </tr>
                ) : (
                    filteredPipelines.map(pipe => (
                    <tr key={pipe.id} style={{ borderBottom: '1px solid #27272a', color: 'white', fontSize: '14px' }}>
                        <td style={{ padding: '15px 20px', fontWeight: '600' }}>{pipe.name}</td>
                        <td style={{ padding: '15px 20px', color: '#666', fontFamily: 'monospace' }}>#{pipe.id}</td>
                        <td style={{ padding: '15px 20px', color: '#9ca3af' }}>
                            {pipe.flow?.nodes?.length || 0} nodes
                        </td>
                        <td style={{ padding: '15px 20px' }}>
                        <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Active</span>
                        </td>
                        <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                        
                        {/* OPEN BUTTON */}
                        <button 
                            className="btn btn-ghost" 
                            style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid #3f3f46', marginRight: '10px' }}
                            onClick={() => navigate(`/builder/${pipe.id}`)}
                        >
                            Open
                        </button>

                        {/* DELETE BUTTON */}
                        <button 
                            className="btn btn-ghost" 
                            style={{ 
                                padding: '6px 12px', 
                                fontSize: '12px', 
                                border: '1px solid #ef4444', 
                                color: '#ef4444' 
                            }}
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
  <div 
    onClick={onClick}
    style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px', 
      padding: '10px 15px', 
      borderRadius: '6px', 
      cursor: 'pointer',
      backgroundColor: active ? '#27272a' : 'transparent',
      color: active ? 'white' : '#9ca3af',
      transition: 'background 0.2s'
    }}
    onMouseOver={(e) => !active && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
    onMouseOut={(e) => !active && (e.currentTarget.style.backgroundColor = 'transparent')}
  >
    <span>{icon}</span>
    <span style={{ fontSize: '14px', fontWeight: '500' }}>{label}</span>
  </div>
);

export default AllPipelines;
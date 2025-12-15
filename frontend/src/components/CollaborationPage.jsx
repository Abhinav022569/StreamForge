import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png';
import '../App.css'; 

const CollaborationPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: 'User' });
  const [stats, setStats] = useState({ shared_with_me: 0, my_shared_pipelines: 0, team_members: 0 });
  const [sharedWithMe, setSharedWithMe] = useState([]);
  const [sharedByMe, setSharedByMe] = useState([]);
  
  // Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [myPipelines, setMyPipelines] = useState([]);
  const [shareForm, setShareForm] = useState({ pipelineId: '', email: '', role: 'viewer' });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
        navigate('/login');
        return;
    }

    if (token) {
        fetchData(token);
    }
  }, [navigate]);

  const fetchData = async (token) => {
      try {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          
          // 1. Fetch Stats
          const statsRes = await axios.get('http://127.0.0.1:5000/collaboration/stats', config);
          setStats(statsRes.data);

          // 2. Fetch Shared With Me
          const withMeRes = await axios.get('http://127.0.0.1:5000/collaboration/shared-with-me', config);
          setSharedWithMe(withMeRes.data);

          // 3. Fetch Shared By Me
          const byMeRes = await axios.get('http://127.0.0.1:5000/collaboration/shared-by-me', config);
          setSharedByMe(byMeRes.data);

          // 4. Fetch My Pipelines (For the share modal dropdown)
          const myPipesRes = await axios.get('http://127.0.0.1:5000/pipelines', config);
          // Filter out pipelines that are already shared (if API doesn't handle it)
          setMyPipelines(myPipesRes.data.filter(p => !p.is_shared));

      } catch (err) {
          console.error("Error fetching collaboration data:", err);
      }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleShareSubmit = async () => {
      const token = localStorage.getItem('token');
      try {
          await axios.post('http://127.0.0.1:5000/pipelines/share', {
              pipeline_id: shareForm.pipelineId,
              email: shareForm.email,
              role: shareForm.role
          }, { headers: { Authorization: `Bearer ${token}` } });
          
          alert("Pipeline shared successfully!");
          setShowShareModal(false);
          setShareForm({ pipelineId: '', email: '', role: 'viewer' });
          fetchData(token); // Refresh data
      } catch (err) {
          alert("Share failed: " + (err.response?.data?.error || err.message));
      }
  };

  const handleRevoke = async (shareId) => {
      if(!window.confirm("Are you sure you want to remove access?")) return;
      
      const token = localStorage.getItem('token');
      try {
          await axios.delete(`http://127.0.0.1:5000/pipelines/share/${shareId}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          fetchData(token);
      } catch (err) {
          alert("Failed to revoke access");
      }
  };

  return (
    // FIXED LAYOUT: Container takes full height, no scroll on body
    <div className="app-container" style={{ height: '100vh', overflow: 'hidden' }}>
      
      {/* 1. SIDEBAR - Fixed */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '4px' }} />
          StreamForge
        </div>

        <nav className="sidebar-nav">
          <SidebarItem label="Overview" icon="🏠" onClick={() => navigate('/dashboard')} />
          <SidebarItem label="All Pipelines" icon="🚀" onClick={() => navigate('/pipelines')} />
          <SidebarItem label="Collaboration" icon="🤝" active />
          <SidebarItem label="Data Sources" icon="🗄️" onClick={() => navigate('/datasources')} />
          <SidebarItem label="Processed Data" icon="📦" onClick={() => navigate('/processed')} />
          <SidebarItem label="Settings" icon="⚙️" onClick={() => navigate('/settings')} />
        </nav>

        <div className="sidebar-profile">
            <div className="flex items-center gap-10" style={{ overflow: 'hidden' }}>
                <div className="profile-avatar">👤</div>
                <div style={{ overflow: 'hidden' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85px' }}>{user.username}</p>
                </div>
            </div>
            <button onClick={handleLogout} className="btn-sidebar-logout"><span>🚪</span> Logout</button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT - Independently Scrollable */}
      <main className="main-content" style={{ height: '100%', overflowY: 'auto' }}>
        <div className="content-wrapper" style={{ paddingBottom: '60px' }}>
          
          <div className="flex justify-between items-end" style={{ marginBottom: '40px' }}>
            <div>
                <p className="text-muted" style={{ fontSize: '14px', margin: 0 }}>Collaboration Hub</p>
                <h1 style={{ fontSize: '32px', marginBottom: '10px', marginTop: '5px' }}>Team Collaboration</h1>
                <p className="text-muted" style={{ margin: 0 }}>Manage shared pipelines and coordinate with your team.</p>
            </div>
            {/* UPDATED BUTTON STYLE */}
            <button 
                className="btn btn-success" 
                onClick={() => setShowShareModal(true)}
                style={{ 
                    padding: '8px 16px', 
                    height: '40px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontSize: '14px'
                }}
            >
                <span>🔗</span> Share Pipeline
            </button>
          </div>

          {/* STATS ROW */}
          <div className="flex gap-20" style={{ marginBottom: '40px' }}>
              <div className="card" style={{ flex: 1, padding: '25px', background: '#202024' }}>
                  <p className="text-muted" style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '1px', marginBottom: '15px' }}>SHARED WITH ME</p>
                  <h2 style={{ fontSize: '36px', margin: 0, fontWeight: 'bold' }}>{stats.shared_with_me}</h2>
                  <p className="text-success" style={{ fontSize: '14px', marginTop: '5px' }}>Pipelines accessible</p>
              </div>
              <div className="card" style={{ flex: 1, padding: '25px', background: '#202024' }}>
                  <p className="text-muted" style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '1px', marginBottom: '15px' }}>MY SHARED PIPELINES</p>
                  <h2 style={{ fontSize: '36px', margin: 0, fontWeight: 'bold' }}>{stats.my_shared_pipelines}</h2>
                  <p className="text-success" style={{ fontSize: '14px', marginTop: '5px' }}>Active shares</p>
              </div>
              <div className="card" style={{ flex: 1, padding: '25px', background: '#202024' }}>
                  <p className="text-muted" style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '1px', marginBottom: '15px' }}>TEAM MEMBERS</p>
                  <h2 style={{ fontSize: '36px', margin: 0, fontWeight: 'bold' }}>{stats.team_members}</h2>
                  <p className="text-success" style={{ fontSize: '14px', marginTop: '5px' }}>In your network</p>
              </div>
          </div>

          {/* SECTION: Shared With Me */}
          <h3 style={{ marginBottom: '15px', marginTop: '30px' }}>Shared With Me</h3>
          <div className="card">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Pipeline Name</th>
                        <th>Owner</th>
                        <th>My Role</th>
                        <th>Updated</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sharedWithMe.length === 0 ? (
                        <tr><td colSpan="5" className="text-center text-muted" style={{ padding: '30px' }}>No pipelines shared with you yet.</td></tr>
                    ) : (
                        sharedWithMe.map(p => (
                            <tr key={p.share_id}>
                                <td className="font-bold" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '18px', background: 'rgba(59, 130, 246, 0.1)', padding: '5px', borderRadius: '4px', color: '#3b82f6' }}>⚡</span>
                                    {p.name.replace(' (Shared)', '')}
                                </td>
                                <td>
                                    <div className="flex items-center gap-10">
                                        <div className="profile-avatar" style={{ width: '24px', height: '24px', fontSize: '10px' }}>{p.owner_name[0]}</div>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: '500' }}>{p.owner_name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ 
                                        background: 'rgba(59, 130, 246, 0.1)', 
                                        color: '#3b82f6', 
                                        padding: '2px 8px', 
                                        borderRadius: '4px', 
                                        fontSize: '11px', 
                                        textTransform: 'uppercase',
                                        fontWeight: '600' 
                                    }}>
                                        {p.role}
                                    </span>
                                </td>
                                <td className="text-muted">{p.updated_at}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <button 
                                        className="btn btn-ghost" 
                                        style={{ fontSize: '12px', padding: '4px 10px', marginRight: '10px' }}
                                        onClick={() => navigate(`/builder/${p.id}`)}
                                    >
                                        Open
                                    </button>
                                    <button onClick={() => handleRevoke(p.share_id)} className="btn btn-ghost" style={{ fontSize: '12px', padding: '4px 10px', color: '#64748b' }} title="Leave Share">
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
          </div>

          {/* SECTION: My Shared Pipelines */}
          <h3 style={{ marginBottom: '15px', marginTop: '40px' }}>My Shared Pipelines</h3>
          <div className="card">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Pipeline Name</th>
                        <th>Shared With</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Manage</th>
                    </tr>
                </thead>
                <tbody>
                    {sharedByMe.length === 0 ? (
                        <tr><td colSpan="4" className="text-center text-muted" style={{ padding: '30px' }}>You haven't shared any pipelines yet.</td></tr>
                    ) : (
                        sharedByMe.map(p => (
                            <tr key={p.id}>
                                <td className="font-bold" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '18px', background: 'rgba(234, 179, 8, 0.1)', padding: '5px', borderRadius: '4px', color: '#eab308' }}>📦</span>
                                    {p.name}
                                </td>
                                <td>
                                    <div className="flex items-center gap-5">
                                        {p.shared_users.slice(0, 3).map((u, i) => (
                                            <div key={i} className="profile-avatar" style={{ width: '24px', height: '24px', fontSize: '10px', border: '1px solid #3f3f46' }} title={`${u.username} (${u.role})`}>
                                                {u.username[0]}
                                            </div>
                                        ))}
                                        {p.user_count > 3 && <span className="text-muted" style={{ fontSize: '12px' }}>+{p.user_count - 3}</span>}
                                        <span className="text-muted" style={{ fontSize: '12px', marginLeft: '5px' }}>{p.user_count} users</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="status-badge status-active">Active</span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    {p.shared_users.map(u => (
                                        <div key={u.share_id} style={{ display: 'inline-block', marginRight: '5px' }}>
                                            <span className="text-muted" style={{ fontSize: '11px', marginRight: '5px' }}>{u.username}</span>
                                            <button 
                                                className="btn btn-ghost-danger" 
                                                style={{ padding: '2px 6px', fontSize: '10px' }}
                                                onClick={() => handleRevoke(u.share_id)}
                                            >
                                                Revoke
                                            </button>
                                        </div>
                                    ))}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
          </div>

        </div>
      </main>

      {/* SHARE MODAL */}
      {showShareModal && (
          <div style={{
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
              backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
              zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}>
              <div className="card" style={{ width: '400px', padding: '30px' }}>
                  <h2 style={{ marginTop: 0 }}>Share Pipeline</h2>
                  
                  <div className="input-group">
                      <label className="input-label">Select Pipeline</label>
                      <select 
                          className="select-field"
                          value={shareForm.pipelineId}
                          onChange={(e) => setShareForm({...shareForm, pipelineId: e.target.value})}
                      >
                          <option value="">-- Choose a Pipeline --</option>
                          {myPipelines.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                      </select>
                  </div>

                  <div className="input-group">
                      <label className="input-label">User Email</label>
                      <input 
                          className="input-field" 
                          type="email" 
                          placeholder="colleague@example.com"
                          value={shareForm.email}
                          onChange={(e) => setShareForm({...shareForm, email: e.target.value})}
                      />
                  </div>

                  <div className="input-group">
                      <label className="input-label">Role</label>
                      <select 
                          className="select-field" 
                          value={shareForm.role}
                          onChange={(e) => setShareForm({...shareForm, role: e.target.value})}
                      >
                          <option value="viewer">Viewer (Read Only)</option>
                          <option value="editor">Editor (Can Edit)</option>
                      </select>
                  </div>

                  <div className="flex gap-10 justify-between mt-30">
                      <button className="btn btn-ghost" onClick={() => setShowShareModal(false)}>Cancel</button>
                      <button className="btn btn-success" onClick={handleShareSubmit}>Share</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

const SidebarItem = ({ label, icon, active, onClick }) => (
  <div className={`sidebar-item ${active ? 'active' : ''}`} onClick={onClick}>
    <span>{icon}</span>
    <span>{label}</span>
  </div>
);

export default CollaborationPage;
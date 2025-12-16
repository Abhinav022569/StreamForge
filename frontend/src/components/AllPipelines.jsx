import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Network, 
  Users, 
  Database, 
  HardDrive, 
  Settings, 
  LogOut, 
  User, 
  Zap,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Layers
} from 'lucide-react';
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
        setPipelines(pipelines.filter(p => p.id !== id));
    } catch (err) {
        alert("Failed to delete pipeline");
        console.error(err);
    }
  };

  const filteredPipelines = pipelines.filter(pipe => 
    pipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Animations ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
  };

  return (
    <div className="app-container" style={{ background: '#0f1115', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Decor */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>

      {/* 1. SIDEBAR (Exact Match to Dashboard) */}
      <motion.aside 
        className="sidebar"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
            background: 'rgba(24, 24, 27, 0.6)', 
            backdropFilter: 'blur(12px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',          
            flexDirection: 'column',  
            justifyContent: 'space-between',
            padding: 0 
        }}
      >
        {/* TOP SECTION */}
        <div style={{ padding: '20px' }}>
            <div className="sidebar-logo" style={{ marginBottom: '40px', paddingLeft: '10px' }}>
              <img src={logo} alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '4px', boxShadow: '0 0 10px rgba(16,185,129,0.4)' }} />
              <span style={{ fontWeight: '700', letterSpacing: '0.5px' }}>StreamForge</span>
            </div>

            <nav className="sidebar-nav">
              <SidebarItem label="Overview" icon={<LayoutDashboard size={20} />} onClick={() => navigate('/dashboard')} />
              <SidebarItem label="All Pipelines" icon={<Network size={20} />} active /> 
              <SidebarItem label="Collaboration" icon={<Users size={20} />} onClick={() => navigate('/collaboration')} />
              <SidebarItem label="Data Sources" icon={<Database size={20} />} onClick={() => navigate('/datasources')} />
              <SidebarItem label="Processed Data" icon={<HardDrive size={20} />} onClick={() => navigate('/processed')} />
              <SidebarItem label="Settings" icon={<Settings size={20} />} onClick={() => navigate('/settings')} />
            </nav>
        </div>

        {/* BOTTOM SECTION: Grounded Footer */}
        <div style={{ 
            padding: '20px', 
            borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
            background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ 
                    width: '40px', height: '40px', 
                    borderRadius: '10px', 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 4px 10px rgba(16,185,129,0.2)'
                }}>
                    <User size={20} strokeWidth={2.5} />
                </div>
                <div style={{ overflow: 'hidden' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'white' }}>{user.username}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                       <Zap size={10} fill="#eab308" color="#eab308" /> Pro Plan
                    </p>
                </div>
            </div>

            <motion.button 
                onClick={handleLogout}
                style={{ 
                    width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    background: 'rgba(239, 68, 68, 0.05)',
                    color: '#f87171',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
                whileHover={{ 
                    background: 'rgba(239, 68, 68, 0.15)', 
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    boxShadow: '0 0 15px rgba(239, 68, 68, 0.1)' 
                }}
                whileTap={{ scale: 0.98 }}
            >
                <LogOut size={16} />
                Logout
            </motion.button>
        </div>
      </motion.aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="main-content" style={{ position: 'relative', zIndex: 1 }}>
        
        <motion.div 
          className="content-wrapper"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          
          {/* Header Row */}
          <motion.div 
            className="flex justify-between items-end" 
            style={{ marginBottom: '30px' }}
            variants={itemVariants}
          >
            <div>
              <h1 style={{ fontSize: '32px', marginBottom: '5px', margin: 0, background: 'linear-gradient(90deg, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>All Pipelines</h1>
              <p className="text-muted" style={{ margin: 0, fontSize: '14px' }}>View and manage all your data workflows.</p>
            </div>
            
            <div className="flex gap-15 items-center">
                {/* Search Input */}
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
                  <input 
                      type="text" 
                      placeholder="Search pipelines..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        padding: '10px 10px 10px 36px',
                        background: 'rgba(24, 24, 27, 0.6)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px',
                        width: '240px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#10b981'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>

                {/* Create Button */}
                <motion.button 
                  className="btn btn-success" 
                  onClick={() => navigate('/builder')}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(16,185,129,0.4)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={18} />
                  Create New
                </motion.button>
            </div>
          </motion.div>

          {/* Table Card */}
          <motion.div 
            className="card"
            variants={itemVariants}
            style={{ 
                background: 'rgba(24, 24, 27, 0.4)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                overflow: 'hidden'
            }}
          >
            <table className="data-table">
              <thead>
                <tr className="table-header">
                  <th style={{ background: 'rgba(0,0,0,0.2)', color: '#a1a1aa' }}>Pipeline Name</th>
                  <th style={{ background: 'rgba(0,0,0,0.2)', color: '#a1a1aa' }}>ID</th>
                  <th style={{ background: 'rgba(0,0,0,0.2)', color: '#a1a1aa' }}>Nodes</th>
                  <th style={{ background: 'rgba(0,0,0,0.2)', color: '#a1a1aa' }}>Status</th>
                  <th style={{ background: 'rgba(0,0,0,0.2)', color: '#a1a1aa', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                {filteredPipelines.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="text-center text-muted" style={{ padding: '60px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                              <Search size={32} style={{ opacity: 0.2 }} />
                              <span>No pipelines found matching "{searchTerm}"</span>
                            </div>
                        </td>
                    </tr>
                ) : (
                    filteredPipelines.map((pipe, index) => (
                    <motion.tr 
                        key={pipe.id} 
                        className="table-row"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    >
                        <td className="font-bold" style={{ color: '#e4e4e7', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ background: 'rgba(59,130,246,0.1)', padding: '6px', borderRadius: '6px', color: '#3b82f6' }}>
                            <Layers size={16} />
                          </div>
                          {pipe.name}
                        </td>
                        <td className="text-muted" style={{ fontFamily: 'monospace', fontSize: '12px' }}>#{pipe.id}</td>
                        <td className="text-muted" style={{ fontSize: '13px' }}>
                            {pipe.flow?.nodes?.length || 0} nodes
                        </td>
                        <td>
                          <span 
                            className={`status-badge`}
                            style={{
                                background: pipe.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(113, 113, 122, 0.2)',
                                color: pipe.status === 'Active' ? '#10b981' : '#a1a1aa',
                                border: pipe.status === 'Active' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(113, 113, 122, 0.3)',
                                padding: '4px 10px', 
                                borderRadius: '12px', 
                                fontSize: '11px', 
                                fontWeight: '600',
                                boxShadow: pipe.status === 'Active' ? '0 0 10px rgba(16, 185, 129, 0.1)' : 'none'
                            }}
                          >
                            {pipe.status === 'Active' ? '● Active' : '○ Ready'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            {/* OPEN BUTTON */}
                            <motion.button 
                                className="btn btn-ghost" 
                                style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                                onClick={() => navigate(`/builder/${pipe.id}`)}
                                whileHover={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)' }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ExternalLink size={12} /> Open
                            </motion.button>

                            {/* DELETE BUTTON */}
                            <motion.button 
                                className="btn" 
                                style={{ 
                                  fontSize: '12px', padding: '6px 12px', 
                                  background: 'rgba(239, 68, 68, 0.1)', 
                                  color: '#f87171',
                                  border: '1px solid rgba(239, 68, 68, 0.2)',
                                  display: 'flex', alignItems: 'center', gap: '4px'
                                }}
                                onClick={() => handleDelete(pipe.id)}
                                whileHover={{ background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Trash2 size={12} /> Delete
                            </motion.button>
                          </div>
                        </td>
                    </motion.tr>
                    ))
                )}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
};

const SidebarItem = ({ label, icon, active, onClick }) => (
  <motion.div 
    className={`sidebar-item ${active ? 'active' : ''}`} 
    onClick={onClick}
    whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.05)' }}
    whileTap={{ scale: 0.98 }}
    style={{ 
        cursor: 'pointer', 
        borderLeft: active ? '3px solid #10b981' : '3px solid transparent',
        background: active ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
        padding: '10px 15px',
        marginBottom: '5px',
        borderRadius: '0 6px 6px 0',
        color: active ? '#fff' : '#a1a1aa',
        transition: 'none',
        display: 'flex',
        alignItems: 'center'
    }}
  >
    <span style={{ marginRight: '12px', display: 'flex', alignItems: 'center', color: active ? '#10b981' : 'inherit' }}>{icon}</span>
    <span style={{ fontWeight: active ? '600' : '400', fontSize: '14px' }}>{label}</span>
  </motion.div>
);

export default AllPipelines;
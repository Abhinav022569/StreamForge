import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Network, 
  Users, 
  Database, 
  HardDrive, 
  Settings, 
  LogOut, 
  User, 
  Activity, 
  Server,
  Zap 
} from 'lucide-react';
import logo from '../assets/logo.png';
import '../App.css';

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
  const [totalDataSize, setTotalDataSize] = useState('0 B'); 
  const [activeRuns, setActiveRuns] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser) setUser(JSON.parse(storedUser));

    if (token) {
        axios.get('http://127.0.0.1:5000/pipelines', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            const allPipelines = res.data;
            setPipelines(allPipelines);
            setRecentPipelines(allPipelines.slice(0, 5));
            setActiveRuns(allPipelines.filter(p => p.status === 'Active').length);
        })
        .catch(err => console.error("Error fetching pipelines:", err));

        axios.get('http://127.0.0.1:5000/user-stats', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setTotalDataSize(formatBytes(res.data.total_processed_bytes)))
        .catch(err => console.error("Error fetching stats:", err));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

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

      {/* 1. SIDEBAR */}
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
            padding: 0 // Remove global padding to let footer touch edges
        }}
      >
        {/* TOP SECTION: Logo & Nav (With Padding Added Back) */}
        <div style={{ padding: '20px' }}>
            <div className="sidebar-logo" style={{ marginBottom: '40px', paddingLeft: '10px' }}>
              <img src={logo} alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '4px', boxShadow: '0 0 10px rgba(16,185,129,0.4)' }} />
              <span style={{ fontWeight: '700', letterSpacing: '0.5px' }}>StreamForge</span>
            </div>

            <nav className="sidebar-nav">
              <SidebarItem label="Overview" icon={<LayoutDashboard size={20} />} active />
              <SidebarItem label="All Pipelines" icon={<Network size={20} />} onClick={() => navigate('/pipelines')} />
              <SidebarItem label="Collaboration" icon={<Users size={20} />} onClick={() => navigate('/collaboration')} />
              <SidebarItem label="Data Sources" icon={<Database size={20} />} onClick={() => navigate('/datasources')} />
              <SidebarItem label="Processed Data" icon={<HardDrive size={20} />} onClick={() => navigate('/processed')} />
              <SidebarItem label="Settings" icon={<Settings size={20} />} onClick={() => navigate('/settings')} />
            </nav>
        </div>

        {/* BOTTOM SECTION: Grounded Footer Panel (Flush to edges) */}
        <div style={{ 
            padding: '20px', 
            borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
            background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            {/* User Info Row */}
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

            {/* Logout Button */}
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

      {/* 2. MAIN CONTENT (Unchanged) */}
      <main className="main-content" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div className="content-wrapper" variants={containerVariants} initial="hidden" animate="visible">
          
          <motion.div className="flex justify-between items-center" style={{ marginBottom: '30px' }} variants={itemVariants}>
            <div>
              <h1 style={{ fontSize: '32px', marginBottom: '5px', margin: 0, background: 'linear-gradient(90deg, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard</h1>
              <p className="text-muted" style={{ margin: 0, fontSize: '14px' }}>Overview of your data operations</p>
            </div>
            
            <motion.button 
                className="btn btn-success" 
                onClick={() => navigate('/builder')}
                whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(16,185,129,0.4)' }}
                whileTap={{ scale: 0.95 }}
                style={{ fontWeight: '600' }}
            >
              + Create New Pipeline
            </motion.button>
          </motion.div>

          <motion.div className="flex gap-20" style={{ marginBottom: '30px' }} variants={itemVariants}>
            <StatCard label="Total Pipelines" value={pipelines.length} icon={<Network size={24} />} color="#3b82f6" />
            <StatCard label="Active Runs" value={activeRuns} icon={<Activity size={24} />} color="#eab308" />
            <StatCard label="Data Processed" value={totalDataSize} icon={<Server size={24} />} color="#10b981" />
          </motion.div>

          <motion.div 
            className="card"
            variants={itemVariants}
            style={{ 
                background: 'rgba(24, 24, 27, 0.4)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#e4e4e7' }}>Recent Activity</h3>
              <span style={{ fontSize: '12px', color: '#71717a' }}>Last 5 pipelines</span>
            </div>
            
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ background: 'transparent', color: '#a1a1aa' }}>Pipeline Name</th>
                  <th style={{ background: 'transparent', color: '#a1a1aa' }}>Status</th>
                  <th style={{ background: 'transparent', color: '#a1a1aa' }}>Created</th>
                  <th style={{ background: 'transparent', color: '#a1a1aa' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentPipelines.length === 0 ? (
                    <tr>
                        <td colSpan="4" className="text-center text-muted" style={{ padding: '40px' }}>
                            No pipelines found. <br/>
                            <span style={{ fontSize: '12px', opacity: 0.7 }}>Create one to get started!</span>
                        </td>
                    </tr>
                ) : (
                    recentPipelines.map((pipe, index) => (
                        <motion.tr 
                            key={pipe.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                        >
                            <td className="font-medium" style={{ color: '#e4e4e7' }}>{pipe.name}</td>
                            <td>
                                <span className={`status-badge`}
                                      style={{
                                          background: pipe.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(113, 113, 122, 0.2)',
                                          color: pipe.status === 'Active' ? '#10b981' : '#a1a1aa',
                                          border: pipe.status === 'Active' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(113, 113, 122, 0.3)',
                                          padding: '4px 10px', 
                                          borderRadius: '12px', 
                                          fontSize: '11px', 
                                          fontWeight: '600',
                                          boxShadow: pipe.status === 'Active' ? '0 0 10px rgba(16, 185, 129, 0.1)' : 'none'
                                      }}>
                                    {pipe.status === 'Active' ? '● Active' : '○ Ready'}
                                </span>
                            </td>
                            <td className="text-muted" style={{ fontSize: '13px' }}>{pipe.created_at || 'Just now'}</td>
                            <td>
                                <button 
                                    className="btn btn-ghost" 
                                    style={{ fontSize: '12px', padding: '6px 12px', border: '1px solid rgba(255,255,255,0.1)', color: '#d4d4d8' }}
                                    onClick={() => navigate(`/builder/${pipe.id}`)}
                                >
                                    Open
                                </button>
                            </td>
                        </motion.tr>
                    ))
                )}
              </tbody>
            </table>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
};

// Helper Components
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

const StatCard = ({ label, value, icon, color }) => (
  <motion.div 
    className="card" 
    style={{ 
        flex: 1, 
        padding: '24px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '20px',
        background: 'rgba(24, 24, 27, 0.4)', 
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        position: 'relative',
        overflow: 'hidden'
    }}
    whileHover={{ y: -5, borderColor: `rgba(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)}, 0.4)` }}
  >
    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '60px', height: '60px', background: color, filter: 'blur(40px)', opacity: 0.2 }}></div>
    <div style={{ 
        fontSize: '28px', 
        background: `rgba(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)}, 0.1)`, 
        color: color,
        width: '60px', height: '60px', 
        borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid rgba(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)}, 0.2)`
    }}>
      {icon}
    </div>
    <div>
      <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>{value}</h3>
      <p className="text-muted" style={{ margin: 0, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
    </div>
  </motion.div>
);

export default Dashboard;
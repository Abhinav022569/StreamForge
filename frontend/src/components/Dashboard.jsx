import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Network, Activity, Server, Plus } from 'lucide-react';
import AppLayout from './layout/AppLayout';
import '../App.css';

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
  const [pipelines, setPipelines] = useState([]);
  const [recentPipelines, setRecentPipelines] = useState([]);
  const [totalDataSize, setTotalDataSize] = useState('0 B'); 
  const [activeRuns, setActiveRuns] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        axios.get('http://192.168.1.12:5000/pipelines', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            const allPipelines = res.data;
            setPipelines(allPipelines);
            setRecentPipelines(allPipelines.slice(0, 5));
            setActiveRuns(allPipelines.filter(p => p.status === 'Active').length);
        })
        .catch(err => console.error("Error fetching pipelines:", err));

        axios.get('http://192.168.1.12:5000/user-stats', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setTotalDataSize(formatBytes(res.data.total_processed_bytes)))
        .catch(err => console.error("Error fetching stats:", err));
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
  };

  return (
    <AppLayout>
        <motion.div className="content-wrapper" variants={containerVariants} initial="hidden" animate="visible">
          
          <motion.div className="dashboard-header-flex" style={{ marginBottom: '30px' }} variants={itemVariants}>
            <div>
              <h1 style={{ fontSize: '32px', marginBottom: '5px', margin: 0, background: 'linear-gradient(90deg, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard</h1>
              <p className="text-muted" style={{ margin: 0, fontSize: '14px' }}>Overview of your data operations</p>
            </div>
            
            <motion.button 
                className="btn btn-success" 
                onClick={() => navigate('/builder')}
                whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(16,185,129,0.4)' }}
                whileTap={{ scale: 0.95 }}
                style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Plus size={18} />
              <span>Create New Pipeline</span>
            </motion.button>
          </motion.div>

          {/* Updated to use responsive grid class instead of fixed flex */}
          <motion.div className="stats-grid" style={{ marginBottom: '30px' }} variants={itemVariants}>
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
            
            {/* Added scroll wrapper for table */}
            <div className="table-responsive">
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
                                            boxShadow: pipe.status === 'Active' ? '0 0 10px rgba(16, 185, 129, 0.1)' : 'none',
                                            whiteSpace: 'nowrap'
                                        }}>
                                        {pipe.status === 'Active' ? '● Active' : '○ Ready'}
                                    </span>
                                </td>
                                <td className="text-muted" style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>{pipe.created_at || 'Just now'}</td>
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
            </div>
          </motion.div>
        </motion.div>
    </AppLayout>
  );
};

const StatCard = ({ label, value, icon, color }) => (
  <motion.div 
    className="card" 
    style={{ 
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
        border: `1px solid rgba(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)}, 0.2)`,
        flexShrink: 0
    }}>
      {icon}
    </div>
    <div>
      <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>{value}</h3>
      <p className="text-muted" style={{ margin: 0, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{label}</p>
    </div>
  </motion.div>
);

export default Dashboard;
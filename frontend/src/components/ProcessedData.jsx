import React, { useState, useEffect } from 'react';
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
  Download,
  Trash2,
  FileText,
  FileSpreadsheet,
  FileJson,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  AlertTriangle
} from 'lucide-react';
import logo from '../assets/logo.png';
import '../App.css'; 

const ProcessedData = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: 'User' });
  const [processedFiles, setProcessedFiles] = useState([]); 

  // --- NEW: Notification & Modal State ---
  const [notification, setNotification] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, fileName: '' });

  const showToast = (message, type = 'success') => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    const fetchProcessedFiles = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://127.0.0.1:5000/processed-files', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProcessedFiles(res.data);
        } catch (err) {
            console.error("Error fetching processed files:", err);
            showToast("Failed to load files", "error");
        }
    };
    fetchProcessedFiles();
    
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleDownload = (fileName) => {
    showToast("Download started...", "info");
    window.open(`http://127.0.0.1:5000/download/processed/${fileName}`, '_blank');
  };

  // 1. Open Modal
  const initiateDelete = (id, fileName) => {
      setDeleteModal({ isOpen: true, id, fileName });
  };

  // 2. Perform Delete
  const confirmDelete = async () => {
    const { id } = deleteModal;
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://127.0.0.1:5000/processed-files/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setProcessedFiles(processedFiles.filter(f => f.id !== id));
        showToast("File deleted successfully", "success");
    } catch (err) {
        showToast("Failed to delete file", "error");
    } finally {
        setDeleteModal({ isOpen: false, id: null, fileName: '' });
    }
  };

  const getFileIcon = (type) => {
      if (type === 'Excel') return <FileSpreadsheet size={18} color="#10b981" />;
      if (type === 'JSON') return <FileJson size={18} color="#eab308" />;
      if (type === 'Database') return <Database size={18} color="#8b5cf6" />;
      if (type === 'Image') return <ImageIcon size={18} color="#ec4899" />;
      return <FileText size={18} color="#3b82f6" />;
  };

  // --- Animations ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
  };

  // --- HELPER: Toast Component ---
  const ToastNotification = () => (
    <AnimatePresence>
        {notification && (
            <motion.div 
                initial={{ opacity: 0, y: -50, x: '-50%' }} 
                animate={{ opacity: 1, y: 20, x: '-50%' }} 
                exit={{ opacity: 0, y: -20, x: '-50%' }}
                style={{
                    position: 'fixed', left: '50%', top: 0, zIndex: 2000,
                    background: notification.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 
                                notification.type === 'info' ? 'rgba(59, 130, 246, 0.9)' : 
                                'rgba(16, 185, 129, 0.9)',
                    color: 'white', padding: '12px 24px', borderRadius: '50px',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.2)', minWidth: '300px', justifyContent: 'center'
                }}
            >
                {notification.type === 'error' ? <AlertCircle size={20} /> : 
                 notification.type === 'info' ? <Info size={20} /> :
                 <CheckCircle2 size={20} />}
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{notification.message}</span>
                <button 
                    onClick={() => setNotification(null)}
                    style={{ background: 'transparent', border: 'none', color: 'white', marginLeft: 'auto', cursor: 'pointer', display: 'flex' }}
                >
                    <X size={16} />
                </button>
            </motion.div>
        )}
    </AnimatePresence>
  );

  return (
    <div className="app-container" style={{ background: '#0f1115', position: 'relative', overflow: 'hidden', height: '100vh', display: 'flex' }}>
      
      {/* Toast Notification */}
      <ToastNotification />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
            <motion.div 
                style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
                <motion.div 
                    style={{
                        width: '400px', background: '#18181b', 
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
                        padding: '30px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px' }}>
                        <div style={{ 
                            width: '60px', height: '60px', borderRadius: '50%', 
                            background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <AlertTriangle size={32} />
                        </div>
                        
                        <h3 style={{ margin: 0, color: 'white', fontSize: '20px' }}>Delete Output File?</h3>
                        
                        <p style={{ margin: 0, color: '#a1a1aa', fontSize: '14px', lineHeight: '1.5' }}>
                            Are you sure you want to delete <b style={{ color: 'white' }}>"{deleteModal.fileName}"</b>? 
                            <br/>This action cannot be undone.
                        </p>

                        <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '10px' }}>
                            <button 
                                onClick={() => setDeleteModal({ isOpen: false, id: null, fileName: '' })}
                                className="btn btn-ghost"
                                style={{ flex: 1, justifyContent: 'center' }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="btn"
                                style={{ 
                                    flex: 1, justifyContent: 'center', 
                                    background: '#ef4444', color: 'white', border: 'none', fontWeight: '600' 
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

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
            padding: 0,
            height: '100%',
            overflow: 'hidden',
            flexShrink: 0,
            width: '260px'
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
              <SidebarItem label="All Pipelines" icon={<Network size={20} />} onClick={() => navigate('/pipelines')} />
              <SidebarItem label="Collaboration" icon={<Users size={20} />} onClick={() => navigate('/collaboration')} />
              <SidebarItem label="Data Sources" icon={<Database size={20} />} onClick={() => navigate('/datasources')} />
              <SidebarItem label="Processed Data" icon={<HardDrive size={20} />} active /> 
              <SidebarItem label="Settings" icon={<Settings size={20} />} onClick={() => navigate('/settings')} />
            </nav>
        </div>

        {/* BOTTOM SECTION */}
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

      {/* 2. MAIN CONTENT - SCROLLABLE */}
      <main className="main-content" style={{ position: 'relative', zIndex: 1, overflowY: 'auto', flexGrow: 1, height: '100%' }}>
        <motion.div 
          className="content-wrapper"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ paddingBottom: '60px' }}
        >
          
          {/* Header */}
          <motion.div style={{ marginBottom: '40px' }} variants={itemVariants}>
            <h1 style={{ fontSize: '32px', marginBottom: '5px', margin: 0, background: 'linear-gradient(90deg, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Processed Data</h1>
            <p className="text-muted" style={{ margin: 0, fontSize: '14px' }}>Download the output files generated by your pipelines.</p>
          </motion.div>

          {/* Files List */}
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
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#e4e4e7' }}>Output Files</h3>
            </div>
            
            <table className="data-table">
              <thead>
                <tr className="table-header">
                  <th style={{ background: 'rgba(0,0,0,0.2)', color: '#a1a1aa' }}>File Name</th>
                  <th style={{ background: 'rgba(0,0,0,0.2)', color: '#a1a1aa' }}>Type</th>
                  <th style={{ background: 'rgba(0,0,0,0.2)', color: '#a1a1aa' }}>Size</th>
                  <th style={{ background: 'rgba(0,0,0,0.2)', color: '#a1a1aa' }}>Created</th>
                  <th style={{ background: 'rgba(0,0,0,0.2)', color: '#a1a1aa', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                {processedFiles.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="text-center text-muted" style={{ padding: '60px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                              <HardDrive size={32} style={{ opacity: 0.2 }} />
                              <span>No processed files found. Run a pipeline to generate data.</span>
                            </div>
                        </td>
                    </tr>
                ) : (
                    processedFiles.map((file, index) => (
                    <motion.tr 
                        key={file.id} 
                        className="table-row"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    >
                        <td style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', color: '#e4e4e7' }}>
                            {getFileIcon(file.type)} 
                            {file.name}
                        </td>
                        <td className="text-muted">
                            <span style={{ 
                                background: file.type === 'Excel' ? 'rgba(22, 163, 74, 0.15)' : 
                                            file.type === 'JSON' ? 'rgba(251, 191, 36, 0.15)' : 
                                            file.type === 'Database' ? 'rgba(139, 92, 246, 0.15)' : 
                                            file.type === 'Image' ? 'rgba(236, 72, 153, 0.15)' :
                                            'rgba(59, 130, 246, 0.15)',
                                color: file.type === 'Excel' ? '#16a34a' : 
                                       file.type === 'JSON' ? '#fbbf24' : 
                                       file.type === 'Database' ? '#8b5cf6' : 
                                       file.type === 'Image' ? '#ec4899' :
                                       '#3b82f6',
                                padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', border: '1px solid rgba(255,255,255,0.05)' 
                            }}>
                                {file.type}
                            </span>
                        </td>
                        <td className="text-muted" style={{ fontSize: '13px' }}>{file.size}</td>
                        <td className="text-muted" style={{ fontSize: '13px' }}>{file.date}</td>
                        <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <motion.button 
                                    onClick={() => handleDownload(file.name)}
                                    className="btn btn-ghost" 
                                    style={{ 
                                        padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px',
                                        color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', background: 'rgba(59, 130, 246, 0.05)'
                                    }}
                                    whileHover={{ background: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.4)' }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Download size={14} /> Download
                                </motion.button>
                                <motion.button 
                                    onClick={() => initiateDelete(file.id, file.name)}
                                    className="btn btn-ghost" 
                                    style={{ 
                                        padding: '6px 12px', fontSize: '12px', 
                                        color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)'
                                    }}
                                    whileHover={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Trash2 size={14} />
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

export default ProcessedData;
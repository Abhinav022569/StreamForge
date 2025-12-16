import React, { useState, useEffect, useRef } from 'react';
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
  UploadCloud,
  FileText,
  Trash2,
  FileSpreadsheet,
  FileJson,
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  AlertTriangle
} from 'lucide-react';
import logo from '../assets/logo.png';
import '../App.css'; 

const DataSources = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: 'User' });
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null); 

  // --- NEW: Notification & Modal State ---
  const [notification, setNotification] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  const showToast = (message, type = 'success') => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (token) {
      fetchFiles(token);
    }
  }, []);

  const fetchFiles = async (token) => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/datasources', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(res.data);
    } catch (err) {
      console.error("Error fetching files:", err);
      showToast("Failed to fetch files", "error");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // --- FILE UPLOAD LOGIC ---

  const uploadFile = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');

    try {
        await axios.post('http://127.0.0.1:5000/upload', formData, {
            headers: { 
                'Authorization': `Bearer ${token}`,
            }
        });
        showToast("Upload Successful!", "success");
        fetchFiles(token); 
    } catch (error) {
        console.error("Upload failed", error);
        showToast("Upload failed. Check console for details.", "error");
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
        uploadFile(droppedFiles[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const onFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
        uploadFile(e.target.files[0]);
    }
  };

  // 1. Open Modal
  const confirmDelete = (id) => {
      setDeleteModal({ isOpen: true, id });
  };

  // 2. Perform Delete
  const handleDelete = async () => {
    const { id } = deleteModal;
    const token = localStorage.getItem('token');
    try {
        await axios.delete(`http://127.0.0.1:5000/datasources/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setFiles(files.filter(f => f.id !== id));
        showToast("File deleted successfully", "success");
    } catch (err) {
        showToast("Delete failed", "error");
    } finally {
        setDeleteModal({ isOpen: false, id: null });
    }
  };

  const getFileIcon = (type) => {
      if (type === 'CSV') return <FileText size={18} color="#10b981" />;
      if (type === 'JSON') return <FileJson size={18} color="#eab308" />;
      if (type === 'EXCEL') return <FileSpreadsheet size={18} color="#3b82f6" />;
      return <FileText size={18} color="#a1a1aa" />;
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
      
      {/* Notifications & Modals */}
      <ToastNotification />

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
                        
                        <h3 style={{ margin: 0, color: 'white', fontSize: '20px' }}>Delete File?</h3>
                        
                        <p style={{ margin: 0, color: '#a1a1aa', fontSize: '14px', lineHeight: '1.5' }}>
                            Are you sure you want to delete this data source? 
                            <br/>This action cannot be undone.
                        </p>

                        <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '10px' }}>
                            <button 
                                onClick={() => setDeleteModal({ isOpen: false, id: null })}
                                className="btn btn-ghost"
                                style={{ flex: 1, justifyContent: 'center' }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDelete}
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
              <SidebarItem label="Data Sources" icon={<Database size={20} />} active />
              <SidebarItem label="Processed Data" icon={<HardDrive size={20} />} onClick={() => navigate('/processed')} />
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
          
          <motion.div style={{ marginBottom: '40px' }} variants={itemVariants}>
            <h1 style={{ fontSize: '32px', marginBottom: '5px', margin: 0, background: 'linear-gradient(90deg, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Data Sources</h1>
            <p className="text-muted" style={{ margin: 0, fontSize: '14px' }}>Manage your raw data files and database connections.</p>
          </motion.div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onFileSelect} 
            style={{ display: 'none' }} 
          />

          {/* UPLOAD AREA */}
          <motion.div 
            className="upload-area"
            variants={itemVariants}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={handleClick}
            whileHover={{ 
                scale: 1.01, 
                borderColor: '#10b981', 
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.1)'
            }}
            whileTap={{ scale: 0.99 }}
            style={{ 
                border: '2px dashed rgba(255,255,255,0.1)', 
                borderRadius: '16px',
                padding: '50px',
                textAlign: 'center',
                marginBottom: '40px',
                cursor: 'pointer',
                background: 'rgba(24, 24, 27, 0.4)',
                transition: 'all 0.3s'
            }}
          >
            <motion.div 
                style={{ 
                    fontSize: '40px', marginBottom: '15px', color: '#10b981',
                    background: 'rgba(16, 185, 129, 0.1)', width: '80px', height: '80px',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto'
                }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
                <UploadCloud size={40} />
            </motion.div>
            <h3 style={{ color: 'white', marginBottom: '8px', marginTop: 0, fontSize: '18px' }}>Click or Drag file to upload</h3>
            <p className="text-muted" style={{ fontSize: '14px', margin: 0 }}>Supports CSV, JSON, Excel (Max 50MB)</p>
          </motion.div>

          {/* FILES LIST */}
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
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#e4e4e7' }}>Connected Sources</h3>
            </div>
            
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ background: 'rgba(0,0,0,0.2)', color: '#a1a1aa' }}>File Name</th>
                  <th style={{ background: 'rgba(0,0,0,0.2)', color: '#a1a1aa' }}>Type</th>
                  <th style={{ background: 'rgba(0,0,0,0.2)', color: '#a1a1aa' }}>Size</th>
                  <th style={{ background: 'rgba(0,0,0,0.2)', color: '#a1a1aa' }}>Date Added</th>
                  <th style={{ background: 'rgba(0,0,0,0.2)', color: '#a1a1aa', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                {files.length === 0 ? (
                    <tr><td colSpan="5" className="text-center text-muted" style={{ padding: '40px' }}>No files uploaded yet.</td></tr>
                ) : (
                    files.map((file, index) => (
                    <motion.tr 
                        key={file.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    >
                        <td style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', color: '#e4e4e7' }}>
                            {getFileIcon(file.type)} {file.name}
                        </td>
                        <td className="text-muted" style={{ fontSize: '13px' }}>{file.type}</td>
                        <td className="text-muted" style={{ fontSize: '13px' }}>{file.size}</td>
                        <td className="text-muted" style={{ fontSize: '13px' }}>{file.date}</td>
                        <td style={{ textAlign: 'right' }}>
                        <motion.button 
                            onClick={() => confirmDelete(file.id)}
                            className="btn" 
                            style={{ 
                                padding: '6px 12px', fontSize: '12px',
                                background: 'rgba(239, 68, 68, 0.1)', 
                                color: '#f87171',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                display: 'inline-flex', alignItems: 'center', gap: '4px'
                            }}
                            whileHover={{ background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Trash2 size={12} /> Remove
                        </motion.button>
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

export default DataSources;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  AlertCircle, 
  CheckCircle2,
  Info,
  AlertTriangle 
} from 'lucide-react';
import AppLayout from './layout/AppLayout';
import '../App.css'; 

const AllPipelines = () => {
  const navigate = useNavigate();
  const [pipelines, setPipelines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- Notification State ---
  const [notification, setNotification] = useState(null); 

  // --- NEW: Delete Modal State ---
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });

  const showToast = (message, type = 'success') => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchPipelines(token);
    }
  }, []);

  const fetchPipelines = (token) => {
    axios.get('http://127.0.0.1:5000/pipelines', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setPipelines(res.data))
    .catch(err => {
        console.error("Error fetching pipelines:", err);
        showToast("Failed to load pipelines", "error");
    });
  };

  const openDeleteModal = (id, name) => {
      setDeleteModal({ isOpen: true, id, name });
  };

  const confirmDelete = async () => {
    const { id } = deleteModal;
    const token = localStorage.getItem('token');
    
    try {
        await axios.delete(`http://127.0.0.1:5000/pipelines/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setPipelines(pipelines.filter(p => p.id !== id));
        showToast("Pipeline deleted successfully", "success");
    } catch (err) {
        console.error(err);
        showToast("Failed to delete pipeline", "error");
    } finally {
        setDeleteModal({ isOpen: false, id: null, name: '' });
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
    <AppLayout>
      <ToastNotification />

      {/* Delete Modal Overlay */}
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
                        
                        <h3 style={{ margin: 0, color: 'white', fontSize: '20px' }}>Delete Pipeline?</h3>
                        
                        <p style={{ margin: 0, color: '#a1a1aa', fontSize: '14px', lineHeight: '1.5' }}>
                            Are you sure you want to delete <b style={{ color: 'white' }}>"{deleteModal.name}"</b>? 
                            <br/>This action cannot be undone.
                        </p>

                        <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '10px' }}>
                            <button 
                                onClick={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
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

      <motion.div 
          className="content-wrapper"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          
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
                            <motion.button 
                                className="btn btn-ghost" 
                                style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                                onClick={() => navigate(`/builder/${pipe.id}`)}
                                whileHover={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)' }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ExternalLink size={12} /> Open
                            </motion.button>

                            <motion.button 
                                className="btn" 
                                style={{ 
                                  fontSize: '12px', padding: '6px 12px', 
                                  background: 'rgba(239, 68, 68, 0.1)', 
                                  color: '#f87171',
                                  border: '1px solid rgba(239, 68, 68, 0.2)',
                                  display: 'flex', alignItems: 'center', gap: '4px'
                                }}
                                onClick={() => openDeleteModal(pipe.id, pipe.name)}
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
    </AppLayout>
  );
};

export default AllPipelines;
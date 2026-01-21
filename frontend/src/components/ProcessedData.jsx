import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { 
  HardDrive, Download, Trash2, Eye, 
  FileText, FileSpreadsheet, FileJson, Image as ImageIcon, Database,
  CheckCircle2, X, AlertTriangle, Search, Clock, Box
} from 'lucide-react';
import AppLayout from './layout/AppLayout';
import DataPreviewPanel from './DataPreviewPanel'; 
import '../App.css'; 

const ProcessedData = () => {
  const [processedFiles, setProcessedFiles] = useState([]); 
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [isFetching, setIsFetching] = useState(true); // Added loading state

  const [notification, setNotification] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, fileName: '' });

  const [previewPanel, setPreviewPanel] = useState({ 
      isOpen: false, loading: false, data: [], columns: [], error: null, nodeLabel: '', imageSrc: null 
  });

  const showToast = (message, type = 'success') => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    fetchProcessedFiles();
  }, []);

  // RESTORED FILTER LOGIC
  useEffect(() => {
      let result = processedFiles;
      if (searchQuery) {
          result = result.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
      }
      if (selectedType !== 'All') {
          result = result.filter(f => f.type === selectedType);
      }
      setFilteredFiles(result);
  }, [processedFiles, searchQuery, selectedType]);

  const fetchProcessedFiles = async () => {
        setIsFetching(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://127.0.0.1:5000/processed-files', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProcessedFiles(res.data.reverse());
            setFilteredFiles(res.data);
        } catch (err) {
            console.error("Error fetching processed files:", err);
            showToast("Failed to load files", "error");
        } finally {
            setIsFetching(false);
        }
    };

  const handleDownload = (fileName) => {
    showToast("Download started...", "info");
    window.open(`http://127.0.0.1:5000/download/processed/${fileName}`, '_blank');
  };

  const handleView = async (file) => {
      setPreviewPanel({
          isOpen: true, loading: true, data: [], columns: [], error: null, nodeLabel: file.name, imageSrc: null 
      });

      if (file.type === 'Image') {
          setPreviewPanel(prev => ({
              ...prev, loading: false, imageSrc: `http://127.0.0.1:5000/download/processed/${file.name}`
          }));
          return;
      }

      try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`http://127.0.0.1:5000/processed-files/${file.id}/preview`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setPreviewPanel(prev => ({ ...prev, loading: false, data: res.data.data, columns: res.data.columns }));
      } catch (err) {
          setPreviewPanel(prev => ({ ...prev, loading: false, error: err.response?.data?.error || "Failed to fetch preview." }));
      }
  };

  const initiateDelete = (id, fileName) => {
      setDeleteModal({ isOpen: true, id, fileName });
  };

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
      if (type === 'Excel' || type === 'XLS') return { icon: <FileSpreadsheet size={20} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
      if (type === 'JSON') return { icon: <FileJson size={20} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
      if (type === 'Database' || type === 'SQL') return { icon: <Database size={20} />, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' };
      if (type === 'Image') return { icon: <ImageIcon size={20} />, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' };
      return { icon: <FileText size={20} />, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
  };

  return (
    <AppLayout>
      <style>
        {`
            .glass-panel {
                background: rgba(24, 24, 27, 0.6);
                backdrop-filter: blur(16px);
                border: 1px solid rgba(255, 255, 255, 0.05);
                box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
            }
            .custom-scrollbar::-webkit-scrollbar { display: none; }
            .file-row-container {
                display: grid;
                grid-template-columns: 2fr 1.5fr 1fr;
                align-items: center;
                padding: 16px 24px;
                border-radius: 16px;
                background: rgba(255,255,255,0.02);
                border: 1px solid rgba(255,255,255,0.05);
                margin-bottom: 12px;
                transition: background-color 0.2s;
            }
            .file-row-container:hover {
                background-color: rgba(255,255,255,0.04);
                border-color: rgba(255,255,255,0.1);
            }
        `}
      </style>

      <ToastNotification notification={notification} setNotification={setNotification} />

      <DataPreviewPanel 
          isOpen={previewPanel.isOpen}
          onClose={() => setPreviewPanel(prev => ({ ...prev, isOpen: false }))}
          data={previewPanel.data}
          columns={previewPanel.columns}
          loading={previewPanel.loading}
          error={previewPanel.error}
          nodeLabel={previewPanel.nodeLabel}
          imageSrc={previewPanel.imageSrc}
      />

      <DeleteModal 
        isOpen={deleteModal.isOpen} 
        fileName={deleteModal.fileName} 
        onClose={() => setDeleteModal({ isOpen: false, id: null, fileName: '' })} 
        onConfirm={confirmDelete} 
      />

      <div style={{ padding: '32px 48px', maxWidth: '1800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          
          <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h1 style={{ fontSize: '36px', fontWeight: '800', color: 'white', margin: 0, letterSpacing: '-0.5px' }}>
                            Processed Data
                        </h1>
                    </div>
                    <p style={{ color: '#a1a1aa', fontSize: '15px', maxWidth: '600px', lineHeight: '1.5' }}>
                        Access, visualize, and manage the output artifacts generated by your pipelines.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} color="#71717a" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input 
                            type="text" 
                            placeholder="Search outputs..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ 
                                background: 'rgba(24, 24, 27, 0.6)', border: '1px solid rgba(255,255,255,0.1)', 
                                padding: '12px 20px 12px 46px', borderRadius: '50px', color: 'white', 
                                outline: 'none', minWidth: '280px', fontSize: '14px', backdropFilter: 'blur(10px)'
                            }} 
                        />
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT CARD */}
            <motion.div 
                className="glass-panel" 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                style={{ borderRadius: '24px', padding: '28px', minHeight: '600px', display: 'flex', flexDirection: 'column' }}
            >
                
                {/* Panel Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Box size={20} color="#8b5cf6" /> Artifacts
                    </h3>
                    
                    {/* TYPE FILTERS */}
                    <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {['All', 'CSV', 'JSON', 'Excel', 'Image'].map(type => (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                style={{
                                    background: selectedType === type ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    color: selectedType === type ? 'white' : '#71717a',
                                    border: 'none', borderRadius: '20px', padding: '6px 16px',
                                    fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- HEADER ROW --- */}
                <div style={{ 
                    display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr', 
                    padding: '0 24px 12px 24px', color: '#a1a1aa', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>
                    <div>File Name & Type</div>
                    <div>Metadata</div>
                    <div style={{ textAlign: 'right' }}>Actions</div>
                </div>

                {/* --- FILE LIST --- */}
                <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                    {isFetching ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                            <div className="spinner" style={{ borderTopColor: '#3b82f6', width: '30px', height: '30px' }} />
                        </div>
                    ) : (
                        <LayoutGroup>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <AnimatePresence mode='popLayout'>
                                    {filteredFiles.length === 0 ? (
                                        <motion.div 
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            style={{ textAlign: 'center', padding: '80px', color: '#52525b' }}
                                        >
                                            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                                <Database size={40} style={{ opacity: 0.4 }} />
                                            </div>
                                            <p>No matching files found.</p>
                                        </motion.div>
                                    ) : (
                                        filteredFiles.map((file) => {
                                            const { icon, color, bg } = getFileIcon(file.type);
                                            return (
                                                <motion.div 
                                                    layout 
                                                    key={file.id}
                                                    // SIMPLE, ROBUST ANIMATION: Enter instantly with slight slide-up
                                                    initial={{ opacity: 0, y: 10 }} 
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="file-row-container"
                                                >
                                                    {/* Left: Icon & Name */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                        <div style={{ 
                                                                width: '40px', height: '40px', borderRadius: '12px', 
                                                                background: bg, color: color,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                                            }}
                                                        >
                                                            {icon}
                                                        </div>
                                                        <div>
                                                            <h4 style={{ color: '#e4e4e7', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>{file.name}</h4>
                                                            <span style={{ fontSize: '10px', color: color, background: `${color}15`, padding: '2px 8px', borderRadius: '6px', border: `1px solid ${color}20` }}>{file.type}</span>
                                                        </div>
                                                    </div>

                                                    {/* Middle: Metadata */}
                                                    <div style={{ display: 'flex', gap: '32px', color: '#a1a1aa', fontSize: '13px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <HardDrive size={16} color="#52525b" /> {file.size}
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <Clock size={16} color="#52525b" /> {file.date}
                                                        </div>
                                                    </div>

                                                    {/* Right: Actions */}
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                        {(file.type === 'CSV' || file.type === 'JSON' || file.type === 'Excel' || file.type === 'Image') && (
                                                            <ActionButton onClick={() => handleView(file)} icon={<Eye size={16} />} color="#e4e4e7" label="Preview" />
                                                        )}
                                                        <ActionButton onClick={() => handleDownload(file.name)} icon={<Download size={16} />} color="#3b82f6" label="Download" />
                                                        <ActionButton onClick={() => initiateDelete(file.id, file.name)} icon={<Trash2 size={16} />} color="#ef4444" isDelete label="Delete" />
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    )}
                                </AnimatePresence>
                            </div>
                        </LayoutGroup>
                    )}
                </div>

            </motion.div>
          </motion.div>
      </div>
    </AppLayout>
  );
};

// --- SUB COMPONENTS ---

const ActionButton = ({ onClick, icon, color, isDelete, label }) => (
    <motion.button 
        onClick={onClick}
        title={label}
        whileHover={{ scale: 1.1, backgroundColor: isDelete ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)' }}
        whileTap={{ scale: 0.9 }}
        style={{ 
            padding: '8px', 
            background: isDelete ? 'rgba(239, 68, 68, 0.1)' : 'transparent', 
            border: isDelete ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '10px', 
            color: color, 
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyItems: 'center'
        }}
    >
        {icon}
    </motion.button>
);

const ToastNotification = ({ notification, setNotification }) => (
    <AnimatePresence>
        {notification && (
            <motion.div 
                initial={{ opacity: 0, y: -50, x: '-50%' }} 
                animate={{ opacity: 1, y: 20, x: '-50%' }} 
                exit={{ opacity: 0, y: -20, x: '-50%' }}
                style={{
                    position: 'fixed', left: '50%', top: 0, zIndex: 2000,
                    background: notification.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)',
                    color: 'white', padding: '12px 24px', borderRadius: '50px',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}
            >
                {notification.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{notification.message}</span>
                <button onClick={() => setNotification(null)} style={{ background: 'transparent', border: 'none', color: 'white', marginLeft: '10px', cursor: 'pointer', display: 'flex' }}>
                    <X size={16} />
                </button>
            </motion.div>
        )}
    </AnimatePresence>
);

const DeleteModal = ({ isOpen, fileName, onClose, onConfirm }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div 
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div 
                    style={{ width: '400px', background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '32px', textAlign: 'center' }}
                    initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                    onClick={e => e.stopPropagation()}
                >
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <AlertTriangle size={32} />
                    </div>
                    <h3 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '20px' }}>Delete File?</h3>
                    <p style={{ color: '#a1a1aa', fontSize: '15px', marginBottom: '24px', lineHeight: '1.5' }}>
                        Are you sure you want to delete <strong style={{ color: 'white' }}>{fileName}</strong>? This cannot be undone.
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                        <button onClick={onConfirm} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#ef4444', border: 'none', color: 'white', cursor: 'pointer', fontWeight: '600' }}>Delete</button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

export default ProcessedData;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HardDrive, Download, Trash2, Eye, 
  FileText, FileSpreadsheet, FileJson, Image as ImageIcon, Database,
  AlertCircle, CheckCircle2, Info, X, AlertTriangle
} from 'lucide-react';
import AppLayout from './layout/AppLayout';
import DataPreviewPanel from './DataPreviewPanel'; 
import '../App.css'; 

const ProcessedData = () => {
  const [processedFiles, setProcessedFiles] = useState([]); 

  const [notification, setNotification] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, fileName: '' });

  // Added imageSrc to state
  const [previewPanel, setPreviewPanel] = useState({ 
      isOpen: false, loading: false, data: [], columns: [], error: null, nodeLabel: '', imageSrc: null 
  });

  const showToast = (message, type = 'success') => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
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

  const handleDownload = (fileName) => {
    showToast("Download started...", "info");
    window.open(`http://127.0.0.1:5000/download/processed/${fileName}`, '_blank');
  };

  // --- UPDATED VIEW LOGIC ---
  const handleView = async (file) => {
      // Reset State
      setPreviewPanel({
          isOpen: true,
          loading: true,
          data: [],
          columns: [],
          error: null,
          nodeLabel: file.name,
          imageSrc: null // Reset image
      });

      // 1. Handle Image View (No API call needed, just use static URL)
      if (file.type === 'Image') {
          setPreviewPanel(prev => ({
              ...prev,
              loading: false,
              imageSrc: `http://127.0.0.1:5000/download/processed/${file.name}`
          }));
          return;
      }

      // 2. Handle Text Data View (API Call)
      try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`http://127.0.0.1:5000/processed-files/${file.id}/preview`, {
              headers: { Authorization: `Bearer ${token}` }
          });

          setPreviewPanel(prev => ({
              ...prev,
              loading: false,
              data: res.data.data,
              columns: res.data.columns
          }));

      } catch (err) {
          console.error("Preview error:", err);
          setPreviewPanel(prev => ({
              ...prev,
              loading: false,
              error: err.response?.data?.error || "Failed to fetch preview."
          }));
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
                    border: '1px solid rgba(255,255,255,0.2)', minWidth: '300px', justifyContent: 'center',
                    maxWidth: '90%'
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

      <DataPreviewPanel 
          isOpen={previewPanel.isOpen}
          onClose={() => setPreviewPanel(prev => ({ ...prev, isOpen: false }))}
          data={previewPanel.data}
          columns={previewPanel.columns}
          loading={previewPanel.loading}
          error={previewPanel.error}
          nodeLabel={previewPanel.nodeLabel}
          imageSrc={previewPanel.imageSrc} // Passed new prop
      />

      <AnimatePresence>
        {deleteModal.isOpen && (
            <motion.div 
                style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px'
                }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
                <motion.div 
                    style={{
                        width: '100%', maxWidth: '400px', background: '#18181b', 
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

      <motion.div 
          className="content-wrapper"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ paddingBottom: '60px' }}
        >
          
          <motion.div style={{ marginBottom: '40px' }} variants={itemVariants}>
            <h1 style={{ fontSize: '32px', marginBottom: '5px', margin: 0, background: 'linear-gradient(90deg, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Processed Data</h1>
            <p className="text-muted" style={{ margin: 0, fontSize: '14px' }}>Download the output files generated by your pipelines.</p>
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
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#e4e4e7' }}>Output Files</h3>
            </div>
            
            <div className="table-responsive">
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
                          <td style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', color: '#e4e4e7', minWidth: '200px' }}>
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
                          <td className="text-muted" style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>{file.date}</td>
                          <td style={{ textAlign: 'right', minWidth: '150px' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                  
                                  {/* --- VIEW BUTTON (Enabled for CSV, JSON, Excel AND Image) --- */}
                                  {(file.type === 'CSV' || file.type === 'JSON' || file.type === 'Excel' || file.type === 'Image') && (
                                      <motion.button 
                                          onClick={() => handleView(file)}
                                          className="btn btn-ghost" 
                                          style={{ 
                                              padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px',
                                              color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.2)', background: 'rgba(251, 191, 36, 0.05)'
                                          }}
                                          whileHover={{ background: 'rgba(251, 191, 36, 0.15)', borderColor: 'rgba(251, 191, 36, 0.4)' }}
                                          whileTap={{ scale: 0.95 }}
                                      >
                                          <Eye size={14} /> View
                                      </motion.button>
                                  )}
                                  
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
                                      <Download size={14} />
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
            </div>
          </motion.div>

        </motion.div>
    </AppLayout>
  );
};

export default ProcessedData;
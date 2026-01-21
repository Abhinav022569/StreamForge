import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Database, UploadCloud, Trash2, FileText, FileJson, 
    Table, Search, CheckCircle, Clock, 
    Filter, Plus, AlertCircle, ArrowUpRight
} from 'lucide-react';
import AppLayout from './layout/AppLayout';
import '../App.css';

const DataSources = () => {
    // --- State ---
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const fileInputRef = useRef(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get('http://127.0.0.1:5000/datasources', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Sort by ID descending (newest first)
            const sorted = Array.isArray(res.data) ? res.data.sort((a, b) => b.id - a.id) : [];
            setFiles(sorted);
        } catch (err) {
            console.error(err);
            showToast('Failed to load data sources', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        setUploading(true);

        const token = localStorage.getItem('token');
        try {
            await axios.post('http://127.0.0.1:5000/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
            });
            showToast('File uploaded successfully');
            fetchData();
        } catch (err) {
            showToast('Upload failed', 'error');
        } finally {
            setUploading(false);
            if(fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://127.0.0.1:5000/datasources/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFiles(prev => prev.filter(f => f.id !== id));
            showToast('File deleted');
        } catch (err) {
            showToast('Delete failed', 'error');
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // --- Safe Filtering Logic ---
    const filteredFiles = files.filter(f => {
        const fName = f.name || '';
        const fType = f.type || '';
        
        const matchesSearch = fName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = activeFilter === 'All' ? true : 
                            activeFilter === 'CSV' ? fType.includes('CSV') :
                            activeFilter === 'JSON' ? fType.includes('JSON') :
                            fType.includes('XLS');
        return matchesSearch && matchesType;
    });

    // Recent Activity - Expanded to 20 to test scrolling/expansion
    const recentFiles = files.slice(0, 20);

    // --- Variants ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
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
                        transition: all 0.3s ease;
                    }
                    .glass-card-hover {
                        background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
                        border: 1px solid rgba(255, 255, 255, 0.05);
                    }
                    .glass-card-hover:hover {
                        border-color: rgba(99, 102, 241, 0.4);
                        background: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
                    }
                    .upload-zone {
                        background: rgba(255, 255, 255, 0.02);
                        border: 2px dashed rgba(255, 255, 255, 0.1);
                        transition: all 0.3s ease;
                        position: relative;
                        overflow: hidden;
                    }
                    .upload-zone:hover {
                        background: rgba(99, 102, 241, 0.08);
                        border-color: rgba(99, 102, 241, 0.5);
                        box-shadow: inset 0 0 20px rgba(99, 102, 241, 0.1);
                    }
                    .filter-pill {
                        padding: 6px 16px;
                        border-radius: 50px;
                        font-size: 13px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.2s;
                        border: 1px solid transparent;
                    }
                    .filter-pill.active {
                        background: rgba(99, 102, 241, 0.2);
                        color: #818cf8;
                        border-color: rgba(99, 102, 241, 0.3);
                    }
                    .filter-pill:not(.active) {
                        color: #71717a;
                    }
                    .filter-pill:not(.active):hover {
                        background: rgba(255,255,255,0.05);
                        color: #e4e4e7;
                    }
                    .custom-scrollbar::-webkit-scrollbar { display: none; }
                `}
            </style>

            <motion.div 
                initial="hidden" animate="visible" variants={containerVariants}
                style={{ 
                    padding: '24px 32px', 
                    width: '100%', 
                    height: '100%', 
                    boxSizing: 'border-box', 
                    display: 'flex', 
                    flexDirection: 'column'
                }}
            >
                
                {/* --- 1. HEADER & UPLOAD SECTION --- */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h1 style={{ fontSize: '36px', fontWeight: '800', color: 'white', margin: 0, letterSpacing: '-0.5px' }}>
                                Data Catalog
                            </h1>
                            <p style={{ color: '#a1a1aa', fontSize: '14px', marginTop: '6px' }}>Manage and ingest your raw data sources.</p>
                        </div>
                        
                        {/* Search Bar */}
                        <div style={{ position: 'relative' }}>
                            <Search size={18} color="#71717a" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input 
                                type="text" 
                                placeholder="Search datasets..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ 
                                    background: 'rgba(24, 24, 27, 0.6)', border: '1px solid rgba(255,255,255,0.1)', 
                                    padding: '12px 20px 12px 46px', borderRadius: '50px', color: 'white', 
                                    outline: 'none', minWidth: '320px', fontSize: '14px', backdropFilter: 'blur(10px)'
                                }} 
                            />
                        </div>
                    </div>

                    {/* FULL WIDTH UPLOAD CARD */}
                    <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <UploadCloud size={20} color="#8b5cf6" /> Ingest Data
                        </h3>
                        
                        <label className="upload-zone" style={{ borderRadius: '16px', height: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <input type="file" ref={fileInputRef} onChange={handleUpload} style={{ display: 'none' }} />
                            {uploading ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
                                    <div style={{ width: '30px', height: '30px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#8b5cf6', borderRadius: '50%', margin: '0 auto 12px' }} className="spinner" />
                                    <p style={{ color: '#a1a1aa', fontSize: '13px' }}>Uploading...</p>
                                </motion.div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e4e4e7', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Plus size={24} />
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <p style={{ color: '#e4e4e7', fontWeight: '600', margin: '0 0 4px 0', fontSize: '15px' }}>Click to Upload File</p>
                                        <p style={{ color: '#71717a', fontSize: '12px', margin: 0 }}>Support: CSV, JSON, Excel</p>
                                    </div>
                                </div>
                            )}
                        </label>
                    </div>
                </div>

                {/* --- 2. MAIN SPLIT LAYOUT --- */}
                <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '32px', flex: 1, overflow: 'hidden' }}>
                    
                    {/* === LEFT: ACTIVITY FEED (EXPANDABLE) === */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', paddingRight: '4px' }} className="custom-scrollbar">
                        
                        <div className="glass-panel" style={{ 
                            padding: '24px', 
                            borderRadius: '24px', 
                            display: 'flex', 
                            flexDirection: 'column',
                            // FIX: Flex 'auto' allows growth, minHeight ensures it fills at least the sidebar
                            flex: '1 0 auto'
                        }}>
                            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Clock size={20} color="#f59e0b" /> Recent Uploads
                            </h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '12px' }}>
                                <AnimatePresence>
                                    {recentFiles.map((file, i) => (
                                        <motion.div 
                                            key={file.id} 
                                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                            style={{ display: 'flex', gap: '12px', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.03)' }}
                                        >
                                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa' }}>
                                                {file.type && file.type.includes('CSV') ? <Table size={16} /> : <FileText size={16} />}
                                            </div>
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <p style={{ color: '#e4e4e7', fontSize: '13px', fontWeight: '600', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</p>
                                                <p style={{ color: '#71717a', fontSize: '11px', margin: 0 }}>{file.date || 'Just now'}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {recentFiles.length === 0 && <p style={{ color: '#52525b', textAlign: 'center', fontSize: '13px', marginTop: '20px' }}>No recent activity.</p>}
                                </AnimatePresence>
                            </div>
                        </div>

                    </div>

                    {/* === RIGHT: EXPLORER ZONE === */}
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                        
                        {/* Filter Tabs */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <Filter size={18} color="#a1a1aa" />
                            <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                {['All', 'CSV', 'JSON', 'Excel'].map(filter => (
                                    <div 
                                        key={filter}
                                        className={`filter-pill ${activeFilter === filter ? 'active' : ''}`}
                                        onClick={() => setActiveFilter(filter)}
                                    >
                                        {filter}
                                    </div>
                                ))}
                            </div>
                            <div style={{ flex: 1, textAlign: 'right', fontSize: '12px', color: '#52525b' }}>
                                {filteredFiles.length} Results
                            </div>
                        </div>

                        {/* Grid with Animations */}
                        <div className="custom-scrollbar" style={{ overflowY: 'auto', flex: 1, paddingBottom: '40px' }}>
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
                                gap: '20px', 
                                padding: '20px' 
                            }}>
                                <AnimatePresence>
                                    {filteredFiles.map((file) => (
                                        <FileCard key={file.id} file={file} onDelete={handleDelete} />
                                    ))}
                                </AnimatePresence>
                            </div>

                            {filteredFiles.length === 0 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '24px', color: '#52525b' }}>
                                    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '50%', marginBottom: '16px' }}>
                                        <Search size={40} style={{ opacity: 0.3 }} />
                                    </div>
                                    <p>No matching files found.</p>
                                </motion.div>
                            )}
                        </div>
                    </div>

                </div>

                {/* --- TOAST --- */}
                <AnimatePresence>
                    {toast && <Toast toast={toast} />}
                </AnimatePresence>

            </motion.div>
        </AppLayout>
    );
};

// --- SUB-COMPONENTS ---

const FileCard = ({ file, onDelete }) => {
    let Icon = FileText;
    let color = '#a1a1aa';
    let bg = 'rgba(255,255,255,0.1)';

    const fType = file.type || '';

    if (fType.includes('CSV')) { Icon = Table; color = '#f59e0b'; bg = 'rgba(245, 158, 11, 0.15)'; }
    else if (fType.includes('JSON')) { Icon = FileJson; color = '#3b82f6'; bg = 'rgba(59, 130, 246, 0.15)'; }
    else if (fType.includes('XLS')) { Icon = Table; color = '#10b981'; bg = 'rgba(16, 185, 129, 0.15)'; }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ y: -5, scale: 1.02 }} 
            transition={{ duration: 0.2 }}
            className="glass-card-hover"
            style={{ borderRadius: '20px', padding: '20px', position: 'relative', display: 'flex', flexDirection: 'column', height: '180px', justifyContent: 'space-between', cursor: 'default' }}
        >
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
                        <Icon size={20} />
                    </div>
                    <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', color: '#a1a1aa', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }}>
                        {file.type || 'FILE'}
                    </span>
                </div>
                
                <h4 style={{ color: 'white', fontSize: '15px', fontWeight: '700', margin: '0 0 6px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={file.name}>
                    {file.name || 'Untitled'}
                </h4>
                <p style={{ fontSize: '12px', color: '#a1a1aa', margin: 0 }}>
                    {file.size || 'Unknown'} • {file.date || 'Unknown'}
                </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', gap: '8px' }}>
                <button 
                    style={{ background: 'transparent', border: 'none', color: '#52525b', cursor: 'pointer', padding: '6px', borderRadius: '8px', transition: 'all 0.2s' }}
                    onClick={() => { /* Add preview logic if needed */ }}
                >
                    <ArrowUpRight size={16} />
                </button>
                <button 
                    onClick={() => onDelete(file.id)}
                    style={{ background: 'transparent', border: 'none', color: '#52525b', cursor: 'pointer', padding: '6px', borderRadius: '8px', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.target.style.color = '#ef4444'; e.target.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                    onMouseLeave={(e) => { e.target.style.color = '#52525b'; e.target.style.background = 'transparent'; }}
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </motion.div>
    );
};

const Toast = ({ toast }) => (
    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', background: toast.type==='error'?'#ef4444':'#10b981', color: 'white', padding: '12px 24px', borderRadius: '50px', zIndex: 9999, display: 'flex', gap: '10px', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
        {toast.type==='error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />} {toast.message}
    </motion.div>
);

export default DataSources;
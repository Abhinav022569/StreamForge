import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Edit2, Trash2, Clock, AlertTriangle, Search, Plus, 
    Zap, Workflow, Activity 
} from 'lucide-react';
import AppLayout from './layout/AppLayout';
import '../App.css';

const AllPipelines = () => {
    const navigate = useNavigate();
    const [pipelines, setPipelines] = useState([]);
    const [filteredPipelines, setFilteredPipelines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // --- State for Custom Delete Modal ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [pipelineToDelete, setPipelineToDelete] = useState(null);

    useEffect(() => {
        const fetchPipelines = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get('http://127.0.0.1:5000/pipelines', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPipelines(res.data);
                setFilteredPipelines(res.data);
            } catch (err) {
                console.error("Error fetching pipelines:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPipelines();
    }, []);

    // Handle Search
    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = pipelines.filter(p => 
            p.name.toLowerCase().includes(lowerTerm) || 
            p.status.toLowerCase().includes(lowerTerm)
        );
        setFilteredPipelines(filtered);
    }, [searchTerm, pipelines]);

    const openDeleteModal = (id) => {
        setPipelineToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!pipelineToDelete) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://127.0.0.1:5000/pipelines/${pipelineToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const updated = pipelines.filter(p => p.id !== pipelineToDelete);
            setPipelines(updated);
            setFilteredPipelines(updated.filter(p => 
                p.name.toLowerCase().includes(searchTerm.toLowerCase())
            ));
            setIsDeleteModalOpen(false);
            setPipelineToDelete(null);
        } catch (err) {
            alert("Failed to delete pipeline");
        }
    };

    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
        setPipelineToDelete(null);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1, 
            transition: { staggerChildren: 0.08 } 
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
        hover: { 
            y: -5, 
            scale: 1.01,
            boxShadow: "0 10px 30px -10px rgba(99, 102, 241, 0.2)",
            borderColor: "rgba(99, 102, 241, 0.4)"
        }
    };

    return (
        <AppLayout>
            <div style={{ padding: '32px 48px', maxWidth: '1800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
                
                {/* --- 1. HEADER SECTION --- */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <h1 style={{ fontSize: '36px', fontWeight: '800', color: 'white', margin: 0, letterSpacing: '-0.5px' }}>
                                Pipeline Registry
                            </h1>
                            <span style={{ fontSize: '12px', padding: '4px 10px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.2)', fontWeight: '600' }}>
                                {pipelines.length} Total
                            </span>
                        </div>
                        <p style={{ color: '#a1a1aa', fontSize: '15px', maxWidth: '600px', lineHeight: '1.5' }}>
                            Manage your data workflows. You have <span style={{ color: '#e4e4e7', fontWeight: '600' }}>{pipelines.filter(p => p.status === 'Active').length} active pipelines</span> running.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        {/* Search Input */}
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                            <input 
                                type="text" 
                                placeholder="Search workflows..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    background: 'rgba(24, 24, 27, 0.6)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '16px',
                                    padding: '12px 16px 12px 44px',
                                    color: 'white',
                                    width: '260px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.05)'}
                            />
                        </div>

                        {/* Create Button */}
                        <motion.button 
                            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/builder')}
                            style={{ 
                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', 
                                padding: '12px 24px', borderRadius: '16px', fontWeight: '600', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)'
                            }}
                        >
                            <Plus size={20} strokeWidth={2.5} /> New Pipeline
                        </motion.button>
                    </div>
                </div>

                {/* --- 2. GRID CONTENT --- */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px', color: '#71717a' }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                            <Zap size={32} />
                        </motion.div>
                    </div>
                ) : filteredPipelines.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ 
                            textAlign: 'center', 
                            padding: '80px', 
                            background: 'rgba(24, 24, 27, 0.4)', 
                            borderRadius: '24px', 
                            border: '1px dashed rgba(255,255,255,0.1)' 
                        }}
                    >
                        <div style={{ background: 'rgba(39, 39, 42, 0.5)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <Workflow size={32} color="#71717a" />
                        </div>
                        <h3 style={{ color: 'white', fontSize: '20px', marginBottom: '10px' }}>No pipelines found</h3>
                        <p style={{ color: '#a1a1aa', maxWidth: '400px', margin: '0 auto 24px', fontSize: '15px' }}>
                            {searchTerm ? `No results matching "${searchTerm}"` : "Get started by creating your first visual data pipeline."}
                        </p>
                        {!searchTerm && (
                            <button className="btn btn-primary" onClick={() => navigate('/builder')}>
                                Create Pipeline
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}
                    >
                        <AnimatePresence mode='popLayout'>
                            {filteredPipelines.map((p) => (
                                <motion.div 
                                    key={p.id}
                                    layout
                                    variants={cardVariants}
                                    whileHover="hover"
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    onClick={() => navigate(`/builder/${p.id}`)} // <--- Main card click handler
                                    style={{ 
                                        background: 'rgba(24, 24, 27, 0.6)', 
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                        borderRadius: '24px',
                                        padding: '24px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        cursor: 'pointer', // <--- Changed to pointer
                                        position: 'relative',
                                        overflow: 'hidden',
                                        height: '100%',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    {/* Top Status Strip */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                        <div style={{ 
                                            width: '48px', height: '48px', borderRadius: '14px', 
                                            background: p.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(113, 113, 122, 0.1)',
                                            color: p.status === 'Active' ? '#10b981' : '#71717a',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: p.status === 'Active' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(113, 113, 122, 0.2)'
                                        }}>
                                            <Workflow size={24} />
                                        </div>

                                        {p.status === 'Active' ? (
                                            <span style={{ 
                                                fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px',
                                                padding: '6px 12px', borderRadius: '20px',
                                                background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
                                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                                display: 'flex', alignItems: 'center', gap: '6px'
                                            }}>
                                                <Activity size={12} className="spin" /> Running
                                            </span>
                                        ) : (
                                            <span style={{ 
                                                fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px',
                                                padding: '6px 12px', borderRadius: '20px',
                                                background: 'rgba(255,255,255,0.05)', color: '#71717a',
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                Stopped
                                            </span>
                                        )}
                                    </div>
                                    
                                    <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#fff', fontWeight: '700', letterSpacing: '-0.3px' }}>{p.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>
                                        <Clock size={13} color="#71717a" />
                                        <span style={{ fontSize: '13px', color: '#71717a' }}>Created {p.created_at || 'Recently'}</span>
                                    </div>

                                    <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '20px' }} />

                                    {/* Action Footer */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px' }}>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); navigate(`/builder/${p.id}`); }}
                                            style={{ 
                                                padding: '10px', borderRadius: '12px', 
                                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', 
                                                color: '#e4e4e7', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                        >
                                            <Edit2 size={14} /> Edit
                                        </button>

                                        <button 
                                            onClick={(e) => { e.stopPropagation(); navigate(`/pipelines/${p.id}/history`); }} // <--- Stop propagation
                                            style={{ 
                                                padding: '10px', borderRadius: '12px', 
                                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', 
                                                color: '#e4e4e7', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                        >
                                            <Clock size={14} /> History
                                        </button>
                                        
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); openDeleteModal(p.id); }} // <--- Stop propagation
                                            style={{ 
                                                padding: '10px', borderRadius: '12px', 
                                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', 
                                                color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* --- Custom Delete Confirmation Modal --- */}
                <AnimatePresence>
                    {isDeleteModalOpen && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{ position: 'absolute', width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
                                onClick={cancelDelete}
                            />
                            
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                style={{
                                    zIndex: 1001,
                                    backgroundColor: '#18181b',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '24px',
                                    padding: '32px',
                                    width: '420px',
                                    maxWidth: '90%',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                    <div style={{ padding: '16px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', marginBottom: '20px', color: '#ef4444' }}>
                                        <AlertTriangle size={32} />
                                    </div>
                                    <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: 'white', fontWeight: '700' }}>Delete Pipeline?</h3>
                                    
                                    <p style={{ color: '#a1a1aa', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' }}>
                                        Are you sure you want to delete this pipeline? This action cannot be undone.
                                    </p>

                                    <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                                        <button 
                                            onClick={cancelDelete}
                                            style={{
                                                flex: 1,
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                background: 'transparent',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontWeight: '600'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={confirmDelete}
                                            style={{
                                                flex: 1,
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: 'none',
                                                background: '#ef4444',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </AppLayout>
    );
};

export default AllPipelines;
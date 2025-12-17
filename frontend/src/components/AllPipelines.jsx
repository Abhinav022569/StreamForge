import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Edit2, Play, Trash2, Clock, Share2, MoreVertical } from 'lucide-react';
import AppLayout from './layout/AppLayout';
import '../App.css';

const AllPipelines = () => {
    const navigate = useNavigate();
    const [pipelines, setPipelines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPipelines = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get('http://127.0.0.1:5000/pipelines', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPipelines(res.data);
            } catch (err) {
                console.error("Error fetching pipelines:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPipelines();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this pipeline?")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://127.0.0.1:5000/pipelines/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPipelines(pipelines.filter(p => p.id !== id));
        } catch (err) {
            alert("Failed to delete pipeline");
        }
    };

    return (
        <AppLayout>
            <div className="content-wrapper" style={{ padding: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '32px', color: '#fff', margin: 0 }}>All Pipelines</h1>
                    <button 
                        className="btn btn-success"
                        onClick={() => navigate('/builder')}
                    >
                        + New Pipeline
                    </button>
                </div>

                {loading ? (
                    <div className="text-muted">Loading pipelines...</div>
                ) : pipelines.length === 0 ? (
                    <div className="text-muted">No pipelines found. Create one to get started.</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {pipelines.map((p, i) => (
                            <motion.div 
                                key={p.id}
                                className="card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                style={{ 
                                    background: 'rgba(24, 24, 27, 0.6)', 
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    padding: '20px',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                    <h3 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>{p.name}</h3>
                                    <span className={`status-badge`} style={{
                                        fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                                        background: p.status === 'Active' ? 'rgba(16,185,129,0.2)' : 'rgba(113,113,122,0.2)',
                                        color: p.status === 'Active' ? '#10b981' : '#a1a1aa'
                                    }}>
                                        {p.status}
                                    </span>
                                </div>
                                
                                <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '20px', flex: 1 }}>
                                    Created on {p.created_at}
                                </p>

                                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                                    <button 
                                        onClick={() => navigate(`/builder/${p.id}`)}
                                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}
                                    >
                                        <Edit2 size={14} /> Edit
                                    </button>
                                    
                                    <button 
                                        onClick={() => navigate(`/pipelines/${p.id}/history`)}
                                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#a1a1aa', cursor: 'pointer' }}
                                        title="View History"
                                    >
                                        <Clock size={16} />
                                    </button>
                                    
                                    <button 
                                        onClick={() => handleDelete(p.id)}
                                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer' }}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default AllPipelines;
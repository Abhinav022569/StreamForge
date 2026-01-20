import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Clock, CheckCircle, XCircle, ArrowLeft, 
    Terminal, Calendar, Timer, ChevronDown, ChevronUp,
    Activity
} from 'lucide-react';
import AppLayout from './layout/AppLayout';
import '../App.css';

const PipelineHistory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedRun, setExpandedRun] = useState(null);
    const [pipelineName, setPipelineName] = useState('Pipeline');

    useEffect(() => {
        const fetchHistory = async () => {
            const token = localStorage.getItem('token');
            try {
                // Fetch pipeline details for the name
                const pRes = await axios.get(`http://127.0.0.1:5000/pipelines/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPipelineName(pRes.data.name);

                // Fetch history
                const hRes = await axios.get(`http://127.0.0.1:5000/pipelines/${id}/history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistory(hRes.data);
            } catch (err) {
                console.error("Error fetching history:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [id]);

    const toggleExpand = (runId) => {
        setExpandedRun(expandedRun === runId ? null : runId);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return '#10b981'; // Emerald
            case 'failed': return '#ef4444';    // Red
            case 'running': return '#3b82f6';   // Blue
            default: return '#71717a';          // Zinc
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return <CheckCircle size={18} />;
            case 'failed': return <XCircle size={18} />;
            case 'running': return <Activity size={18} className="spin" />;
            default: return <Clock size={18} />;
        }
    };

    // Helper to safely format time without crashing
    const safeTime = (dateStr) => {
        try {
            if (!dateStr) return '--:--:--';
            return new Date(dateStr).toLocaleTimeString();
        } catch (e) {
            return '--:--:--';
        }
    };

    return (
        <AppLayout>
            <div style={{ padding: '32px 48px', maxWidth: '1200px', margin: '0 auto' }}>
                
                {/* --- HEADER --- */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button 
                            onClick={() => navigate('/pipelines')}
                            style={{ 
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', 
                                borderRadius: '12px', padding: '10px', color: '#e4e4e7', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'white', margin: 0, letterSpacing: '-0.5px' }}>
                                Execution History
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                                <span style={{ color: '#a1a1aa', fontSize: '14px' }}>Timeline for</span>
                                <span style={{ color: '#6366f1', fontWeight: '600', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '6px', fontSize: '13px' }}>
                                    {pipelineName}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                            onClick={() => navigate(`/builder/${id}`)}
                            className="btn btn-secondary"
                            style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '14px' }}
                        >
                            <Terminal size={16} /> Edit Pipeline
                        </button>
                    </div>
                </div>

                {/* --- TIMELINE CONTENT --- */}
                <div style={{ position: 'relative', paddingLeft: '20px' }}>
                    
                    {/* Continuous Vertical Line */}
                    <div style={{ position: 'absolute', left: '43px', top: '20px', bottom: '20px', width: '2px', background: 'rgba(255,255,255,0.05)', zIndex: 0 }} />

                    {loading ? (
                        <div style={{ color: '#71717a', paddingLeft: '40px' }}>Loading history...</div>
                    ) : history.length === 0 ? (
                        <div style={{ padding: '60px', background: 'rgba(24,24,27,0.4)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center', marginLeft: '30px' }}>
                            <Clock size={40} color="#52525b" style={{ marginBottom: '16px' }} />
                            <h3 style={{ color: 'white', margin: '0 0 8px 0' }}>No executions yet</h3>
                            <p style={{ color: '#a1a1aa' }}>Run your pipeline to see the history logs here.</p>
                        </div>
                    ) : (
                        history.map((run, index) => {
                            const color = getStatusColor(run.status);
                            const isExpanded = expandedRun === run.id;

                            return (
                                <motion.div 
                                    key={run.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    style={{ marginBottom: '24px', position: 'relative', zIndex: 1 }}
                                >
                                    <div 
                                        onClick={() => toggleExpand(run.id)}
                                        style={{ 
                                            display: 'flex', alignItems: 'center', gap: '24px', 
                                            cursor: 'pointer', padding: '8px 0'
                                        }}
                                    >
                                        {/* Status Dot */}
                                        <div style={{ 
                                            width: '48px', height: '48px', borderRadius: '50%', 
                                            background: '#18181b', border: `2px solid ${color}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: `0 0 15px ${color}40`, zIndex: 2, flexShrink: 0
                                        }}>
                                            <div style={{ color: color }}>{getStatusIcon(run.status)}</div>
                                        </div>

                                        {/* Card Summary */}
                                        <div style={{ 
                                            flex: 1, background: 'rgba(24, 24, 27, 0.6)', 
                                            backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)',
                                            borderRadius: '16px', padding: '20px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            transition: 'all 0.2s'
                                        }}
                                        className="hover-card-bg"
                                        >
                                            <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontSize: '12px', color: '#71717a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Calendar size={12} /> Date
                                                    </div>
                                                    <div style={{ color: '#e4e4e7', fontWeight: '500' }}>
                                                        {new Date(run.start_time).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '12px', color: '#71717a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Timer size={12} /> Time
                                                    </div>
                                                    <div style={{ color: '#e4e4e7', fontWeight: '500' }}>
                                                        {safeTime(run.start_time)}
                                                    </div>
                                                </div>
                                                {run.duration && (
                                                    <div>
                                                        <div style={{ fontSize: '12px', color: '#71717a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Activity size={12} /> Duration
                                                        </div>
                                                        <div style={{ color: '#e4e4e7', fontWeight: '500' }}>
                                                            {run.duration}s
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <span style={{ 
                                                    padding: '6px 12px', borderRadius: '20px', 
                                                    background: `${color}15`, color: color,
                                                    border: `1px solid ${color}30`, fontSize: '12px', fontWeight: '700',
                                                    textTransform: 'uppercase', letterSpacing: '0.5px'
                                                }}>
                                                    {run.status}
                                                </span>
                                                {isExpanded ? <ChevronUp size={18} color="#71717a" /> : <ChevronDown size={18} color="#71717a" />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                style={{ overflow: 'hidden', marginLeft: '72px' }}
                                            >
                                                <div style={{ 
                                                    marginTop: '12px', background: '#09090b', 
                                                    border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px',
                                                    padding: '20px'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                        <h4 style={{ margin: 0, color: '#e4e4e7', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <Terminal size={14} color="#a1a1aa" /> Execution Logs
                                                        </h4>
                                                    </div>
                                                    
                                                    <div style={{ 
                                                        fontFamily: 'monospace', fontSize: '13px', color: '#a1a1aa', 
                                                        lineHeight: '1.6', background: 'rgba(255,255,255,0.02)', 
                                                        padding: '16px', borderRadius: '8px', maxHeight: '300px', overflowY: 'auto'
                                                    }}>
                                                        {run.logs && typeof run.logs === 'string' ? (
                                                            run.logs.split('\n').map((line, i) => (
                                                                <div key={i} style={{ marginBottom: '4px' }}>
                                                                    <span style={{ color: '#52525b', marginRight: '8px' }}>
                                                                        {safeTime(run.start_time)}
                                                                    </span>
                                                                    {line}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <>
                                                                {/* Mock / Fallback logs */}
                                                                <div><span style={{color: '#10b981'}}>[INFO]</span> Pipeline initialized successfully.</div>
                                                                <div><span style={{color: '#10b981'}}>[INFO]</span> Loading source data...</div>
                                                                {run.status === 'Failed' ? (
                                                                    <div><span style={{color: '#ef4444'}}>[ERROR]</span> Process terminated unexpectedly.</div>
                                                                ) : (
                                                                    <div><span style={{color: '#10b981'}}>[SUCCESS]</span> Process completed.</div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default PipelineHistory;
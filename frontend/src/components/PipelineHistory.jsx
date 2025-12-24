import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Terminal, ArrowLeft, Loader } from 'lucide-react';
import AppLayout from './layout/AppLayout';
import '../App.css';

const PipelineHistory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [runs, setRuns] = useState([]);
    const [pipelineName, setPipelineName] = useState('Pipeline');
    const [loading, setLoading] = useState(true);
    const [selectedRun, setSelectedRun] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            const token = localStorage.getItem('token');
            try {
                // Fetch Pipeline Details for Name
                const pipeRes = await axios.get(`http://192.168.1.12:5000/pipelines/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPipelineName(pipeRes.data.name);

                // Fetch History
                const historyRes = await axios.get(`http://192.168.1.12:5000/pipelines/${id}/history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRuns(historyRes.data);
            } catch (err) {
                console.error("Error fetching history:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchHistory();
    }, [id]);

    return (
        <AppLayout>
            <div className="content-wrapper" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                    <button 
                        onClick={() => navigate('/pipelines')}
                        style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 style={{ fontSize: '28px', margin: 0, color: '#fff' }}>
                        <span style={{ color: '#a1a1aa' }}>History:</span> {pipelineName}
                    </h1>
                </div>

                <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                    {/* LEFT COLUMN: RUN LIST */}
                    <motion.div 
                        className="card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ 
                            flex: 1, 
                            background: 'rgba(24, 24, 27, 0.6)', 
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            padding: '0'
                        }}
                    >
                        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', color: '#e4e4e7' }}>Execution Log</h3>
                        </div>
                        
                        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                            {loading ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#a1a1aa' }}>
                                    <Loader className="animate-spin" style={{ margin: '0 auto 10px' }} />
                                    Loading history...
                                </div>
                            ) : runs.length === 0 ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#a1a1aa' }}>
                                    No runs recorded yet.
                                </div>
                            ) : (
                                <table className="data-table" style={{ width: '100%' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: '#18181b', zIndex: 1 }}>
                                        <tr>
                                            <th style={{ padding: '15px 20px', textAlign: 'left', color: '#71717a', fontSize: '12px' }}>STATUS</th>
                                            <th style={{ padding: '15px 20px', textAlign: 'left', color: '#71717a', fontSize: '12px' }}>DATE</th>
                                            <th style={{ padding: '15px 20px', textAlign: 'left', color: '#71717a', fontSize: '12px' }}>DURATION</th>
                                            <th style={{ padding: '15px 20px', textAlign: 'right', color: '#71717a', fontSize: '12px' }}>ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {runs.map((run) => (
                                            <tr 
                                                key={run.id} 
                                                style={{ 
                                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                    background: selectedRun?.id === run.id ? 'rgba(255,255,255,0.03)' : 'transparent'
                                                }}
                                            >
                                                <td style={{ padding: '15px 20px' }}>
                                                    {run.status === 'Success' ? (
                                                        <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600' }}>
                                                            <CheckCircle size={14} /> Success
                                                        </span>
                                                    ) : run.status === 'Failed' ? (
                                                        <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600' }}>
                                                            <XCircle size={14} /> Failed
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: '#eab308', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600' }}>
                                                            <Loader size={14} className="animate-spin" /> Running
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '15px 20px', color: '#d4d4d8', fontSize: '13px' }}>
                                                    {run.start_time}
                                                </td>
                                                <td style={{ padding: '15px 20px', color: '#a1a1aa', fontSize: '13px' }}>
                                                    <Clock size={12} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                                                    {run.duration}
                                                </td>
                                                <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                                                    <button 
                                                        className="btn btn-ghost"
                                                        onClick={() => setSelectedRun(run)}
                                                        style={{ 
                                                            fontSize: '12px', 
                                                            padding: '6px 12px', 
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            color: selectedRun?.id === run.id ? '#fff' : '#a1a1aa',
                                                            background: selectedRun?.id === run.id ? '#3b82f6' : 'transparent'
                                                        }}
                                                    >
                                                        View Logs
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </motion.div>

                    {/* RIGHT COLUMN: LOG DETAILS */}
                    <AnimatePresence>
                        {selectedRun && (
                            <motion.div 
                                className="card"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                style={{ 
                                    flex: 1, 
                                    background: '#09090b', 
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    padding: '0',
                                    height: '600px',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <div style={{ 
                                    padding: '15px 20px', 
                                    borderBottom: '1px solid #27272a',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    background: '#18181b'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Terminal size={18} color="#a1a1aa" />
                                        <span style={{ color: '#e4e4e7', fontSize: '14px', fontFamily: 'monospace' }}>
                                            Run #{selectedRun.id} Logs
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedRun(null)}
                                        style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer' }}
                                    >
                                        <XCircle size={18} />
                                    </button>
                                </div>

                                <div style={{ 
                                    padding: '20px', 
                                    overflowY: 'auto', 
                                    flex: 1,
                                    fontFamily: 'monospace',
                                    fontSize: '13px',
                                    lineHeight: '1.6',
                                    color: '#d4d4d8'
                                }}>
                                    {selectedRun.logs.map((log, i) => (
                                        <div key={i} style={{ marginBottom: '8px', display: 'flex', gap: '10px' }}>
                                            <span style={{ color: '#52525b', userSelect: 'none' }}>{i + 1}</span>
                                            <span>
                                                {log.startsWith('Error') || log.includes('failed') ? (
                                                    <span style={{ color: '#f87171' }}>{log}</span>
                                                ) : log.includes('Saved') || log.includes('Success') ? (
                                                    <span style={{ color: '#34d399' }}>{log}</span>
                                                ) : (
                                                    log
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </AppLayout>
    );
};

export default PipelineHistory;
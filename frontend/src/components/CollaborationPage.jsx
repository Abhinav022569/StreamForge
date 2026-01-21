import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Share2, Users, Shield, Trash2, Search, 
    CheckCircle, X, AlertTriangle, Inbox, ExternalLink, Mail, Layers, 
    Activity, Lock, ArrowRight, Zap, Globe, LayoutGrid
} from 'lucide-react';
import AppLayout from './layout/AppLayout';
import '../App.css';

const CollaborationPage = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ shared_with_me: 0, my_shared_pipelines: 0, team_members: 0 });
    const [sharedWithMe, setSharedWithMe] = useState([]);
    const [sharedByMe, setSharedByMe] = useState([]);
    const [myPipelines, setMyPipelines] = useState([]); 
    
    // Modals & Notifications
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareForm, setShareForm] = useState({ pipelineId: '', email: '', role: 'viewer' });
    const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
    const [selectedRevoke, setSelectedRevoke] = useState(null); 
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const [statsRes, withMeRes, byMeRes, pipesRes] = await Promise.all([
                axios.get('http://127.0.0.1:5000/collaboration/stats', { headers }),
                axios.get('http://127.0.0.1:5000/collaboration/shared-with-me', { headers }), 
                axios.get('http://127.0.0.1:5000/collaboration/shared-by-me', { headers }),   
                axios.get('http://127.0.0.1:5000/pipelines', { headers })
            ]);

            setStats(statsRes.data);
            setSharedWithMe(withMeRes.data);
            setSharedByMe(byMeRes.data);
            setMyPipelines(pipesRes.data.filter(p => !p.is_shared)); 
        } catch (err) {
            console.error("Error loading data:", err);
            showToast('Failed to sync collaboration data', 'error');
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleShare = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post('http://127.0.0.1:5000/pipelines/share', {
                pipeline_id: shareForm.pipelineId,
                email: shareForm.email,
                role: shareForm.role
            }, { headers: { Authorization: `Bearer ${token}` } });
            showToast('Pipeline shared successfully');
            setIsShareModalOpen(false);
            setShareForm({ pipelineId: '', email: '', role: 'viewer' });
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.error || 'Share failed', 'error');
        }
    };

    const openRevokeModal = (shareId, username, type) => {
        setSelectedRevoke({ shareId, username, type });
        setIsRevokeModalOpen(true);
    };

    const confirmRevoke = async () => {
        if (!selectedRevoke) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://127.0.0.1:5000/pipelines/share/${selectedRevoke.shareId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast(selectedRevoke.type === 'leave' ? 'Left shared pipeline' : 'Access revoked');
            setIsRevokeModalOpen(false);
            setSelectedRevoke(null);
            fetchData();
        } catch (err) {
            showToast('Failed to perform action', 'error');
        }
    };

    // --- ANIMATIONS ---
    const pageTransition = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const slideInLeft = {
        hidden: { x: -20, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
    };

    const fadeInUp = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 20 } }
    };

    return (
        <AppLayout>
            <style>
                {`
                    .glass-panel-dark {
                        background: rgba(18, 18, 21, 0.6);
                        backdrop-filter: blur(20px);
                        border: 1px solid rgba(255, 255, 255, 0.08);
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                    }
                    .glass-card-light {
                        background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
                        border: 1px solid rgba(255, 255, 255, 0.05);
                    }
                    .custom-scrollbar::-webkit-scrollbar { display: none; }
                    .role-badge-editor {
                        background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3);
                    }
                    .role-badge-viewer {
                        background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3);
                    }
                `}
            </style>

            <motion.div 
                initial="hidden" 
                animate="visible" 
                variants={pageTransition}
                style={{ 
                    padding: '24px 40px', 
                    width: '100%', 
                    height: '100%', 
                    boxSizing: 'border-box', 
                    display: 'flex', 
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                
                {/* --- 1. HEADER --- */}
                <motion.div variants={slideInLeft} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                <Globe size={28} color="white" />
                            </div>
                            <div>
                                <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'white', margin: 0, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                                    Network
                                </h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                                    <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }}></span>
                                    <span style={{ fontSize: '13px', color: '#a1a1aa', fontWeight: '500' }}>Collaboration Hub Active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsShareModalOpen(true)}
                        style={{ 
                            background: 'white', color: 'black', border: 'none', 
                            padding: '14px 28px', borderRadius: '50px', fontWeight: '700', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 0 25px rgba(255,255,255,0.15)',
                            fontSize: '14px'
                        }}
                    >
                        <Share2 size={18} /> Share Pipeline
                    </motion.button>
                </motion.div>

                {/* --- 2. SPLIT LAYOUT --- */}
                <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '40px', flex: 1, overflow: 'hidden' }}>
                    
                    {/* === LEFT COLUMN: MANAGEMENT === */}
                    <motion.div variants={slideInLeft} style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', paddingRight: '4px' }} className="custom-scrollbar">
                        
                        {/* Stats */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <StatBox label="Active Collaborators" value={stats.team_members} icon={<Users size={20} />} color="#f59e0b" />
                            <StatBox label="Incoming Projects" value={stats.shared_with_me} icon={<Inbox size={20} />} color="#3b82f6" />
                            <StatBox label="Outgoing Shares" value={stats.my_shared_pipelines} icon={<Share2 size={20} />} color="#8b5cf6" />
                        </div>

                        {/* Outgoing List */}
                        <div className="glass-panel-dark" style={{ borderRadius: '24px', padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Shield size={18} color="#a1a1aa" />
                                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'white', margin: 0 }}>Outgoing Access</h3>
                                </div>
                                <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px', color: '#71717a' }}>
                                    {sharedByMe.length} Items
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {sharedByMe.length === 0 ? (
                                    <div style={{ padding: '40px 0', textAlign: 'center', color: '#52525b', fontSize: '13px', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                        No active shares.
                                    </div>
                                ) : (
                                    sharedByMe.map((p, i) => (
                                        <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <span style={{ fontWeight: '600', color: 'white', fontSize: '14px' }}>{p.name}</span>
                                                <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', color: '#d4d4d8', padding: '2px 6px', borderRadius: '4px' }}>{p.user_count} Users</span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {p.shared_users.map(u => (
                                                    <div key={u.share_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3f3f46', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e4e4e7', border: '1px solid #52525b' }}>
                                                                {u.username ? u.username[0].toUpperCase() : '?'}
                                                            </div>
                                                            <span style={{ fontSize: '13px', color: '#a1a1aa' }}>{u.username || 'Unknown'}</span>
                                                        </div>
                                                        <Trash2 
                                                            size={14} 
                                                            style={{ cursor: 'pointer', color: '#52525b', transition: 'color 0.2s' }} 
                                                            onClick={() => openRevokeModal(u.share_id, u.username, 'revoke')}
                                                            onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                                                            onMouseLeave={(e) => e.target.style.color = '#52525b'}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* === RIGHT COLUMN: WORKSPACE === */}
                    <motion.div variants={fadeInUp} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <LayoutGrid size={22} color="#3b82f6" /> Shared With Me
                            </h3>
                            <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.1)', marginLeft: '24px' }}></div>
                        </div>

                        {/* ADDED PADDING TO CONTAINER HERE */}
                        <div className="custom-scrollbar" style={{ overflowY: 'auto', flex: 1, paddingBottom: '40px' }}>
                            {sharedWithMe.length === 0 ? (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '24px', color: '#52525b', minHeight: '400px' }}>
                                    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '50%', marginBottom: '16px' }}>
                                        <Inbox size={48} style={{ opacity: 0.3 }} />
                                    </div>
                                    <p style={{ fontSize: '16px', fontWeight: '500' }}>Your inbox is empty.</p>
                                    <p style={{ fontSize: '13px', opacity: 0.6 }}>Pipelines shared with you will appear here.</p>
                                </div>
                            ) : (
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                                    gap: '24px', 
                                    padding: '12px' // <--- ADDED PADDING TO FIX CLIPPING
                                }}>
                                    {sharedWithMe.map((item, i) => (
                                        <ProjectCard 
                                            key={i} 
                                            item={item} 
                                            openRevokeModal={openRevokeModal} 
                                            navigate={navigate}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>

                </div>

                {/* --- MODALS --- */}
                <AnimatePresence>
                    {toast && <Toast toast={toast} />}
                    {isShareModalOpen && <ShareModal close={() => setIsShareModalOpen(false)} myPipelines={myPipelines} shareForm={shareForm} setShareForm={setShareForm} handleShare={handleShare} />}
                    {isRevokeModalOpen && <RevokeModal close={() => setIsRevokeModalOpen(false)} selectedRevoke={selectedRevoke} confirmRevoke={confirmRevoke} />}
                </AnimatePresence>

            </motion.div>
        </AppLayout>
    );
};

// --- SUB-COMPONENTS ---

const StatBox = ({ label, value, icon, color }) => (
    <div style={{ background: 'rgba(24, 24, 27, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ background: `${color}15`, padding: '12px', borderRadius: '14px', color: color }}>{icon}</div>
        <div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'white', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '12px', color: '#a1a1aa', fontWeight: '600', textTransform: 'uppercase', marginTop: '6px', letterSpacing: '0.5px' }}>{label}</div>
        </div>
    </div>
);

const ProjectCard = ({ item, openRevokeModal, navigate }) => {
    const ownerName = item.owner_name || item.owner || 'Unknown';
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ 
                scale: 1.02,
                boxShadow: '0 20px 40px -12px rgba(0,0,0,0.6)',
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderColor: 'rgba(255,255,255,0.1)'
            }}
            transition={{ duration: 0.2 }}
            className="glass-card-light"
            style={{ borderRadius: '24px', padding: '28px', position: 'relative', display: 'flex', flexDirection: 'column', height: '240px', justifyContent: 'space-between', cursor: 'default' }}
        >
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: '#e4e4e7', border: '1px solid rgba(255,255,255,0.1)' }}>
                            {ownerName[0].toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', color: '#e4e4e7', fontWeight: '600' }}>{ownerName}</div>
                            <div style={{ fontSize: '11px', color: '#71717a' }}>Owner</div>
                        </div>
                    </div>
                    <span className={item.role === 'editor' ? 'role-badge-editor' : 'role-badge-viewer'} style={{ fontSize: '11px', fontWeight: '700', padding: '6px 10px', borderRadius: '8px', textTransform: 'uppercase' }}>
                        {item.role}
                    </span>
                </div>
                
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                    {item.name.replace(' (Shared)', '')}
                </h3>
                <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#a1a1aa' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Activity size={12} color="#10b981" /> Active</span>
                    <span style={{ opacity: 0.3 }}>|</span>
                    <span>Updated {item.updated_at.split(' ')[0]}</span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button 
                    onClick={() => navigate(`/builder/${item.id || item.pipeline_id}`)}
                    style={{ width: '100%', padding: '12px', borderRadius: '14px', background: 'white', color: 'black', border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(255,255,255,0.1)' }}
                >
                    Open Canvas <ArrowRight size={16} />
                </button>
                <button 
                    onClick={() => openRevokeModal(item.share_id, item.name, 'leave')}
                    style={{ padding: '12px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                    title="Leave Project"
                >
                    <X size={20} />
                </button>
            </div>
        </motion.div>
    );
}

const Toast = ({ toast }) => (
    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', background: toast.type==='error'?'#ef4444':'#10b981', color: 'white', padding: '12px 24px', borderRadius: '50px', zIndex: 9999, display: 'flex', gap: '10px', alignItems: 'center' }}>
        {toast.type==='error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />} {toast.message}
    </motion.div>
);

const ShareModal = ({ close, myPipelines, shareForm, setShareForm, handleShare }) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={close}>
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()} style={{ width: '420px', background: '#18181b', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
            <h2 style={{ color: 'white', margin: '0 0 24px 0', fontSize: '22px' }}>Share Pipeline</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <label style={{ display: 'block', color: '#a1a1aa', fontSize: '13px', marginBottom: '8px', fontWeight: '500' }}>Select Pipeline</label>
                    <select value={shareForm.pipelineId} onChange={e => setShareForm({...shareForm, pipelineId: e.target.value})} style={{ width: '100%', background: '#27272a', color: 'white', padding: '12px', borderRadius: '12px', border: '1px solid #3f3f46', outline: 'none' }}>
                        <option value="">Choose pipeline...</option>
                        {myPipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', color: '#a1a1aa', fontSize: '13px', marginBottom: '8px', fontWeight: '500' }}>User Email</label>
                    <input type="email" placeholder="colleague@example.com" value={shareForm.email} onChange={e => setShareForm({...shareForm, email: e.target.value})} style={{ width: '100%', background: '#27272a', color: 'white', padding: '12px', borderRadius: '12px', border: '1px solid #3f3f46', outline: 'none' }} />
                </div>
                <div>
                    <label style={{ display: 'block', color: '#a1a1aa', fontSize: '13px', marginBottom: '8px', fontWeight: '500' }}>Access Level</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {['viewer', 'editor'].map(role => (
                            <div key={role} onClick={() => setShareForm({...shareForm, role})} style={{ flex: 1, padding: '10px', textAlign: 'center', borderRadius: '10px', background: shareForm.role===role ? 'rgba(99, 102, 241, 0.2)' : '#27272a', color: shareForm.role===role?'#818cf8':'#71717a', border: shareForm.role===role ? '1px solid #6366f1' : '1px solid #3f3f46', cursor: 'pointer', textTransform: 'capitalize', fontWeight: '600', fontSize: '14px' }}>{role}</div>
                        ))}
                    </div>
                </div>
                <button onClick={handleShare} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', border: 'none', color: 'white', fontWeight: '600', fontSize: '15px', cursor: 'pointer', marginTop: '10px' }}>Send Invite</button>
            </div>
        </motion.div>
    </div>
);

const RevokeModal = ({ close, selectedRevoke, confirmRevoke }) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={close}>
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()} style={{ width: '380px', background: '#18181b', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <AlertTriangle size={32} />
            </div>
            <h3 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '20px' }}>Confirm Action</h3>
            <p style={{ color: '#a1a1aa', fontSize: '15px', marginBottom: '24px', lineHeight: '1.5' }}>
                {selectedRevoke.type === 'leave' ? 'Are you sure you want to leave this shared pipeline?' : `Revoke access for ${selectedRevoke.username}?`}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={close} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                <button onClick={confirmRevoke} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#ef4444', border: 'none', color: 'white', cursor: 'pointer', fontWeight: '600' }}>Confirm</button>
            </div>
        </motion.div>
    </div>
);

export default CollaborationPage;
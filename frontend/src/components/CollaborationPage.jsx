import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Share2,
  Inbox,
  Shield,
  Layers,
  ExternalLink,
  X,
  Mail,
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle 
} from 'lucide-react';
import AppLayout from './layout/AppLayout';
import '../App.css'; 

const CollaborationPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ shared_with_me: 0, my_shared_pipelines: 0, team_members: 0 });
  const [sharedWithMe, setSharedWithMe] = useState([]);
  const [sharedByMe, setSharedByMe] = useState([]);
  
  // Modal States
  const [showShareModal, setShowShareModal] = useState(false);
  const [myPipelines, setMyPipelines] = useState([]);
  const [shareForm, setShareForm] = useState({ pipelineId: '', email: '', role: 'viewer' });

  // Notification & Confirmation States
  const [notification, setNotification] = useState(null);
  const [revokeModal, setRevokeModal] = useState({ isOpen: false, shareId: null, username: '' });

  const showToast = (message, type = 'success') => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        fetchData(token);
    }
  }, [navigate]);

  const fetchData = async (token) => {
      try {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          
          const statsRes = await axios.get('http://127.0.0.1:5000/collaboration/stats', config);
          setStats(statsRes.data);

          const withMeRes = await axios.get('http://127.0.0.1:5000/collaboration/shared-with-me', config);
          setSharedWithMe(withMeRes.data);

          const byMeRes = await axios.get('http://127.0.0.1:5000/collaboration/shared-by-me', config);
          setSharedByMe(byMeRes.data);

          const myPipesRes = await axios.get('http://127.0.0.1:5000/pipelines', config);
          setMyPipelines(myPipesRes.data.filter(p => !p.is_shared)); // Only show non-shared pipelines in dropdown

      } catch (err) {
          console.error("Error fetching collaboration data:", err);
          showToast("Failed to load data", "error");
      }
  };

  const handleShareSubmit = async () => {
      const token = localStorage.getItem('token');
      try {
          await axios.post('http://127.0.0.1:5000/pipelines/share', {
              pipeline_id: shareForm.pipelineId,
              email: shareForm.email,
              role: shareForm.role
          }, { headers: { Authorization: `Bearer ${token}` } });
          
          showToast("Pipeline shared successfully!", "success");
          setShowShareModal(false);
          setShareForm({ pipelineId: '', email: '', role: 'viewer' });
          fetchData(token); 
      } catch (err) {
          showToast("Share failed: " + (err.response?.data?.error || err.message), "error");
      }
  };

  const initiateRevoke = (shareId, username) => {
      setRevokeModal({ isOpen: true, shareId, username });
  };

  const confirmRevoke = async () => {
      const { shareId } = revokeModal;
      const token = localStorage.getItem('token');
      try {
          await axios.delete(`http://127.0.0.1:5000/pipelines/share/${shareId}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          fetchData(token);
          showToast("Access revoked successfully", "success");
      } catch (err) {
          showToast("Failed to revoke access", "error");
      } finally {
          setRevokeModal({ isOpen: false, shareId: null, username: '' });
      }
  };

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

      <AnimatePresence>
        {revokeModal.isOpen && (
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
                        
                        <h3 style={{ margin: 0, color: 'white', fontSize: '20px' }}>Revoke Access?</h3>
                        
                        <p style={{ margin: 0, color: '#a1a1aa', fontSize: '14px', lineHeight: '1.5' }}>
                            Are you sure you want to remove access for <b style={{ color: 'white' }}>{revokeModal.username}</b>? 
                            <br/>They will no longer be able to view or edit this pipeline.
                        </p>

                        <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '10px' }}>
                            <button 
                                onClick={() => setRevokeModal({ isOpen: false, shareId: null, username: '' })}
                                className="btn btn-ghost"
                                style={{ flex: 1, justifyContent: 'center' }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmRevoke}
                                className="btn"
                                style={{ 
                                    flex: 1, justifyContent: 'center', 
                                    background: '#ef4444', color: 'white', border: 'none', fontWeight: '600' 
                                }}
                            >
                                Revoke Access
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
          
          <motion.div className="flex justify-between items-end" style={{ marginBottom: '40px' }} variants={itemVariants}>
            <div>
                <p className="text-muted" style={{ fontSize: '13px', margin: 0, textTransform: 'uppercase', letterSpacing: '1px', color: '#10b981' }}>Collaboration Hub</p>
                <h1 style={{ fontSize: '32px', marginBottom: '5px', marginTop: '5px', background: 'linear-gradient(90deg, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Team Collaboration</h1>
                <p className="text-muted" style={{ margin: 0, fontSize: '14px' }}>Manage shared pipelines and coordinate with your team.</p>
            </div>
            
            <motion.button 
                className="btn btn-success" 
                onClick={() => setShowShareModal(true)}
                whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(16,185,129,0.4)' }}
                whileTap={{ scale: 0.95 }}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600',
                  padding: '8px 16px', fontSize: '13px', height: '36px'     
                }}
            >
                <Share2 size={14} />
                Share Pipeline
            </motion.button>
          </motion.div>

          <motion.div className="flex gap-20" style={{ marginBottom: '40px' }} variants={itemVariants}>
              <CollabStatCard title="SHARED WITH ME" value={stats.shared_with_me} sub="Pipelines accessible" icon={<Inbox size={24} />} color="#3b82f6" />
              <CollabStatCard title="MY SHARED PIPELINES" value={stats.my_shared_pipelines} sub="Active shares" icon={<Share2 size={24} />} color="#a855f7" />
              <CollabStatCard title="TEAM MEMBERS" value={stats.team_members} sub="In your network" icon={<Users size={24} />} color="#eab308" />
          </motion.div>

          {/* Shared With Me */}
          <motion.h3 style={{ marginBottom: '15px', marginTop: '30px', color: '#e4e4e7', fontSize: '18px' }} variants={itemVariants}>Shared With Me</motion.h3>
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
                    <tr>
                        <th style={{ background: 'rgba(0,0,0,0.2)', color: '#a1a1aa' }}>Pipeline Name</th>
                        <th style={{ background: 'rgba(0,0,0,0.2)', color: '#a1a1aa' }}>Owner</th>
                        <th style={{ background: 'rgba(0,0,0,0.2)', color: '#a1a1aa' }}>My Role</th>
                        <th style={{ background: 'rgba(0,0,0,0.2)', color: '#a1a1aa' }}>Updated</th>
                        <th style={{ background: 'rgba(0,0,0,0.2)', color: '#a1a1aa', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sharedWithMe.length === 0 ? (
                        <tr><td colSpan="5" className="text-center text-muted" style={{ padding: '40px' }}>No pipelines shared with you yet.</td></tr>
                    ) : (
                        sharedWithMe.map(p => (
                            <motion.tr 
                                key={p.share_id}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                            >
                                <td className="font-bold" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e4e4e7' }}>
                                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '6px', borderRadius: '6px', color: '#3b82f6' }}>
                                        <Layers size={16} />
                                    </div>
                                    {p.name.replace(' (Shared)', '')}
                                </td>
                                <td>
                                    <div className="flex items-center gap-10">
                                        <div className="profile-avatar" style={{ width: '24px', height: '24px', fontSize: '10px', background: '#27272a', border: '1px solid #3f3f46' }}>{p.owner_name[0]}</div>
                                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#d4d4d8' }}>{p.owner_name}</div>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ 
                                        background: 'rgba(59, 130, 246, 0.1)', 
                                        color: '#3b82f6', 
                                        border: '1px solid rgba(59, 130, 246, 0.2)',
                                        padding: '2px 8px', 
                                        borderRadius: '4px', 
                                        fontSize: '11px', 
                                        textTransform: 'uppercase',
                                        fontWeight: '600' 
                                    }}>
                                        {p.role}
                                    </span>
                                </td>
                                <td className="text-muted" style={{ fontSize: '13px' }}>{p.updated_at}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <motion.button 
                                            className="btn btn-ghost" 
                                            style={{ fontSize: '12px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                                            onClick={() => navigate(`/builder/${p.id}`)}
                                            whileHover={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)' }}
                                        >
                                            <ExternalLink size={12} /> Open
                                        </motion.button>
                                        <motion.button 
                                            onClick={() => initiateRevoke(p.share_id, p.owner_name)} 
                                            className="btn btn-ghost" 
                                            style={{ fontSize: '12px', padding: '4px 10px', color: '#64748b', border: '1px solid transparent' }} 
                                            title="Leave Share"
                                            whileHover={{ color: '#f87171', background: 'rgba(239,68,68,0.1)' }}
                                        >
                                            <X size={14} />
                                        </motion.button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))
                    )}
                </tbody>
            </table>
          </motion.div>

          {/* My Shared Pipelines */}
          <motion.h3 style={{ marginBottom: '15px', marginTop: '40px', color: '#e4e4e7', fontSize: '18px' }} variants={itemVariants}>My Shared Pipelines</motion.h3>
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
                    <tr>
                        <th style={{ background: 'rgba(0,0,0,0.2)', color: '#a1a1aa' }}>Pipeline Name</th>
                        <th style={{ background: 'rgba(0,0,0,0.2)', color: '#a1a1aa' }}>Shared With</th>
                        <th style={{ background: 'rgba(0,0,0,0.2)', color: '#a1a1aa' }}>Status</th>
                        <th style={{ background: 'rgba(0,0,0,0.2)', color: '#a1a1aa', textAlign: 'right' }}>Manage</th>
                    </tr>
                </thead>
                <tbody>
                    {sharedByMe.length === 0 ? (
                        <tr><td colSpan="4" className="text-center text-muted" style={{ padding: '40px' }}>You haven't shared any pipelines yet.</td></tr>
                    ) : (
                        sharedByMe.map(p => (
                            <motion.tr 
                                key={p.id}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                            >
                                <td className="font-bold" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e4e4e7' }}>
                                    <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '6px', borderRadius: '6px', color: '#eab308' }}>
                                        <Share2 size={16} />
                                    </div>
                                    {p.name}
                                </td>
                                <td>
                                    <div className="flex items-center gap-5">
                                        {p.shared_users.slice(0, 3).map((u, i) => (
                                            <div key={i} className="profile-avatar" style={{ width: '24px', height: '24px', fontSize: '10px', border: '1px solid #3f3f46', background: '#27272a' }} title={`${u.username} (${u.role})`}>
                                                {u.username[0]}
                                            </div>
                                        ))}
                                        {p.user_count > 3 && <span className="text-muted" style={{ fontSize: '12px' }}>+{p.user_count - 3}</span>}
                                        <span className="text-muted" style={{ fontSize: '12px', marginLeft: '5px' }}>{p.user_count} users</span>
                                    </div>
                                </td>
                                <td>
                                    <span style={{
                                        background: 'rgba(16, 185, 129, 0.15)',
                                        color: '#10b981',
                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                        padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600'
                                    }}>
                                        Active
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    {p.shared_users.map(u => (
                                        <div key={u.share_id} style={{ display: 'inline-flex', alignItems: 'center', marginRight: '8px', background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <span className="text-muted" style={{ fontSize: '11px', marginRight: '5px' }}>{u.username}</span>
                                            <button 
                                                style={{ 
                                                    background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 
                                                }}
                                                onClick={() => initiateRevoke(u.share_id, u.username)}
                                                title="Revoke Access"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </td>
                            </motion.tr>
                        ))
                    )}
                </tbody>
            </table>
          </motion.div>

        </motion.div>

      {/* SHARE MODAL */}
      <AnimatePresence>
      {showShareModal && (
          <motion.div 
            style={{
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
              backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
              zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
              <motion.div 
                className="card" 
                style={{ 
                    width: '400px', padding: '30px',
                    background: 'rgba(24, 24, 27, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: 'white', fontSize: '20px' }}>Share Pipeline</h2>
                    <button onClick={() => setShowShareModal(false)} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}><X size={20} /></button>
                  </div>
                  
                  <div className="input-group">
                      <label className="input-label" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><Layers size={14}/> Select Pipeline</label>
                      <select 
                          className="select-field"
                          value={shareForm.pipelineId}
                          onChange={(e) => setShareForm({...shareForm, pipelineId: e.target.value})}
                          style={{ background: '#18181b', border: '1px solid #3f3f46', color: 'white', width: '100%', padding: '10px', borderRadius: '6px' }}
                      >
                          <option value="">-- Choose a Pipeline --</option>
                          {myPipelines.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                      </select>
                  </div>

                  <div className="input-group">
                      <label className="input-label" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><Mail size={14}/> User Email</label>
                      <input 
                          className="input-field" 
                          type="email" 
                          placeholder="colleague@example.com"
                          value={shareForm.email}
                          onChange={(e) => setShareForm({...shareForm, email: e.target.value})}
                          style={{ background: '#18181b', border: '1px solid #3f3f46', color: 'white', width: '100%', padding: '10px', borderRadius: '6px' }}
                      />
                  </div>

                  <div className="input-group">
                      <label className="input-label" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><Shield size={14}/> Role</label>
                      <select 
                          className="select-field" 
                          value={shareForm.role}
                          onChange={(e) => setShareForm({...shareForm, role: e.target.value})}
                          style={{ background: '#18181b', border: '1px solid #3f3f46', color: 'white', width: '100%', padding: '10px', borderRadius: '6px' }}
                      >
                          <option value="viewer">Viewer (Read Only)</option>
                          <option value="editor">Editor (Can Edit)</option>
                      </select>
                  </div>

                  <div className="flex gap-10 justify-end mt-30" style={{ marginTop: '30px' }}>
                      <button className="btn btn-ghost" onClick={() => setShowShareModal(false)}>Cancel</button>
                      <button className="btn btn-success" onClick={handleShareSubmit} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <Share2 size={16} /> Share
                      </button>
                  </div>
              </motion.div>
          </motion.div>
      )}
      </AnimatePresence>

    </AppLayout>
  );
};

const CollabStatCard = ({ title, value, sub, icon, color }) => (
    <motion.div 
        className="card" 
        style={{ 
            flex: 1, 
            padding: '24px', 
            background: 'rgba(24, 24, 27, 0.4)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            position: 'relative',
            overflow: 'hidden'
        }}
        whileHover={{ y: -5, borderColor: `rgba(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)}, 0.4)` }}
    >
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '60px', height: '60px', background: color, filter: 'blur(40px)', opacity: 0.1 }}></div>
        
        <p className="text-muted" style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '1px', marginBottom: '15px', textTransform: 'uppercase' }}>{title}</p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
                <h2 style={{ fontSize: '36px', margin: 0, fontWeight: 'bold', color: 'white', lineHeight: 1 }}>{value}</h2>
                <p style={{ fontSize: '13px', marginTop: '5px', color: color, margin: '5px 0 0 0' }}>{sub}</p>
            </div>
            <div style={{ 
                background: `rgba(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)}, 0.1)`, 
                padding: '10px', 
                borderRadius: '8px',
                color: color
            }}>
                {icon}
            </div>
        </div>
    </motion.div>
);

export default CollaborationPage;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    Network, Activity, Server, Plus, Zap, ArrowUpRight, Clock, 
    MoreHorizontal, Database, Calendar, Users, ChevronRight
} from 'lucide-react';
import AppLayout from './layout/AppLayout';
import '../App.css';

const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Core Data State
  const [pipelines, setPipelines] = useState([]);
  const [recentPipelines, setRecentPipelines] = useState([]);
  const [totalDataSize, setTotalDataSize] = useState('0 B'); 
  const [activeRuns, setActiveRuns] = useState(0);
  const [loading, setLoading] = useState(true);

  // New Dynamic Stats State
  const [catalogStats, setCatalogStats] = useState({ sources: 0, processed: 0 });
  const [scheduledStats, setScheduledStats] = useState({ count: 0, next: null });
  const [collabStats, setCollabStats] = useState({ members: 0, shared: 0 });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch Pipelines & User Stats
        const reqPipelines = axios.get('http://127.0.0.1:5000/pipelines', { headers });
        const reqUserStats = axios.get('http://127.0.0.1:5000/user-stats', { headers });
        
        // 2. Fetch Data Sources for Catalog Card
        const reqDataSources = axios.get('http://127.0.0.1:5000/datasources', { headers });

        // 3. Fetch Collaboration Stats
        const reqCollab = axios.get('http://127.0.0.1:5000/collaboration/stats', { headers });

        Promise.all([reqPipelines, reqUserStats, reqDataSources, reqCollab])
        .then(([resPipelines, resStats, resData, resCollab]) => {
            const allPipelines = resPipelines.data;
            
            // Pipelines Logic
            setPipelines(allPipelines);
            setRecentPipelines(allPipelines.slice(0, 6));
            setActiveRuns(allPipelines.filter(p => p.status === 'Active').length);
            
            // Scheduling Logic
            const scheduled = allPipelines.filter(p => p.schedule);
            setScheduledStats({
                count: scheduled.length,
                next: scheduled.length > 0 ? scheduled[0].name : null
            });

            // User Stats Logic
            setTotalDataSize(formatBytes(resStats.data.total_processed_bytes));

            // Catalog Logic
            const sources = resData.data.filter(d => d.category === 'upload').length;
            const processed = resData.data.filter(d => d.category === 'processed').length;
            setCatalogStats({ sources, processed });

            // Collaboration Logic
            setCollabStats({
                members: resCollab.data.team_members || 1, // Default to 1 (self) if 0
                shared: resCollab.data.shared_with_me + resCollab.data.my_shared_pipelines
            });
        })
        .catch(err => console.error("Error loading dashboard:", err))
        .finally(() => setLoading(false));
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <AppLayout>
        <div style={{ padding: '32px 48px', maxWidth: '1800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                
                {/* 1. HEADER SECTION */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <h1 style={{ fontSize: '36px', fontWeight: '800', color: 'white', margin: 0, letterSpacing: '-0.5px' }}>
                                Command Center
                            </h1>
                            <span style={{ fontSize: '12px', padding: '4px 10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: '600' }}>
                                System Operational
                            </span>
                        </div>
                        <p style={{ color: '#a1a1aa', fontSize: '15px', maxWidth: '600px', lineHeight: '1.5' }}>
                            You have <span style={{ color: '#e4e4e7', fontWeight: '600' }}>{activeRuns} active pipelines</span> processing data in real-time.
                        </p>
                    </div>
                    
                    <motion.button 
                        whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/builder')}
                        style={{ 
                            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', 
                            padding: '14px 28px', borderRadius: '16px', fontWeight: '600', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)'
                        }}
                    >
                        <Plus size={20} strokeWidth={2.5} /> Create Pipeline
                    </motion.button>
                </div>

                {/* 2. BENTO GRID LAYOUT */}
                <div className="bento-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(12, 1fr)', 
                    gridAutoRows: 'minmax(150px, auto)',
                    gap: '24px' 
                }}>
                    
                    {/* STAT CARDS ROW */}
                    <div style={{ gridColumn: 'span 3' }}>
                        <StatCard 
                            label="Total Pipelines" value={pipelines.length} 
                            icon={<Network size={22} />} color="#3b82f6" 
                            trend={pipelines.length > 0 ? "Active" : "No pipelines"} 
                            chartData={[30, 40, 35, 50, 49, 60, 70]} 
                        />
                    </div>
                    <div style={{ gridColumn: 'span 3' }}>
                        <StatCard 
                            label="Active Runs" value={activeRuns} 
                            icon={<Activity size={22} />} color="#f59e0b" 
                            trend={activeRuns > 0 ? "Processing" : "Idle"} 
                            chartData={[10, 25, 15, 30, 12, 40, 20]} 
                        />
                    </div>
                    <div style={{ gridColumn: 'span 3' }}>
                        <StatCard 
                            label="Data Processed" value={totalDataSize} 
                            icon={<Server size={22} />} color="#10b981" 
                            trend="Total Usage" 
                            chartData={[20, 25, 40, 30, 45, 50, 80]} 
                        />
                    </div>
                    <div style={{ gridColumn: 'span 3' }}>
                        <StatCard 
                            label="Success Rate" value="98.5%" 
                            icon={<Zap size={22} />} color="#8b5cf6" 
                            trend="Stable" 
                            chartData={[90, 92, 94, 93, 95, 98, 98.5]} 
                        />
                    </div>

                    {/* MAIN ACTIVITY FEED (Left Block - 3 Rows Height) */}
                    <motion.div variants={itemVariants} style={{ 
                        gridColumn: 'span 8', gridRow: 'span 3',
                        background: 'rgba(24, 24, 27, 0.6)', borderRadius: '24px', 
                        border: '1px solid rgba(255,255,255,0.05)', padding: '28px',
                        display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Clock size={20} color="#e4e4e7" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', margin: 0 }}>Recent Activity</h3>
                                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#71717a' }}>Latest pipeline executions and status updates</p>
                                </div>
                            </div>
                            <button className="btn-ghost" style={{ fontSize: '13px', padding: '8px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                                View Full History
                            </button>
                        </div>

                        <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                            {/* Timeline Line */}
                            <div style={{ position: 'absolute', left: '23px', top: '10px', bottom: '10px', width: '2px', background: 'rgba(255,255,255,0.05)', zIndex: 0 }} />

                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : recentPipelines.length === 0 ? (
                                <EmptyState />
                            ) : (
                                recentPipelines.map((pipe, i) => (
                                    <PipelineTimelineRow key={pipe.id} pipe={pipe} index={i} navigate={navigate} />
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* RIGHT COLUMN STACK (3 Rows Height - 1 Card per Row) */}
                    
                    {/* 1. DATA CATALOG CARD */}
                    <FunctionalCard 
                        title="Data Catalog"
                        description="Browse schemas & lineage."
                        icon={<Database size={24} color="#60a5fa" />}
                        color="#3b82f6"
                        bgGradient="linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(24, 24, 27, 0))"
                        onClick={() => navigate('/catalog')}
                        tags={[`${catalogStats.sources} Sources`, `${catalogStats.processed} Processed`]}
                    />

                    {/* 2. SCHEDULED JOBS CARD */}
                    <FunctionalCard 
                        title="Scheduled Jobs"
                        description="Manage automated triggers."
                        icon={<Calendar size={24} color="#facc15" />}
                        color="#eab308"
                        bgGradient="linear-gradient(135deg, rgba(202, 138, 4, 0.1), rgba(24, 24, 27, 0))"
                        onClick={() => navigate('/schedules')}
                        alert={scheduledStats.next ? `Active: ${scheduledStats.next}` : "No active schedules"}
                        tags={[`${scheduledStats.count} Active`]}
                    />

                    {/* 3. COLLABORATION CARD */}
                    <FunctionalCard 
                        title="Collaboration"
                        description="Team insights & notes."
                        icon={<Users size={24} color="#f472b6" />}
                        color="#ec4899"
                        bgGradient="linear-gradient(135deg, rgba(219, 39, 119, 0.1), rgba(24, 24, 27, 0))"
                        onClick={() => navigate('/collaboration')}
                        activeUsers={collabStats.members}
                        tags={[`${collabStats.shared} Shared`]}
                    />

                </div>
            </motion.div>
        </div>
    </AppLayout>
  );
};

/* --- VISUAL COMPONENTS --- */

const FunctionalCard = ({ title, description, icon, color, bgGradient, onClick, tags, alert, activeUsers }) => (
    <motion.div 
        variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
        onClick={onClick}
        whileHover={{ scale: 1.01, y: -2, borderColor: `${color}60` }}
        style={{ 
            gridColumn: 'span 4', gridRow: 'span 1',
            background: bgGradient || 'rgba(24, 24, 27, 0.6)', 
            borderRadius: '24px', padding: '24px',
            border: `1px solid ${color}20`,
            cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ 
                    padding: '12px', borderRadius: '16px', 
                    background: `${color}15`, border: `1px solid ${color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    {icon}
                </div>
                <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', margin: '0 0 4px 0' }}>{title}</h3>
                    <p style={{ color: '#a1a1aa', fontSize: '13px', margin: 0 }}>{description}</p>
                </div>
            </div>
            <ArrowUpRight size={20} color={color} style={{ opacity: 0.7 }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '16px', gap: '12px' }}>
            {tags && tags.map((tag, i) => (
                <span key={i} style={{ 
                    fontSize: '11px', background: `${color}15`, color: color, 
                    padding: '4px 10px', borderRadius: '8px', fontWeight: '600' 
                }}>
                    {tag}
                </span>
            ))}
            
            {alert && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#e4e4e7' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
                    <span style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{alert}</span>
                </div>
            )}

            {activeUsers > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', paddingLeft: '8px' }}>
                        {[...Array(Math.min(activeUsers, 3))].map((_, i) => (
                            <div key={i} style={{ 
                                width: '24px', height: '24px', borderRadius: '50%', background: '#52525b', 
                                border: '2px solid #18181b', marginLeft: '-10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 'bold'
                            }}>
                                {String.fromCharCode(65 + i)}
                            </div>
                        ))}
                    </div>
                    <span style={{ fontSize: '12px', color: '#a1a1aa' }}>{activeUsers} Members</span>
                </div>
            )}
        </div>
    </motion.div>
);

const StatCard = ({ label, value, icon, color, trend, chartData }) => (
  <motion.div 
    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
    whileHover={{ y: -4, boxShadow: `0 10px 30px -10px ${color}15` }}
    style={{ 
        padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        borderRadius: '24px', background: 'rgba(24, 24, 27, 0.6)', 
        border: '1px solid rgba(255, 255, 255, 0.05)', position: 'relative', overflow: 'hidden',
        boxSizing: 'border-box'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ 
            width: '48px', height: '48px', borderRadius: '14px', 
            background: `${color}10`, color: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${color}20`
        }}>
            {icon}
        </div>
        <span style={{ 
            fontSize: '11px', color: '#a1a1aa', fontWeight: '600', 
            background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.05)'
        }}>
            {trend}
        </span>
    </div>
    
    <div style={{ marginTop: '16px' }}>
        <div style={{ fontSize: '32px', fontWeight: '800', color: 'white', marginBottom: '4px', letterSpacing: '-1px' }}>{value}</div>
        <div style={{ fontSize: '13px', color: '#71717a', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </div>

    {/* Sparkline Overlay */}
    <div style={{ position: 'absolute', bottom: '24px', right: '24px', opacity: 0.5, pointerEvents: 'none' }}>
        <Sparkline data={chartData} color={color} />
    </div>
  </motion.div>
);

const PipelineTimelineRow = ({ pipe, index, navigate }) => (
    <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        onClick={() => navigate(`/builder/${pipe.id}`)}
        style={{ 
            display: 'flex', alignItems: 'center', gap: '20px', padding: '16px 0',
            cursor: 'pointer', zIndex: 1, position: 'relative'
        }}
    >
        {/* Timeline Dot */}
        <div style={{ 
            width: '48px', display: 'flex', justifyContent: 'center', flexShrink: 0
        }}>
            <div style={{ 
                width: '12px', height: '12px', borderRadius: '50%', 
                background: pipe.status === 'Active' ? '#10b981' : '#27272a',
                border: pipe.status === 'Active' ? '2px solid rgba(16, 185, 129, 0.3)' : '2px solid #3f3f46',
                boxShadow: pipe.status === 'Active' ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none',
                zIndex: 2
            }} />
        </div>

        {/* Card Content */}
        <motion.div 
            style={{ 
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.02)', padding: '16px 20px', borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.05)'
            }}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)', x: 4, borderColor: 'rgba(255,255,255,0.1)' }}
        >
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#e4e4e7' }}>{pipe.name}</span>
                    <span style={{ fontSize: '11px', color: '#52525b', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                        ID: {pipe.id}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#a1a1aa' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {pipe.created_at || 'Just now'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Database size={12} /> SQL Source
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {pipe.status === 'Active' ? (
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
                        Ready
                    </span>
                )}
                
                <ChevronRight size={16} color="#52525b" />
            </div>
        </motion.div>
    </motion.div>
);

const Sparkline = ({ data, color }) => {
    const points = data.map((d, i) => `${i * 10},${50 - d / 2}`).join(' ');
    return (
        <svg width="60" height="30" viewBox="0 0 60 50" style={{ overflow: 'visible' }}>
            <path d={`M ${points}`} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={data.length * 10 - 10} cy={50 - data[data.length-1] / 2} r="3" fill={color} />
        </svg>
    );
};

const SkeletonRow = () => (
    <div style={{ height: '76px', margin: '12px 0 12px 48px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }} />
);

const EmptyState = () => (
    <div style={{ textAlign: 'center', padding: '60px', marginLeft: '48px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px' }}>
        <p style={{ color: '#71717a' }}>No recent activity found.</p>
    </div>
);

export default Dashboard;
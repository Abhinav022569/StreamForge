import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import { Calendar, Clock, Trash2, Play, Search, AlertCircle } from 'lucide-react';

const ScheduledPipelines = () => {
  const navigate = useNavigate();
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPipelines = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://127.0.0.1:5000/pipelines', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter ONLY scheduled pipelines
      const scheduled = res.data.filter(p => p.schedule && p.schedule !== 'null');
      setPipelines(scheduled);
    } catch (err) {
      console.error("Failed to fetch schedules", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  const handleUnschedule = async (id) => {
    if(!window.confirm("Are you sure you want to disable this schedule?")) return;
    
    try {
        const token = localStorage.getItem('token');
        // Sending empty value removes the schedule (logic already in your backend)
        await axios.post(`http://127.0.0.1:5000/pipelines/${id}/schedule`, 
            { type: '', value: '' }, 
            { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchPipelines(); // Refresh list
    } catch (err) {
        alert("Failed to unschedule pipeline");
    }
  };

  const formatSchedule = (scheduleStr) => {
      if (!scheduleStr) return "N/A";
      const [type, val] = scheduleStr.split(':');
      if (type === 'interval') return `Every ${val} minutes`;
      if (type === 'cron') return `Daily at ${val}`;
      return scheduleStr;
  };

  const filtered = pipelines.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div style={{ padding: '40px 60px', maxWidth: '1600px', margin: '0 auto', width: '100%', color: '#e4e4e7' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '40px' }}>
            <div>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(236, 72, 153, 0.05))', padding: '12px', borderRadius: '14px', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.1)' }}>
                        <Calendar size={28} />
                    </div>
                    Scheduled Jobs
                </h1>
                <p style={{ color: '#a1a1aa', marginTop: '8px', marginLeft: '5px' }}>Manage your automated pipeline runs.</p>
            </div>
            
            {/* Search */}
            <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
                <input 
                    type="text" 
                    placeholder="Search schedules..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ 
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                        padding: '10px 10px 10px 40px', borderRadius: '8px', color: 'white', minWidth: '300px' 
                    }}
                />
            </div>
        </div>

        {/* Content */}
        <div style={{ background: '#121217', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                        <th style={{ textAlign: 'left', padding: '16px 24px', color: '#a1a1aa', fontSize: '12px', textTransform: 'uppercase' }}>Pipeline Name</th>
                        <th style={{ textAlign: 'left', padding: '16px 24px', color: '#a1a1aa', fontSize: '12px', textTransform: 'uppercase' }}>Frequency</th>
                        <th style={{ textAlign: 'left', padding: '16px 24px', color: '#a1a1aa', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
                        <th style={{ textAlign: 'right', padding: '16px 24px', color: '#a1a1aa', fontSize: '12px', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#71717a' }}>Loading schedules...</td></tr>
                    ) : filtered.length === 0 ? (
                        <tr>
                            <td colSpan="4" style={{ padding: '60px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', color: '#52525b' }}>
                                    <Clock size={40} />
                                    <p>No pipelines are currently scheduled.</p>
                                    <button onClick={() => navigate('/pipelines')} className="btn" style={{background:'rgba(255,255,255,0.1)', padding:'8px 16px', borderRadius:'6px', color:'white', border:'none', cursor:'pointer'}}>
                                        Go to Pipelines
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        filtered.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                <td style={{ padding: '16px 24px', fontWeight: '500' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></div>
                                        {p.name}
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px', color: '#e4e4e7' }}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px', fontSize: '13px' }}>
                                        <Clock size={14} color="#a1a1aa" />
                                        {formatSchedule(p.schedule)}
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{ 
                                        color: p.status === 'Ready' ? '#10b981' : '#f59e0b',
                                        background: p.status === 'Ready' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                        padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'
                                    }}>
                                        {p.status === 'Ready' ? 'Active' : 'Running'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                        <button 
                                            onClick={() => navigate(`/builder/${p.id}`)}
                                            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}
                                        >
                                            <Play size={14} /> View
                                        </button>
                                        <button 
                                            onClick={() => handleUnschedule(p.id)}
                                            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}
                                        >
                                            <Trash2 size={14} /> Disable
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default ScheduledPipelines;
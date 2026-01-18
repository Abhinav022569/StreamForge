import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AppLayout from './layout/AppLayout.jsx'; // Explicit .jsx extension
import { Bell, CheckCircle2, AlertCircle, Info, Check, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all' or 'unread'

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://127.0.0.1:5000/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const markAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://127.0.0.1:5000/api/notifications/read', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error(err);
        }
    };

    // Helper to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    const filteredNotifications = filter === 'all' 
        ? notifications 
        : notifications.filter(n => !n.read);

    return (
        <AppLayout>
            <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: '#e4e4e7' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '10px', borderRadius: '12px', color: '#a78bfa' }}>
                                <Bell size={28} />
                            </div>
                            Notifications
                        </h1>
                        <p style={{ color: '#a1a1aa', marginTop: '5px' }}>Stay updated on your pipelines and system alerts.</p>
                    </div>
                    <button 
                        onClick={markAsRead}
                        className="btn"
                        style={{ 
                            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#e4e4e7',
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        <Check size={16} /> Mark all as read
                    </button>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <button 
                        onClick={() => setFilter('all')}
                        style={{ 
                            background: 'none', border: 'none', padding: '10px 0', 
                            color: filter === 'all' ? '#8b5cf6' : '#71717a',
                            borderBottom: filter === 'all' ? '2px solid #8b5cf6' : '2px solid transparent',
                            cursor: 'pointer', fontWeight: '500', fontSize: '14px'
                        }}
                    >
                        All
                    </button>
                    <button 
                        onClick={() => setFilter('unread')}
                        style={{ 
                            background: 'none', border: 'none', padding: '10px 0', 
                            color: filter === 'unread' ? '#8b5cf6' : '#71717a',
                            borderBottom: filter === 'unread' ? '2px solid #8b5cf6' : '2px solid transparent',
                            cursor: 'pointer', fontWeight: '500', fontSize: '14px'
                        }}
                    >
                        Unread
                    </button>
                </div>

                {/* List */}
                <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {loading ? (
                        <p style={{ color: '#71717a', textAlign: 'center', padding: '40px' }}>Loading notifications...</p>
                    ) : filteredNotifications.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                            <Bell size={40} style={{ color: '#52525b', marginBottom: '15px', opacity: 0.5 }} />
                            <p style={{ color: '#a1a1aa', margin: 0 }}>You're all caught up!</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {filteredNotifications.map(notif => (
                                <motion.div 
                                    key={notif.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    style={{
                                        display: 'flex', gap: '15px', padding: '20px',
                                        background: notif.read ? 'rgba(255,255,255,0.02)' : 'rgba(139, 92, 246, 0.08)',
                                        border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px',
                                        borderLeft: notif.type === 'error' ? '4px solid #ef4444' : 
                                                    notif.type === 'success' ? '4px solid #10b981' : '4px solid #3b82f6'
                                    }}
                                >
                                    <div style={{ marginTop: '2px' }}>
                                        {notif.type === 'success' && <CheckCircle2 size={20} color="#10b981" />}
                                        {notif.type === 'error' && <AlertCircle size={20} color="#ef4444" />}
                                        {notif.type === 'info' && <Info size={20} color="#3b82f6" />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#e4e4e7', lineHeight: '1.4' }}>{notif.message}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#71717a' }}>
                                            <Clock size={12} />
                                            {formatDate(notif.timestamp)}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default NotificationsPage;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AppLayout from './layout/AppLayout.jsx';
import { Bell, CheckCircle2, AlertCircle, Info, Check, Clock, Trash2, Filter } from 'lucide-react';
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
            console.error("Failed to fetch notifications", err);
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
            console.error("Failed to mark read", err);
        }
    };

    // --- NEW: DELETE FUNCTION LINKED TO API ---
    const deleteNotification = async (id) => {
        // Optimistic UI update
        setNotifications(prev => prev.filter(n => n.id !== id));
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://127.0.0.1:5000/api/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error("Failed to delete notification", err);
            // Optional: Revert UI if API fails (could refetch)
            fetchNotifications(); 
        }
    };

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
            <div style={{ padding: '40px 60px', maxWidth: '1800px', margin: '0 auto', width: '100%', color: '#e4e4e7' }}>
                
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))', padding: '12px', borderRadius: '14px', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                                <Bell size={28} />
                            </div>
                            Notifications
                        </h1>
                        <p style={{ color: '#a1a1aa', marginTop: '8px', marginLeft: '5px' }}>Monitor your pipeline events, system alerts, and updates.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                            onClick={markAsRead}
                            className="btn"
                            style={{ 
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#e4e4e7',
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px',
                                cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        >
                            <Check size={16} /> Mark all as read
                        </button>
                    </div>
                </div>

                {/* Filters & Content Wrapper */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Filter Tabs */}
                    <div style={{ display: 'flex', gap: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0' }}>
                        <button 
                            onClick={() => setFilter('all')}
                            style={{ 
                                background: 'none', border: 'none', padding: '12px 0', 
                                color: filter === 'all' ? '#8b5cf6' : '#71717a',
                                borderBottom: filter === 'all' ? '2px solid #8b5cf6' : '2px solid transparent',
                                cursor: 'pointer', fontWeight: '600', fontSize: '15px', display: 'flex', gap: '8px', alignItems: 'center',
                                transition: 'color 0.2s'
                            }}
                        >
                            All Notifications 
                            <span style={{ background: filter === 'all' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>{notifications.length}</span>
                        </button>
                        <button 
                            onClick={() => setFilter('unread')}
                            style={{ 
                                background: 'none', border: 'none', padding: '12px 0', 
                                color: filter === 'unread' ? '#8b5cf6' : '#71717a',
                                borderBottom: filter === 'unread' ? '2px solid #8b5cf6' : '2px solid transparent',
                                cursor: 'pointer', fontWeight: '600', fontSize: '15px', display: 'flex', gap: '8px', alignItems: 'center',
                                transition: 'color 0.2s'
                            }}
                        >
                            Unread
                            {notifications.filter(n => !n.read).length > 0 && (
                                <span style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>
                                    {notifications.filter(n => !n.read).length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Notifications List */}
                    <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '400px' }}>
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#71717a', gap: '10px' }}>
                                <div className="spin" style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#8b5cf6', borderRadius: '50%' }}></div>
                                Loading notifications...
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '80px', background: 'rgba(255,255,255,0.01)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                                <Bell size={48} style={{ color: '#52525b', marginBottom: '20px', opacity: 0.5 }} />
                                <h3 style={{ margin: '0 0 8px 0', color: '#e4e4e7' }}>You're all caught up!</h3>
                                <p style={{ color: '#a1a1aa', margin: 0 }}>No new notifications to display at this time.</p>
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {filteredNotifications.map(notif => (
                                    <motion.div 
                                        key={notif.id}
                                        layout
                                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                        whileHover={{ scale: 1.002, backgroundColor: 'rgba(255,255,255,0.03)' }}
                                        style={{
                                            display: 'flex', gap: '20px', padding: '24px',
                                            background: notif.read ? 'rgba(255,255,255,0.01)' : 'rgba(139, 92, 246, 0.05)',
                                            border: '1px solid',
                                            borderColor: notif.read ? 'rgba(255,255,255,0.03)' : 'rgba(139, 92, 246, 0.1)',
                                            borderRadius: '16px',
                                            position: 'relative',
                                            cursor: 'default',
                                            transition: 'border-color 0.2s'
                                        }}
                                    >
                                        {/* Status Indicator Bar */}
                                        <div style={{ 
                                            position: 'absolute', left: '0', top: '24px', bottom: '24px', width: '4px', 
                                            background: notif.type === 'error' ? '#ef4444' : notif.type === 'success' ? '#10b981' : '#3b82f6',
                                            borderTopRightRadius: '4px', borderBottomRightRadius: '4px', opacity: 0.8
                                        }} />

                                        {/* Icon */}
                                        <div style={{ 
                                            marginTop: '2px', flexShrink: 0, 
                                            width: '40px', height: '40px', borderRadius: '10px',
                                            background: notif.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : notif.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {notif.type === 'success' && <CheckCircle2 size={20} color="#10b981" />}
                                            {notif.type === 'error' && <AlertCircle size={20} color="#ef4444" />}
                                            {notif.type === 'info' && <Info size={20} color="#3b82f6" />}
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <p style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#e4e4e7', lineHeight: '1.5', fontWeight: notif.read ? '400' : '500' }}>
                                                    {notif.message}
                                                </p>
                                                {/* DELETE BUTTON */}
                                                <button 
                                                    onClick={() => deleteNotification(notif.id)}
                                                    style={{ 
                                                        background: 'transparent', border: 'none', color: '#52525b', 
                                                        cursor: 'pointer', padding: '6px', marginLeft: '10px', borderRadius: '6px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#52525b'; }}
                                                    title="Delete Notification"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#71717a' }}>
                                                <Clock size={13} />
                                                {formatDate(notif.timestamp)}
                                                {!notif.read && (
                                                    <span style={{ marginLeft: '10px', fontSize: '11px', background: '#8b5cf6', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>New</span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default NotificationsPage;
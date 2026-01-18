import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, XCircle, Info, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NotificationCenter = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const socketRef = useRef(null);
    const dropdownRef = useRef(null);

    // Initial Fetch
    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get('http://127.0.0.1:5000/api/notifications', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Assuming API returns all recent, filter client-side or assume API is sorted desc
                const unread = res.data.filter(n => !n.read);
                setNotifications(res.data.slice(0, 5)); // Show top 5 recent
                setUnreadCount(unread.length);
            } catch (err) { console.error(err); }
        };
        fetchUnread();
    }, []);

    // Socket.IO
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.id) return;

        socketRef.current = io('http://127.0.0.1:5000');
        socketRef.current.emit('join_notifications', { userId: user.id });

        socketRef.current.on('notification', (data) => {
            const newNotif = { id: Date.now(), ...data, timestamp: new Date(), read: false };
            setNotifications(prev => [newNotif, ...prev].slice(0, 5));
            setUnreadCount(prev => prev + 1);
        });

        return () => { if (socketRef.current) socketRef.current.disconnect(); };
    }, []);

    // Outside Click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleViewAll = () => {
        setIsOpen(false);
        navigate('/notifications');
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    background: isOpen ? 'rgba(255,255,255,0.1)' : 'transparent', 
                    border: 'none', color: isOpen ? 'white' : '#a1a1aa', 
                    cursor: 'pointer', padding: '8px', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                }}
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span style={{ 
                        position: 'absolute', top: '6px', right: '6px', 
                        background: '#ef4444', width: '6px', height: '6px', 
                        borderRadius: '50%', border: '1px solid #18181b'
                    }} />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        style={{
                            position: 'absolute', top: 'calc(100% + 5px)', 
                            left: '0', // Keep left aligned
                            width: '320px', background: '#18181b', 
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', 
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)', zIndex: 1000, overflow: 'hidden'
                        }}
                    >
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '600', fontSize: '13px', color: 'white' }}>Recent Activity</span>
                            {unreadCount > 0 && <span style={{ fontSize: '10px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '10px' }}>{unreadCount} New</span>}
                        </div>

                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {notifications.length === 0 ? (
                                <div style={{ padding: '30px', textAlign: 'center', color: '#52525b', fontSize: '12px' }}>
                                    No recent notifications.
                                </div>
                            ) : (
                                notifications.map((notif, i) => (
                                    <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', gap: '12px', alignItems: 'start', background: !notif.read ? 'rgba(139, 92, 246, 0.03)' : 'transparent' }}>
                                        <div style={{ marginTop: '2px' }}>
                                            {notif.type === 'success' && <CheckCircle2 size={14} color="#10b981" />}
                                            {notif.type === 'error' && <XCircle size={14} color="#ef4444" />}
                                            {notif.type === 'info' && <Info size={14} color="#3b82f6" />}
                                        </div>
                                        <div>
                                            <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#e4e4e7', lineHeight: '1.4' }}>{notif.message}</p>
                                            <span style={{ fontSize: '10px', color: '#71717a' }}>{new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div 
                            onClick={handleViewAll}
                            style={{ 
                                padding: '10px', background: 'rgba(255,255,255,0.02)', 
                                borderTop: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                color: '#a1a1aa', fontSize: '12px', fontWeight: '500', transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        >
                            View All Notifications <ChevronRight size={12} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;
import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, XCircle, Info, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NotificationCenter = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const socketRef = useRef(null);
    const dropdownRef = useRef(null);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchUnread = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get('http://127.0.0.1:5000/api/notifications', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const unread = res.data.filter(n => !n.read);
                setNotifications(res.data.slice(0, 5)); // Show top 5 recent
                setUnreadCount(unread.length);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetchUnread();
    }, []);

    // --- Socket.IO Connection ---
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

    // --- Click Outside to Close ---
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

    // --- Animation Variants ---
    const dropdownVariants = {
        hidden: { 
            opacity: 0, 
            y: 10, 
            scale: 0.95,
            transition: { duration: 0.2, ease: "easeInOut" }
        },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { type: "spring", stiffness: 350, damping: 25 }
        },
        exit: { 
            opacity: 0, 
            y: 10, 
            scale: 0.95,
            transition: { duration: 0.15 }
        }
    };

    return (
        <div 
            ref={dropdownRef}
            style={{ position: 'relative', zIndex: 2000 }} 
        >
            {/* Bell Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    background: isOpen ? 'rgba(255,255,255,0.1)' : 'transparent', 
                    border: isOpen ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                    color: isOpen ? 'white' : '#a1a1aa', 
                    cursor: 'pointer', padding: '10px', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                    position: 'relative', outline: 'none'
                }}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span style={{ 
                        position: 'absolute', top: '8px', right: '8px', 
                        background: '#ef4444', width: '8px', height: '8px', 
                        borderRadius: '50%', border: '2px solid #18181b',
                        boxShadow: '0 0 0 2px rgba(24, 24, 27, 0.5)'
                    }} />
                )}
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        style={{
                            position: 'absolute', 
                            top: 'calc(100% + 12px)', 
                            left: '0', // UPDATED: Aligns to left edge, extends right into screen
                            width: '360px', 
                            maxWidth: '90vw', // Ensures it doesn't overflow on small mobile screens
                            background: '#18181b', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            borderRadius: '16px', 
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)', 
                            zIndex: 2001, 
                            overflow: 'hidden',
                            transformOrigin: 'top left' // Animation originates from top-left
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                            <span style={{ fontWeight: '600', fontSize: '14px', color: 'white' }}>Notifications</span>
                            {unreadCount > 0 && (
                                <span style={{ fontSize: '11px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' }}>
                                    {unreadCount} New
                                </span>
                            )}
                        </div>

                        {/* List */}
                        <div className="custom-scrollbar" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                            {loading ? (
                                <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', color: '#52525b' }}>
                                    <Loader2 className="spin" size={24} />
                                </div>
                            ) : notifications.length === 0 ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#71717a', fontSize: '13px' }}>
                                    <Bell size={24} style={{ marginBottom: '12px', opacity: 0.2 }} />
                                    <br />
                                    No recent notifications.
                                </div>
                            ) : (
                                notifications.map((notif, i) => (
                                    <motion.div 
                                        key={notif.id || i}
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                                        style={{ 
                                            padding: '16px 20px', 
                                            borderBottom: '1px solid rgba(255,255,255,0.03)', 
                                            display: 'flex', gap: '14px', alignItems: 'start', 
                                            background: !notif.read ? 'rgba(139, 92, 246, 0.05)' : 'transparent',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        <div style={{ marginTop: '3px', flexShrink: 0 }}>
                                            {notif.type === 'success' && <CheckCircle2 size={16} color="#10b981" />}
                                            {notif.type === 'error' && <XCircle size={16} color="#ef4444" />}
                                            {notif.type === 'info' && <Info size={16} color="#3b82f6" />}
                                        </div>
                                        <div>
                                            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#e4e4e7', lineHeight: '1.5', fontWeight: !notif.read ? '500' : '400' }}>
                                                {notif.message}
                                            </p>
                                            <span style={{ fontSize: '11px', color: '#71717a' }}>
                                                {new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div 
                            onClick={handleViewAll}
                            style={{ 
                                padding: '14px', background: 'rgba(255,255,255,0.02)', 
                                borderTop: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                color: '#a1a1aa', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                e.currentTarget.style.color = '#a1a1aa';
                            }}
                        >
                            View All Activity <ChevronRight size={14} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;
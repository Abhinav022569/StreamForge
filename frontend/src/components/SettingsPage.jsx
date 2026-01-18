import React, { useState, useEffect } from 'react';
import AppLayout from './layout/AppLayout.jsx';
import { 
    User, Bell, Shield, Key, Mail, ToggleLeft, ToggleRight, 
    Save, Loader2, UserX, AlertCircle, Info, CheckCircle2, X 
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [user, setUser] = useState({ username: '', email: '' });
    const [preferences, setPreferences] = useState({ notify_on_success: true, notify_on_failure: true });
    
    // Profile Form States
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    
    // Password Form States
    const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const showToast = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    useEffect(() => {
        // Fetch User Data & Preferences
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://127.0.0.1:5000/api/user/settings', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const userData = res.data.user;
                setUser(userData);
                
                // Split username into First/Last for UI display
                const nameParts = (userData.username || '').split(' ');
                setFirstName(nameParts[0] || '');
                setLastName(nameParts.slice(1).join(' ') || '');
                
                setPreferences(res.data.preferences);
            } catch (err) {
                console.error("Failed to load settings", err);
                if (err.response?.status === 401) navigate('/login');
            }
        };
        fetchData();
    }, [navigate]);

    const handleProfileUpdate = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const fullName = `${firstName} ${lastName}`.trim();
        
        try {
            const res = await axios.put('http://127.0.0.1:5000/user/profile', 
                { username: fullName, email: user.email }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            const updatedUser = res.data.user;
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser)); 
            showToast("Profile updated successfully!", "success");
        } catch (err) {
            showToast("Failed to update profile: " + (err.response?.data?.error || err.message), "error");
        }
        setLoading(false);
    };

    const handlePreferencesSave = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://127.0.0.1:5000/api/user/settings', {
                preferences
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast('Notification preferences updated!', 'success');
        } catch (err) {
            showToast('Failed to update preferences.', 'error');
        }
        setLoading(false);
    };

    const handlePasswordChange = async () => {
        if (passData.newPassword !== passData.confirmPassword) {
            showToast("New passwords do not match!", "error");
            return;
        }
        
        const token = localStorage.getItem('token');
        try {
            await axios.put('http://127.0.0.1:5000/user/password', 
                { currentPassword: passData.currentPassword, newPassword: passData.newPassword }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            showToast("Password changed successfully!", "success");
            setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            showToast("Password change failed: " + (err.response?.data?.error || err.message), "error");
        }
    };

    const initiateDeleteAccount = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteAccount = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete('http://127.0.0.1:5000/user/account', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            localStorage.clear();
            navigate('/login');
        } catch (err) {
            setIsDeleteModalOpen(false);
            showToast("Failed to delete account: " + (err.response?.data?.error || err.message), "error");
        }
    };

    const Toggle = ({ checked, onChange }) => (
        <div onClick={() => onChange(!checked)} style={{ cursor: 'pointer', color: checked ? '#10b981' : '#52525b', display: 'flex', alignItems: 'center' }}>
            {checked ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
        </div>
    );

    // --- Animations ---
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
                {isDeleteModalOpen && (
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
                                width: '450px', background: '#18181b', 
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
                                    <UserX size={32} />
                                </div>
                                
                                <h3 style={{ margin: 0, color: 'white', fontSize: '20px' }}>Delete Your Account?</h3>
                                
                                <p style={{ margin: 0, color: '#a1a1aa', fontSize: '14px', lineHeight: '1.5' }}>
                                    You are about to permanently delete your account and all associated data.
                                    <br/><b style={{ color: '#ef4444' }}>This action cannot be undone.</b>
                                </p>

                                <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '10px' }}>
                                    <button 
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="btn btn-ghost"
                                        style={{ flex: 1, justifyContent: 'center', background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={confirmDeleteAccount}
                                        className="btn"
                                        style={{ 
                                            flex: 1, justifyContent: 'center', 
                                            background: '#ef4444', color: 'white', border: 'none', fontWeight: '600', padding: '10px', borderRadius: '8px', cursor: 'pointer'
                                        }}
                                    >
                                        Yes, Delete My Account
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* EXPANDED LAYOUT CONTAINER */}
            <div style={{ padding: '40px 60px', maxWidth: '1800px', margin: '0 auto', width: '100%', color: '#e4e4e7' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>Account Settings</h1>

                <div style={{ display: 'flex', gap: '60px' }}>
                    {/* SIDEBAR TABS */}
                    <div style={{ width: '250px', flexShrink: 0 }}>
                        {[
                            { id: 'profile', icon: User, label: 'Profile' },
                            { id: 'notifications', icon: Bell, label: 'Notifications' },
                            { id: 'security', icon: Shield, label: 'Security' }
                        ].map(tab => (
                            <div 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{ 
                                    padding: '14px 20px', borderRadius: '10px', marginBottom: '8px', cursor: 'pointer',
                                    background: activeTab === tab.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                                    color: activeTab === tab.id ? 'white' : '#a1a1aa',
                                    display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500',
                                    transition: 'background 0.2s, color 0.2s'
                                }}
                            >
                                <tab.icon size={20} /> {tab.label}
                            </div>
                        ))}
                    </div>

                    {/* MAIN CONTENT AREA - Expands to fill space */}
                    <div style={{ flex: 1 }}>
                        {activeTab === 'profile' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} variants={containerVariants}>
                                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '25px', fontSize: '20px' }}>Profile Information</h3>
                                
                                <div style={{ display: 'flex', gap: '30px', marginBottom: '25px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a1a1aa' }}>First Name</label>
                                        <input 
                                            type="text" 
                                            value={firstName} 
                                            onChange={e => setFirstName(e.target.value)}
                                            className="glass-input" 
                                            style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '15px' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a1a1aa' }}>Last Name</label>
                                        <input 
                                            type="text" 
                                            value={lastName} 
                                            onChange={e => setLastName(e.target.value)}
                                            className="glass-input" 
                                            style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '15px' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a1a1aa' }}>Email Address</label>
                                    <input 
                                        type="email" 
                                        value={user.email} 
                                        disabled
                                        className="glass-input" 
                                        style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', opacity: 0.6, cursor: 'not-allowed', fontSize: '15px' }}
                                    />
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <button 
                                        onClick={handleProfileUpdate}
                                        disabled={loading}
                                        style={{ 
                                            background: '#3b82f6', color: 'white', border: 'none', 
                                            padding: '12px 24px', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer',
                                            fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '15px'
                                        }}
                                    >
                                        {loading ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
                                        Save Changes
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'notifications' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '25px', fontSize: '20px' }}>Notification Preferences</h3>
                                
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                    <div>
                                        <div style={{ fontWeight: '500', marginBottom: '4px', fontSize: '16px' }}>Pipeline Success</div>
                                        <div style={{ fontSize: '13px', color: '#a1a1aa' }}>Get alerted when a pipeline finishes successfully.</div>
                                    </div>
                                    <Toggle 
                                        checked={preferences.notify_on_success} 
                                        onChange={val => setPreferences({...preferences, notify_on_success: val})} 
                                    />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                    <div>
                                        <div style={{ fontWeight: '500', marginBottom: '4px', fontSize: '16px' }}>Pipeline Failure</div>
                                        <div style={{ fontSize: '13px', color: '#a1a1aa' }}>Get alerted immediately if a pipeline crashes.</div>
                                    </div>
                                    <Toggle 
                                        checked={preferences.notify_on_failure} 
                                        onChange={val => setPreferences({...preferences, notify_on_failure: val})} 
                                    />
                                </div>

                                <div style={{ textAlign: 'right', marginTop: '30px' }}>
                                    <button 
                                        onClick={handlePreferencesSave}
                                        disabled={loading}
                                        style={{ 
                                            background: '#3b82f6', color: 'white', border: 'none', 
                                            padding: '12px 24px', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer',
                                            fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '15px'
                                        }}
                                    >
                                        {loading ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
                                        Save Preferences
                                    </button>
                                </div>
                            </motion.div>
                        )}
                        
                        {activeTab === 'security' && (
                             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '25px', fontSize: '20px' }}>Password & Security</h3>

                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a1a1aa' }}>Current Password</label>
                                    <input 
                                        type="password" 
                                        placeholder="••••••••" 
                                        value={passData.currentPassword}
                                        onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                                        className="glass-input" 
                                        style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '15px' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '30px', marginBottom: '25px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a1a1aa' }}>New Password</label>
                                        <input 
                                            type="password" 
                                            placeholder="Enter new password" 
                                            value={passData.newPassword}
                                            onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                                            className="glass-input" 
                                            style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '15px' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a1a1aa' }}>Confirm Password</label>
                                        <input 
                                            type="password" 
                                            placeholder="Confirm new password" 
                                            value={passData.confirmPassword}
                                            onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                                            className="glass-input" 
                                            style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '15px' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', alignItems: 'center', marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                                     <button 
                                        className="btn btn-danger-outline"
                                        onClick={initiateDeleteAccount}
                                        style={{ 
                                            background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', 
                                            padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', marginRight: 'auto', fontSize: '14px'
                                        }}
                                    >
                                        Delete Account
                                    </button>

                                    <button 
                                        onClick={handlePasswordChange}
                                        style={{ 
                                            background: '#3b82f6', color: 'white', border: 'none', 
                                            padding: '12px 24px', borderRadius: '8px', cursor: 'pointer',
                                            fontWeight: '600', fontSize: '15px'
                                        }}
                                    >
                                        Update Password
                                    </button>
                                </div>
                             </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default SettingsPage;
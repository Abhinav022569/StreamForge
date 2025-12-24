import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Network, Users, Database, 
  HardDrive, Settings, LogOut, User, Menu, X 
} from 'lucide-react';
import logo from '../../assets/logo.png';
import '../../App.css';
import ChatAssistant from '../ChatAssistant';

const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ username: 'User' });
  
  // Mobile Responsiveness State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Monitor screen size to handle responsiveness dynamically
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false); // Reset sidebar state on desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Overview', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { label: 'All Pipelines', icon: <Network size={20} />, path: '/pipelines' },
    { label: 'Collaboration', icon: <Users size={20} />, path: '/collaboration' },
    { label: 'Data Sources', icon: <Database size={20} />, path: '/datasources' },
    { label: 'Processed Data', icon: <HardDrive size={20} />, path: '/processed' },
    { label: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <div className="app-container" style={{ background: '#0f1115', position: 'relative', overflow: 'hidden', display: 'flex', height: '100vh', flexDirection: 'row' }}>
      
      {/* Background Decor */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>

      {/* MOBILE HEADER (Visible only on mobile) */}
      {isMobile && (
        <div style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, 
          height: '60px', zIndex: 40, padding: '0 20px', 
          display: 'flex', alignItems: 'center',
          background: 'rgba(15, 17, 21, 0.95)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)'
        }}>
           <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Menu size={24} />
           </button>
           <span style={{ marginLeft: '15px', fontWeight: '700', color: 'white', fontSize: '18px' }}>StreamForge</span>
        </div>
      )}

      {/* SIDEBAR (Responsive) */}
      <motion.aside 
        className="sidebar"
        initial={false}
        animate={{ 
          x: isMobile && !isSidebarOpen ? -280 : 0,
          opacity: 1 
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
            background: 'rgba(24, 24, 27, 0.95)', 
            backdropFilter: 'blur(12px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',          
            flexDirection: 'column',  
            justifyContent: 'space-between',
            padding: 0,
            flexShrink: 0,
            width: '260px',
            position: isMobile ? 'absolute' : 'relative',
            zIndex: 50,
            height: '100vh',
            top: 0,
            left: 0,
            boxShadow: isMobile && isSidebarOpen ? '5px 0 15px rgba(0,0,0,0.5)' : 'none'
        }}
      >
        <div style={{ padding: '20px', position: 'relative' }}>
            
            {/* Close Button for Mobile */}
            {isMobile && (
              <button 
                onClick={() => setIsSidebarOpen(false)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            )}

            <div className="sidebar-logo" style={{ marginBottom: '40px', paddingLeft: '10px' }}>
              <img src={logo} alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '4px', boxShadow: '0 0 10px rgba(16,185,129,0.4)' }} />
              <span style={{ fontWeight: '700', letterSpacing: '0.5px' }}>StreamForge</span>
            </div>

            <nav className="sidebar-nav">
              {menuItems.map((item) => (
                <SidebarItem 
                  key={item.path}
                  label={item.label} 
                  icon={item.icon} 
                  active={location.pathname === item.path}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) setIsSidebarOpen(false); // Close menu on navigation
                  }} 
                />
              ))}
            </nav>
        </div>

        {/* User Footer Section */}
        <div style={{ 
            padding: '20px', 
            borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
            background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ 
                    width: '40px', height: '40px', 
                    borderRadius: '10px', 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 4px 10px rgba(16,185,129,0.2)'
                }}>
                    <User size={20} strokeWidth={2.5} />
                </div>
                <div style={{ overflow: 'hidden' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'white' }}>{user.username}</p>
                </div>
            </div>

            <motion.button 
                onClick={handleLogout}
                style={{ 
                    width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    background: 'rgba(239, 68, 68, 0.05)',
                    color: '#f87171',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
                whileHover={{ 
                    background: 'rgba(239, 68, 68, 0.15)', 
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    boxShadow: '0 0 15px rgba(239, 68, 68, 0.1)' 
                }}
                whileTap={{ scale: 0.98 }}
            >
                <LogOut size={16} />
                Logout
            </motion.button>
        </div>
      </motion.aside>

      {/* MOBILE OVERLAY (Click to close sidebar) */}
      {isMobile && isSidebarOpen && (
        <div 
            onClick={() => setIsSidebarOpen(false)}
            style={{ 
                position: 'absolute', inset: 0, 
                background: 'rgba(0,0,0,0.5)', 
                backdropFilter: 'blur(2px)',
                zIndex: 45 
            }}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="main-content" style={{ 
          position: 'relative', 
          zIndex: 1, 
          overflowY: 'auto', 
          flexGrow: 1, 
          height: '100%',
          paddingTop: isMobile ? '60px' : '0' // Add padding for header on mobile
      }}>
        {children}
      </main>
      <ChatAssistant />
    </div>
  );
};

const SidebarItem = ({ label, icon, active, onClick }) => (
  <motion.div 
    className={`sidebar-item ${active ? 'active' : ''}`} 
    onClick={onClick}
    whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.05)' }}
    whileTap={{ scale: 0.98 }}
    style={{ 
        cursor: 'pointer', 
        borderLeft: active ? '3px solid #10b981' : '3px solid transparent',
        background: active ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
        padding: '10px 15px',
        marginBottom: '5px',
        borderRadius: '0 6px 6px 0',
        color: active ? '#fff' : '#a1a1aa',
        transition: 'none',
        display: 'flex',
        alignItems: 'center'
    }}
  >
    <span style={{ marginRight: '12px', display: 'flex', alignItems: 'center', color: active ? '#10b981' : 'inherit' }}>{icon}</span>
    <span style={{ fontWeight: active ? '600' : '400', fontSize: '14px' }}>{label}</span>
  </motion.div>
);

export default AppLayout;
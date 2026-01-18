import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Network, Users, Database, 
  HardDrive, Settings, LogOut, User, Menu, X,
  Search 
} from 'lucide-react';
import logo from '../../assets/logo.png';
import '../../App.css';
import ChatAssistant from '../ChatAssistant';
import NotificationCenter from '../NotificationCenter'; 

const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ username: 'User' });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true); 
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Overview', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { label: 'All Pipelines', icon: <Network size={20} />, path: '/pipelines' },
    { label: 'Data Catalog', icon: <Search size={20} />, path: '/catalog' }, 
    { label: 'Collaboration', icon: <Users size={20} />, path: '/collaboration' },
    { label: 'Data Sources', icon: <Database size={20} />, path: '/datasources' },
    { label: 'Processed Data', icon: <HardDrive size={20} />, path: '/processed' },
    { label: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  const sidebarVariants = {
    desktop: { x: 0, opacity: 1, transition: { duration: 0.4 } },
    desktopHidden: { x: -20, opacity: 0 },
    mobile: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    mobileHidden: { x: -280, opacity: 0 }
  };

  return (
    <div className="app-container" style={{ background: '#0f1115', position: 'relative', overflow: 'hidden', display: 'flex', height: '100vh', flexDirection: isMobile ? 'column' : 'row' }}>
      
      {/* Background Decor */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>

      {/* MOBILE HEADER */}
      {isMobile && (
        <div className="mobile-header" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '15px 20px', background: 'rgba(24, 24, 27, 0.9)', 
          borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 50
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={logo} alt="Logo" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
            <span style={{ fontWeight: '700', color: 'white' }}>StreamForge</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
             <NotificationCenter /> 
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'transparent', border: 'none', color: 'white' }}>
               {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
          </div>
        </div>
      )}

      {/* SHARED SIDEBAR */}
      <AnimatePresence mode="wait">
        {(!isMobile || isSidebarOpen) && (
          <>
            {isMobile && <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />}
            <motion.aside 
              className={`sidebar ${isMobile ? 'mobile-sidebar' : ''}`}
              initial={isMobile ? "mobileHidden" : "desktopHidden"}
              animate={isMobile ? "mobile" : "desktop"}
              exit={isMobile ? "mobileHidden" : undefined}
              variants={sidebarVariants}
              style={{
                  background: 'rgba(24, 24, 27, 0.6)', 
                  backdropFilter: 'blur(12px)',
                  borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',          
                  flexDirection: 'column',  
                  justifyContent: 'space-between',
                  padding: 0,
                  flexShrink: 0,
                  width: '240px', 
                  // Mobile Overrides
                  position: isMobile ? 'fixed' : 'relative',
                  height: '100vh',
                  zIndex: 100,
                  top: 0, left: 0
              }}
            >
              <div style={{ padding: '16px' }}>
                  <div className="sidebar-logo" style={{ marginBottom: '24px', paddingLeft: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                       <img src={logo} alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '4px', boxShadow: '0 0 10px rgba(16,185,129,0.4)' }} />
                       <span style={{ fontWeight: '700', letterSpacing: '0.5px' }}>StreamForge</span>
                    </div>
                    {/* ADDED NOTIFICATION BELL FOR DESKTOP */}
                    {!isMobile && <NotificationCenter />}
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
                          if (isMobile) setIsSidebarOpen(false);
                        }} 
                      />
                    ))}
                  </nav>
              </div>

              <div style={{ 
                  padding: '16px', 
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
                  background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)',
                  width: '100%',
                  boxSizing: 'border-box'
              }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ 
                          width: '36px', height: '36px', 
                          borderRadius: '8px', 
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white',
                          boxShadow: '0 4px 10px rgba(16,185,129,0.2)'
                      }}>
                          <User size={18} strokeWidth={2.5} />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: 'white' }}>{user.username}</p>
                      </div>
                  </div>

                  <motion.button 
                      onClick={handleLogout}
                      style={{ 
                          width: '100%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          padding: '8px',
                          borderRadius: '8px',
                          border: '1px solid rgba(239, 68, 68, 0.15)',
                          background: 'rgba(239, 68, 68, 0.05)',
                          color: '#f87171',
                          fontSize: '12px',
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
                      <LogOut size={14} />
                      Logout
                  </motion.button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <main className="main-content" style={{ position: 'relative', zIndex: 1, overflowY: 'auto', flexGrow: 1, height: '100%' }}>
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
    whileHover={{ x: 3, backgroundColor: 'rgba(255,255,255,0.05)' }}
    whileTap={{ scale: 0.98 }}
    style={{ 
        cursor: 'pointer', 
        borderLeft: active ? '3px solid #10b981' : '3px solid transparent',
        background: active ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
        padding: '10px 12px', // Reduced padding
        marginBottom: '4px',
        borderRadius: '0 6px 6px 0',
        color: active ? '#fff' : '#a1a1aa',
        transition: 'none',
        display: 'flex',
        alignItems: 'center'
    }}
  >
    <span style={{ marginRight: '10px', display: 'flex', alignItems: 'center', color: active ? '#10b981' : 'inherit' }}>{icon}</span>
    <span style={{ fontWeight: active ? '600' : '400', fontSize: '13px' }}>{label}</span>
  </motion.div>
);

export default AppLayout;
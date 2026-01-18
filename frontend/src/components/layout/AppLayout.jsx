import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Network, Users, Database, 
  HardDrive, Settings, LogOut, Menu, X,
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
                  width: '260px', 
                  position: isMobile ? 'fixed' : 'relative',
                  height: '100vh',
                  zIndex: 100,
                  top: 0, left: 0
              }}
            >
              <div style={{ padding: '20px' }}>
                  <div className="sidebar-logo" style={{ marginBottom: '30px', paddingLeft: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <div style={{ position: 'relative' }}>
                          <img src={logo} alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', boxShadow: '0 0 15px rgba(16,185,129,0.3)' }} />
                       </div>
                       <span style={{ fontWeight: '800', letterSpacing: '0.5px', fontSize: '18px', background: 'linear-gradient(to right, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>StreamForge</span>
                    </div>
                    {!isMobile && <NotificationCenter />}
                  </div>

                  <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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

              {/* SASSY & PROFESSIONAL USER CARD */}
              <div style={{ padding: '20px' }}>
                  <motion.div 
                    whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.6)' }}
                    style={{ 
                        background: 'linear-gradient(160deg, rgba(39, 39, 42, 0.6) 0%, rgba(24, 24, 27, 0.95) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '20px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
                    }}
                  >
                      {/* Decorative Background Blur */}
                      <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(20px)' }} />

                      {/* User Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 1 }}>
                          <div style={{ position: 'relative' }}>
                             <div style={{ 
                                 width: '44px', height: '44px', 
                                 borderRadius: '14px', 
                                 background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                                 color: 'white', fontWeight: '800', fontSize: '18px',
                                 boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)',
                                 border: '1px solid rgba(255,255,255,0.1)'
                             }}>
                                 {user.username ? user.username[0].toUpperCase() : 'U'}
                             </div>
                             <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', background: '#10b981', borderRadius: '50%', border: '2px solid #18181b' }} />
                          </div>
                          
                          <div style={{ overflow: 'hidden', flex: 1 }}>
                              <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'white', letterSpacing: '0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user.username}
                              </p>
                          </div>
                      </div>

                      {/* Divider */}
                      <div style={{ width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />

                      {/* Logout Button */}
                      <motion.button 
                          onClick={handleLogout}
                          style={{ 
                              width: '100%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                              padding: '10px',
                              borderRadius: '12px',
                              border: '1px solid rgba(239, 68, 68, 0.15)',
                              background: 'rgba(239, 68, 68, 0.05)',
                              color: '#f87171',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              position: 'relative',
                              transition: 'all 0.2s'
                          }}
                          whileHover={{ 
                              background: 'rgba(239, 68, 68, 0.15)', 
                              borderColor: 'rgba(239, 68, 68, 0.4)',
                              boxShadow: '0 0 15px rgba(239, 68, 68, 0.15)',
                              scale: 1.02 
                          }}
                          whileTap={{ scale: 0.98 }}
                      >
                          <LogOut size={15} />
                          Sign Out
                      </motion.button>
                  </motion.div>
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
    whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.05)' }}
    whileTap={{ scale: 0.98 }}
    style={{ 
        cursor: 'pointer', 
        position: 'relative',
        background: active ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.02) 100%)' : 'transparent',
        padding: '12px 16px', 
        marginBottom: '0px',
        borderRadius: '12px',
        color: active ? '#fff' : '#a1a1aa',
        border: active ? '1px solid rgba(16, 185, 129, 0.1)' : '1px solid transparent',
        display: 'flex',
        alignItems: 'center',
        transition: 'background 0.2s ease, border 0.2s ease, color 0.2s ease' // CSS transition for basic props
    }}
  >
    {active && (
      <motion.div 
        layoutId="activeIndicator"
        transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 30 
        }}
        style={{
          position: 'absolute', 
          left: '0', 
          top: '0', 
          bottom: '0',
          width: '4px', 
          height: '100%', 
          background: '#10b981',
          borderRadius: '4px 0 0 4px',
          boxShadow: '0 0 10px rgba(16,185,129,0.5)',
          zIndex: 10
        }}
      />
    )}
    <span style={{ marginRight: '12px', display: 'flex', alignItems: 'center', color: active ? '#10b981' : 'inherit' }}>{icon}</span>
    <span style={{ fontWeight: active ? '600' : '500', fontSize: '14px' }}>{label}</span>
  </motion.div>
);

export default AppLayout;
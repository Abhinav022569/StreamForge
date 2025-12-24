import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { Menu, User, UserCircle } from 'lucide-react';
import logo from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';

const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Check screen size on load & resize
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-collapse sidebar on mobile, open on desktop
      setIsSidebarOpen(!mobile);
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Fetch user for the mobile header avatar
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        const user = JSON.parse(storedUser);
        setUsername(user.username || 'User');
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-container">
      {/* Sidebar Component */}
      {/* On mobile, we might want to overlay it or just toggle visibility */}
      <div 
        style={{ 
          display: isSidebarOpen ? 'block' : 'none',
          position: isMobile ? 'absolute' : 'relative',
          zIndex: 100,
          height: '100%',
          boxShadow: isMobile ? '5px 0 15px rgba(0,0,0,0.5)' : 'none'
        }}
      >
        <Sidebar onClose={isMobile ? () => setIsSidebarOpen(false) : undefined} />
      </div>

      <div className="main-content">
        {/* Mobile Header */}
        {isMobile && (
          <div style={{
            padding: '15px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(24, 24, 27, 0.8)',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            zIndex: 90
          }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button 
                  onClick={toggleSidebar}
                  style={{ background: 'transparent', border: 'none', color: 'white', padding: 0 }}
                >
                  <Menu size={24} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '18px' }}>
                   <img src={logo} alt="Logo" style={{ width: '24px', borderRadius: '4px' }} />
                   <span>StreamForge</span>
                </div>
             </div>

             {/* User Avatar - Quick Link to Settings */}
             <div onClick={() => navigate('/settings')} style={{ cursor: 'pointer' }}>
                {username ? (
                    <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', 
                        background: '#3f3f46', color: 'white', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 'bold'
                    }}>
                        {username.charAt(0).toUpperCase()}
                    </div>
                ) : (
                    <UserCircle size={28} color="#a1a1aa" />
                )}
             </div>
          </div>
        )}

        {/* Desktop Header Toggle (optional, if you want a collapse button on desktop too) */}
        {!isMobile && (
           <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--border-color)', display: 'none' }}>
              <button onClick={toggleSidebar} className="btn btn-ghost">
                 <Menu size={20} />
              </button>
           </div>
        )}

        {/* Main Page Content */}
        <div className="content-wrapper">
          {children}
        </div>
      </div>

      {/* Mobile Overlay for Sidebar */}
      {isMobile && isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 99
          }}
        ></div>
      )}
    </div>
  );
};

export default AppLayout;
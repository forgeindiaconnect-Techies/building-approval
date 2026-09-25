import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  HardHat, 
  MapPin, 
  BarChart2, 
  Settings, 
  Users, 
  UserPlus, 
  Files, 
  Clock, 
  UserCircle, 
  Building, 
  Building2, 
  Bell, 
  LogOut, 
  User,
  X,
  ChevronLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    currentUser, 
    logout, 
    themeSettings,
    isSidebarOpen,
    isMobileSidebarOpen,
    closeMobileSidebar,
    toggleSidebar
  } = useApp();
  const isAdmin = currentUser === 'Admin';

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 1024 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarBg = themeSettings 
    ? (isAdmin ? (themeSettings.adminSidebarBg || '#0F2A4A') : (themeSettings.workerSidebarBg || themeSettings.adminSidebarBg || '#0F2A4A'))
    : '#0F2A4A';
  const activeColor = themeSettings?.sidebarActiveColor || '#D97706';

  const handleLogout = () => {
    logout();
    if (closeMobileSidebar) closeMobileSidebar();
    navigate('/login');
  };

  const adminLinks = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/applications', label: 'Applications', icon: FileText },
    { path: '/admin/documents', label: 'Documents', icon: Files },
    { path: '/admin/workers', label: 'Workers', icon: UserPlus },
    { path: '/admin/worker-tracking', label: 'Worker Tracking', icon: Users },
    { path: '/admin/attendance', label: 'Worker Attendance', icon: Clock },
    { path: '/admin/daily-reports', label: 'Daily Reports', icon: BarChart2 },
    { path: '/admin/notifications', label: 'Notifications', icon: Bell },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const workerLinks = [
    { path: '/worker', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/worker/applications', label: 'My Applications', icon: FileText },
    { path: '/worker/documents', label: 'Documents', icon: Files },
    { path: '/worker/attendance', label: 'Attendance', icon: Clock },
    { path: '/worker/daily-reports', label: 'Daily Reports', icon: BarChart2 },
    { path: '/worker/notifications', label: 'Notifications', icon: Bell },
    { path: '/worker/profile', label: 'Profile', icon: UserCircle },
  ];

  const links = isAdmin ? adminLinks : workerLinks;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div 
          onClick={closeMobileSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 999,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      <aside style={{ 
        width: isMobile ? '260px' : (isSidebarOpen ? '230px' : '0px'), 
        height: '100vh', 
        position: isMobile ? 'fixed' : 'sticky', 
        top: 0, 
        left: 0,
        bottom: 0,
        transform: isMobile ? (isMobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
        flexShrink: 0, 
        backgroundColor: sidebarBg, 
        color: 'white', 
        display: 'flex', 
        flexDirection: 'column', 
        boxShadow: isMobile ? (isMobileSidebarOpen ? '0 20px 40px rgba(0,0,0,0.5)' : 'none') : (isSidebarOpen ? 'var(--shadow-lg)' : 'none'), 
        zIndex: 1000,
        overflow: 'hidden',
        transition: isMobile 
          ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease' 
          : 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, background-color 0.3s ease',
        visibility: (!isMobile && !isSidebarOpen) ? 'hidden' : 'visible',
        opacity: (!isMobile && !isSidebarOpen) ? 0 : 1
      }}>
        {/* Sidebar Header */}
        <div style={{ 
          padding: '1rem 1.25rem', 
          borderBottom: '1px solid rgba(255,255,255,0.1)', 
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minWidth: '230px'
        }}>
          <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: activeColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={17} color="#FFFFFF" />
            </div>
            BuildPermit
          </h2>

          {/* Close/Collapse button */}
          <button
            onClick={isMobile ? closeMobileSidebar : toggleSidebar}
            aria-label="Close sidebar"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              borderRadius: '6px',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'}
          >
            {isMobile ? <X size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        
        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', overflowY: 'auto', minWidth: '230px' }}>
          {links.map(link => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                onClick={() => {
                  if (isMobile && closeMobileSidebar) closeMobileSidebar();
                }}
                style={{
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  padding: '0.65rem 0.85rem', 
                  borderRadius: '10px',
                  color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.78)',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
                  borderLeft: isActive ? `3.5px solid ${activeColor}` : '3.5px solid transparent',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '0.865rem',
                  textDecoration: 'none', 
                  transition: 'all 0.18s ease',
                  backdropFilter: isActive ? 'blur(4px)' : 'none'
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.78)';
                  }
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '24px', 
                  height: '24px',
                  color: isActive ? activeColor : 'rgba(255, 255, 255, 0.75)'
                }}>
                  <Icon size={18} />
                </div>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Side Nav Logout Footer */}
        <div style={{ padding: '1rem 0.85rem', borderTop: '1px solid rgba(255,255,255,0.12)', backgroundColor: 'rgba(0,0,0,0.15)', flexShrink: 0, minWidth: '230px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'white' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={15} color={activeColor} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser ? (currentUser.includes('@') ? currentUser.split('@')[0] : currentUser).replace(/^\w/, c => c.toUpperCase()) : 'User'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.65)' }}>{isAdmin ? 'Administrator' : 'Field Worker'}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem', 
              fontSize: '0.825rem',
              fontWeight: '600',
              color: '#ffffff',
              backgroundColor: '#dc2626',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}

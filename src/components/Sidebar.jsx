import React from 'react';
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
  User
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useApp();
  const isAdmin = currentUser === 'Admin';

  const handleLogout = () => {
    logout();
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
    <aside style={{ width: '230px', height: '100vh', position: 'sticky', top: 0, flexShrink: 0, backgroundColor: 'var(--primary)', color: 'white', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)', zIndex: 100 }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
        <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={17} color="#FFFFFF" />
          </div>
          BuildPermit
        </h2>
      </div>
      
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
        {links.map(link => {
          const isActive = location.pathname === link.path;
          return (
            <Link key={link.path} to={link.path} style={{
              display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)',
              color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
              backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderLeft: isActive ? '4px solid var(--warning)' : '4px solid transparent',
              fontWeight: isActive ? '600' : '500',
              fontSize: '0.85rem',
              textDecoration: 'none', transition: 'all 0.2s ease'
            }}>
              <link.icon size={17} /> {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Side Nav Logout Footer */}
      <div style={{ padding: '1rem 0.85rem', borderTop: '1px solid rgba(255,255,255,0.12)', backgroundColor: 'rgba(0,0,0,0.15)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'white' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={15} color="var(--warning)" />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>{isAdmin ? 'Administrator' : 'Field Worker'}</div>
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
  );
}

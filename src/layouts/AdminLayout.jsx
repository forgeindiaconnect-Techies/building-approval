import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, LogOut, Building, User, Calendar, BarChart2, Users } from 'lucide-react';

export default function AdminLayout() {
  const { currentUser, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--background)' }}>
      {/* Sidebar */}
      <aside style={{ width: '230px', height: '100vh', position: 'sticky', top: 0, flexShrink: 0, backgroundColor: 'var(--primary)', color: 'white', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)', zIndex: 100 }}>
        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
          <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>
            <Building size={20} color="var(--warning)" />
            ApprovalTrack
          </h2>
        </div>
        
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
          <Link to="/admin" style={{
            display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)',
            color: location.pathname === '/admin' ? 'white' : 'rgba(255,255,255,0.7)',
            backgroundColor: location.pathname === '/admin' ? 'rgba(255,255,255,0.1)' : 'transparent',
            borderLeft: location.pathname === '/admin' ? '4px solid var(--warning)' : '4px solid transparent',
            fontWeight: location.pathname === '/admin' ? '600' : '500',
            fontSize: '0.85rem',
            textDecoration: 'none', transition: 'all 0.2s ease'
          }}>
            <LayoutDashboard size={17} /> Dashboard
          </Link>
          <Link to="/admin/today-report" style={{
            display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)',
            color: location.pathname === '/admin/today-report' ? 'white' : 'rgba(255,255,255,0.7)',
            backgroundColor: location.pathname === '/admin/today-report' ? 'rgba(255,255,255,0.1)' : 'transparent',
            borderLeft: location.pathname === '/admin/today-report' ? '4px solid var(--warning)' : '4px solid transparent',
            fontWeight: location.pathname === '/admin/today-report' ? '600' : '500',
            fontSize: '0.85rem',
            textDecoration: 'none', transition: 'all 0.2s ease'
          }}>
            <Calendar size={17} /> Today's Report
          </Link>
          <Link to="/admin/overall-report" style={{
            display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)',
            color: location.pathname === '/admin/overall-report' ? 'white' : 'rgba(255,255,255,0.7)',
            backgroundColor: location.pathname === '/admin/overall-report' ? 'rgba(255,255,255,0.1)' : 'transparent',
            borderLeft: location.pathname === '/admin/overall-report' ? '4px solid var(--warning)' : '4px solid transparent',
            fontWeight: location.pathname === '/admin/overall-report' ? '600' : '500',
            fontSize: '0.85rem',
            textDecoration: 'none', transition: 'all 0.2s ease'
          }}>
            <BarChart2 size={17} /> Overall Report
          </Link>
          {currentUser === 'Admin' && (
            <Link to="/admin/workers" style={{
              display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)',
              color: location.pathname === '/admin/workers' ? 'white' : 'rgba(255,255,255,0.7)',
              backgroundColor: location.pathname === '/admin/workers' ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderLeft: location.pathname === '/admin/workers' ? '4px solid var(--warning)' : '4px solid transparent',
              fontWeight: location.pathname === '/admin/workers' ? '600' : '500',
              fontSize: '0.85rem',
              textDecoration: 'none', transition: 'all 0.2s ease'
            }}>
              <Users size={17} /> Workers
            </Link>
          )}
        </nav>

        <div style={{ padding: '1rem 0.85rem', borderTop: '1px solid rgba(255,255,255,0.12)', backgroundColor: 'rgba(0,0,0,0.15)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'white' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={15} color="var(--warning)" />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>Administrator</div>
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

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ flexShrink: 0, position: 'sticky', top: 0, zIndex: 90, width: '100%', backgroundColor: 'white', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.2rem 1.5rem', fontSize: '0.7rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <span>Government of Tamil Nadu | Official Portal</span>
          </div>
          <header style={{ backgroundColor: 'white', padding: '0.65rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>Building Approval Portal</h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Department of Municipal Administration</p>
            </div>
            <div className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
              {currentUser} Session
            </div>
          </header>
        </div>
        
        <div style={{ flex: 1, padding: '1.5rem 2rem', overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

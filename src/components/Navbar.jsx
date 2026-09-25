import React, { useState, useRef, useEffect } from 'react';
import { User, Bell, CheckCircle, Zap, RotateCcw, Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import LiveToastContainer from './LiveToastContainer';
import { API_BASE_URL } from '../config/api';

export default function Navbar() {
  const { 
    currentUser, 
    logout, 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    isRealTimeEnabled, 
    toggleRealTime, 
    lastLiveSync, 
    triggerRandomLiveEvent,
    resetToCleanData,
    themeSettings,
    toggleSidebar,
    isSidebarOpen,
    isMobileSidebarOpen
  } = useApp();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const myRole = currentUser === 'Admin' ? 'Admin' : 'worker';
  const myNotifications = notifications.filter(n => n.role === myRole).slice(0, 5);
  const unreadCount = notifications.filter(n => n.role === myRole && !n.read).length;
  const activeColor = themeSettings?.sidebarActiveColor || '#D97706';

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 90, flexShrink: 0, width: '100%', backgroundColor: 'white', boxShadow: 'var(--shadow-sm)' }}>
      <LiveToastContainer />
      <header className="app-navbar-header" style={{ backgroundColor: 'white', padding: '0.65rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
        
        {/* Left Side: Hamburger Menu & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
          <button
            onClick={toggleSidebar}
            aria-label="Toggle Navigation Menu"
            title="Toggle Sidebar Menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: '#f8fafc',
              color: 'var(--primary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-light)';
              e.currentTarget.style.borderColor = activeColor;
              e.currentTarget.style.color = activeColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--primary)';
            }}
          >
            <Menu size={19} strokeWidth={2.5} />
          </button>

          <div style={{ cursor: 'pointer', minWidth: 0, flexShrink: 1 }} onClick={() => navigate('/')}>
            <h1 className="navbar-portal-title" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F2A4A', margin: 0, whiteSpace: 'nowrap' }}>
              <span className="portal-title-desktop">Building Approval Portal</span>
              <span className="portal-title-mobile">BuildApp</span>
            </h1>
            <p className="navbar-portal-sub" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Department of Municipal Administration
            </p>
          </div>
        </div>

        {/* Right Side: Actions, Notifications & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>

          {/* Notifications Dropdown */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                cursor: 'pointer',
                position: 'relative',
                color: 'var(--text-muted)',
                padding: '0.35rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{ 
                  position: 'absolute', 
                  top: '0', 
                  right: '0',
                  backgroundColor: activeColor, 
                  color: 'white', 
                  fontSize: '0.6rem', 
                  fontWeight: 'bold',
                  borderRadius: '50%', 
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showDropdown && (
              <div style={{ 
                position: 'absolute', 
                top: 'calc(100% + 0.5rem)', 
                right: '-1rem', 
                width: 'min(320px, 90vw)', 
                backgroundColor: 'white', 
                borderRadius: 'var(--radius-md)', 
                boxShadow: 'var(--shadow-lg)', 
                border: '1px solid var(--border)',
                zIndex: 50,
                overflow: 'hidden'
              }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontWeight: 600, fontSize: '0.875rem' }}>Notifications</h3>
                  <button 
                    onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Mark all as read
                  </button>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {myNotifications.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <CheckCircle size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.2 }} />
                      <p style={{ fontSize: '0.875rem' }}>No new notifications</p>
                    </div>
                  ) : (
                    myNotifications.map((n, idx) => (
                      <div 
                        key={n.id ? `${n.id}-${idx}` : `navbar-notif-${idx}`}
                        onClick={() => {
                          if (!n.read) markAsRead(n.id);
                          setShowDropdown(false);
                          const basePath = currentUser === 'Admin' ? '/admin' : '/worker';
                          navigate(`${basePath}/notifications`);
                        }}
                        style={{ 
                          padding: '1rem', 
                          borderBottom: '1px solid var(--border)',
                          backgroundColor: n.read ? 'transparent' : 'rgba(10, 52, 105, 0.03)',
                          cursor: 'pointer',
                          display: 'flex',
                          gap: '0.75rem',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <div style={{ marginTop: '0.25rem' }}>
                          {n.read ? <span style={{ color: 'var(--text-muted)' }}>○</span> : <span style={{ color: 'var(--primary)' }}>●</span>}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: n.read ? 500 : 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                            {n.type.replace(/_/g, ' ')}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                            {n.targetId}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div 
                  onClick={() => {
                    setShowDropdown(false);
                    navigate(currentUser === 'Admin' ? '/admin/notifications' : '/worker/notifications');
                  }}
                  style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 500, backgroundColor: 'var(--primary-light)' }}
                >
                  View all notifications
                </div>
              </div>
            )}
          </div>

          {/* Test Brevo Email Button */}
          <button
            className="navbar-btn-brevo"
            onClick={async () => {
              const testEmail = prompt('Enter recipient email address to test real-time Brevo delivery:', 'forgeindiaconnectfic@gmail.com');
              if (!testEmail || !testEmail.includes('@')) {
                if (testEmail) alert('Please enter a valid email address.');
                return;
              }
              try {
                const res = await fetch(`${API_BASE_URL}/api/brevo/test-email`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    toEmail: testEmail,
                    toName: currentUser || 'Building Approval User',
                    subject: '⚡ Real-Time Brevo Email Test - Building Approval System',
                    message: 'Congratulations! Your Brevo integration in the Building Approval System is working and delivering real-time emails successfully.'
                  })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                  alert(`✅ SUCCESS: Brevo email successfully dispatched to ${testEmail}!\n\nResponse: ${JSON.stringify(data.brevoResponse || data.message)}`);
                } else {
                  alert(`❌ Brevo delivery error:\n${data.error || JSON.stringify(data)}`);
                }
              } catch (err) {
                alert(`❌ Connection error: Could not reach backend at ${API_BASE_URL}.\n${err.message}`);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              padding: '0.35rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            title="Send test email via Brevo"
          >
            📧 <span className="btn-brevo-text">Test Brevo</span>
          </button>

          {/* User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-main)' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
              <User size={15} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', lineHeight: '1.2', whiteSpace: 'nowrap' }}>
                {currentUser ? (currentUser.includes('@') ? currentUser.split('@')[0] : currentUser).replace(/^\w/, c => c.toUpperCase()) : 'Admin'}
              </div>
              <div className="navbar-user-role" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: '1.2' }}>
                {currentUser === 'Admin' ? 'Administrator' : 'Field Worker'}
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

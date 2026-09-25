import React, { useState, useRef, useEffect } from 'react';
import { User, Bell, CheckCircle, Zap, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import LiveToastContainer from './LiveToastContainer';

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
    resetToCleanData
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

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 90, flexShrink: 0, width: '100%', backgroundColor: 'white', boxShadow: 'var(--shadow-sm)' }}>
      <LiveToastContainer />
      <header style={{ backgroundColor: 'white', padding: '0.65rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>Building Approval Portal</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Department of Municipal Administration</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>

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
                padding: '0.35rem'
              }}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{ 
                  position: 'absolute', 
                  top: '0',
                  right: '0',
                  backgroundColor: 'var(--warning)', 
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
                width: '320px', 
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
                    myNotifications.map(n => (
                      <div 
                        key={n.id}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <User size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.8rem', lineHeight: '1.2' }}>{currentUser}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.2' }}>{currentUser === 'Admin' ? 'Administrator' : 'Field Worker'}</div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

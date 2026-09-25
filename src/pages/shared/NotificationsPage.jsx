import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCircle, FileText, HardHat, Check, Clock, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationsPage() {
  const { notifications, currentUser, markAsRead, markAllAsRead } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  // Format current worker name nicely
  const workerDisplayName = currentUser === 'Pooja' || currentUser === 'pooja@gmail.com' ? 'Pooja' : currentUser;

  // Filter notifications for current user role
  const myRole = currentUser === 'Admin' ? 'Admin' : 'worker';
  let myNotifications = notifications.filter(n => n.role === myRole);

  if (filter === 'Unread') {
    myNotifications = myNotifications.filter(n => !n.read);
  }

  const unreadCount = notifications.filter(n => n.role === myRole && !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'NEW_APPLICATION': return <FileText size={18} color="#003366" />;
      case 'DOCUMENT_UPLOADED': return <FileText size={18} color="#FF9933" />;
      case 'SITE_VISIT_COMPLETED': return <HardHat size={18} color="#138808" />;
      case 'SITE_VISIT_ASSIGNED': return <HardHat size={18} color="#0284c7" />;
      default: return <Bell size={18} color="#003366" />;
    }
  };

  const handleNotificationClick = (n) => {
    if (!n.read) markAsRead(n.id);
    const basePath = currentUser === 'Admin' ? '/admin' : '/worker';
    if (n.type.includes('SITE_VISIT')) {
      navigate(`${basePath}/site-visit/${n.targetId}`);
    } else if (n.type.includes('DOCUMENT')) {
      navigate(`${basePath}/documents`);
    } else {
      navigate(`${basePath}/application/${n.targetId}`);
    }
  };

  const formatTime = (iso) => {
    if (!iso) return 'Just now';
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ paddingBottom: '2.5rem' }}>

      {/* Header Banner - Compact font sizes */}
      <div style={{
        background: 'linear-gradient(135deg, #003366 0%, #004080 100%)',
        color: 'white',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.25rem',
        boxShadow: '0 6px 18px rgba(0, 51, 102, 0.12)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.18)', padding: '0.15rem 0.55rem', borderRadius: '14px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px' }}>
              NOTIFICATION VAULT
            </span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>•</span>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.78rem' }}>{workerDisplayName}</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#ffffff', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            System Alerts & Updates
            {unreadCount > 0 && (
              <span style={{ backgroundColor: '#FF9933', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '14px' }}>
                {unreadCount} Unread
              </span>
            )}
          </h2>
          <p style={{ margin: '0.2rem 0 0 0', color: 'rgba(255,255,255,0.85)', fontSize: '0.825rem' }}>
            Live status alerts for newly submitted building applications, document uploads, and site visits.
          </p>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              padding: '0.55rem 1rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backdropFilter: 'blur(8px)'
            }}
          >
            <Check size={14} /> Mark All Read
          </button>
        )}
      </div>

      {/* Main Container Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        overflow: 'hidden'
      }}>
        {/* Toolbar Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.85rem'
        }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button 
              onClick={() => setFilter('All')}
              style={{
                backgroundColor: filter === 'All' ? '#003366' : '#ffffff',
                color: filter === 'All' ? '#ffffff' : '#475569',
                border: filter === 'All' ? 'none' : '1px solid #cbd5e1',
                padding: '0.35rem 0.85rem',
                borderRadius: '16px',
                fontSize: '0.785rem',
                fontWeight: filter === 'All' ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              All ({notifications.filter(n => n.role === myRole).length})
            </button>
            <button 
              onClick={() => setFilter('Unread')}
              style={{
                backgroundColor: filter === 'Unread' ? '#003366' : '#ffffff',
                color: filter === 'Unread' ? '#ffffff' : '#475569',
                border: filter === 'Unread' ? 'none' : '1px solid #cbd5e1',
                padding: '0.35rem 0.85rem',
                borderRadius: '16px',
                fontSize: '0.785rem',
                fontWeight: filter === 'Unread' ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <span style={{ fontSize: '0.785rem', color: '#64748b' }}>
            {myNotifications.length} Alert{myNotifications.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Notifications List Feed */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {myNotifications.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
              <CheckCircle size={40} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
                You're caught up!
              </h4>
              <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
                No unread system alerts found.
              </p>
            </div>
          ) : (
            myNotifications.map((n) => (
              <div 
                key={n.id} 
                onClick={() => handleNotificationClick(n)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '1rem', 
                  padding: '1rem 1.25rem', 
                  borderBottom: '1px solid #f1f5f9',
                  backgroundColor: n.read ? '#ffffff' : '#f0f7ff',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                {!n.read && (
                  <div style={{
                    position: 'absolute',
                    left: '0.4rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '5px',
                    height: '20px',
                    borderRadius: '3px',
                    backgroundColor: '#003366'
                  }} />
                )}

                <div style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '10px', 
                  backgroundColor: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  border: '1px solid #e2e8f0',
                  flexShrink: 0
                }}>
                  {getIcon(n.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.15rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: 800, color: '#003366', fontSize: '0.85rem' }}>
                        {n.targetId}
                      </span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#e2e8f0', color: '#475569', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        {n.type.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} /> {formatTime(n.timestamp)}
                    </span>
                  </div>

                  <p style={{ color: n.read ? '#475569' : '#0f172a', fontWeight: n.read ? 400 : 600, fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>
                    {n.message}
                  </p>
                </div>

                <ExternalLink size={14} color="#94a3b8" style={{ marginTop: '0.25rem', flexShrink: 0 }} />
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, 
  CheckCircle2, 
  FileText, 
  HardHat, 
  Check, 
  Clock, 
  ExternalLink, 
  Search, 
  Trash2, 
  Files, 
  Building2, 
  ShieldCheck, 
  AlertTriangle,
  MailCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationsPage() {
  const { notifications = [], setNotifications, currentUser, markAsRead, markAllAsRead } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Format current worker name nicely
  const cleanUserName = currentUser ? (currentUser.includes('@') ? currentUser.split('@')[0] : currentUser) : 'User';
  const workerDisplayName = cleanUserName.replace(/^\w/, c => c.toUpperCase());

  // Filter notifications for current user role
  const myRole = currentUser === 'Admin' ? 'Admin' : 'worker';
  const roleNotifications = notifications.filter(n => n.role === myRole);

  const unreadCount = roleNotifications.filter(n => !n.read).length;
  const appAlertsCount = roleNotifications.filter(n => n.type && (n.type.includes('APPLICATION') || n.type.includes('STAGE'))).length;
  const docAlertsCount = roleNotifications.filter(n => n.type && (n.type.includes('DOCUMENT') || n.type.includes('REUPLOAD'))).length;
  const visitAlertsCount = roleNotifications.filter(n => n.type && n.type.includes('SITE_VISIT')).length;

  const getIconConfig = (type = '') => {
    if (type.includes('APPLICATION')) {
      return { icon: FileText, color: '#2563eb', bg: '#eff6ff', label: 'Application' };
    }
    if (type.includes('DOCUMENT')) {
      return { icon: Files, color: '#f59e0b', bg: '#fffbeb', label: 'Document' };
    }
    if (type.includes('SITE_VISIT')) {
      return { icon: HardHat, color: '#10b981', bg: '#ecfdf5', label: 'Site Inspection' };
    }
    if (type.includes('EMAIL')) {
      return { icon: MailCheck, color: '#8b5cf6', bg: '#f5f3ff', label: 'Email Dispatch' };
    }
    return { icon: Bell, color: 'var(--primary)', bg: '#f1f5f9', label: 'System Alert' };
  };

  const handleNotificationClick = (n) => {
    if (!n.read) markAsRead(n.id);
    const basePath = currentUser === 'Admin' ? '/admin' : '/worker';
    if (n.type && n.type.includes('SITE_VISIT')) {
      navigate(`${basePath}/site-visit/${n.targetId}`);
    } else if (n.type && n.type.includes('DOCUMENT')) {
      navigate(`${basePath}/documents`);
    } else {
      navigate(`${basePath}/application/${n.targetId}`);
    }
  };

  const formatTime = (iso) => {
    if (!iso) return 'Just now';
    try {
      const date = new Date(iso);
      const isToday = new Date().toDateString() === date.toDateString();
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return isToday ? `${timeStr} • Today` : `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
    } catch {
      return 'Recently';
    }
  };

  // Filtered notifications feed
  const filteredNotifications = roleNotifications.filter(n => {
    let matchesCategory = true;
    if (filter === 'Unread') matchesCategory = !n.read;
    else if (filter === 'Applications') matchesCategory = n.type && (n.type.includes('APPLICATION') || n.type.includes('STAGE'));
    else if (filter === 'Documents') matchesCategory = n.type && (n.type.includes('DOCUMENT') || n.type.includes('REUPLOAD'));
    else if (filter === 'Site Visits') matchesCategory = n.type && n.type.includes('SITE_VISIT');

    const searchLow = searchTerm.toLowerCase();
    const matchesSearch = 
      !searchTerm ||
      (n.targetId && n.targetId.toLowerCase().includes(searchLow)) ||
      (n.message && n.message.toLowerCase().includes(searchLow)) ||
      (n.type && n.type.toLowerCase().includes(searchLow));

    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      
      {/* Top Header Banner */}
      <div 
        className="notif-header-banner"
        style={{ 
          backgroundColor: '#ffffff', 
          border: '1px solid var(--border)', 
          padding: '1.5rem 1.75rem', 
          borderRadius: '16px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1.25rem' 
        }}
      >
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ 
              padding: '0.2rem 0.6rem', 
              borderRadius: '999px', 
              fontSize: '0.72rem', 
              fontWeight: 700, 
              backgroundColor: '#eff6ff', 
              color: '#2563eb',
              border: '1px solid #bfdbfe'
            }}>
              LIVE ACTIVITY FEED
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>• {workerDisplayName}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
            <h2 className="notif-header-title" style={{ fontWeight: 800, color: 'var(--canvas-title, #0F172A)', margin: 0 }}>
              System Alerts & Updates
            </h2>
            {unreadCount > 0 && (
              <span style={{ 
                fontSize: '0.72rem', 
                fontWeight: 800, 
                backgroundColor: '#fef3c7', 
                color: '#b45309', 
                padding: '0.2rem 0.6rem', 
                borderRadius: '999px',
                border: '1px solid #fde68a',
                whiteSpace: 'nowrap'
              }}>
                {unreadCount} Unread
              </span>
            )}
          </div>

          <p style={{ color: 'var(--canvas-sub, #475569)', fontSize: '0.85rem', margin: 0, lineHeight: 1.45 }}>
            Real-time notifications for newly submitted building applications, document scrutiny, and inspection orders.
          </p>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="btn btn-primary notif-mark-read-btn"
            style={{ 
              fontSize: '0.825rem', 
              padding: '0.55rem 1.15rem', 
              fontWeight: 700, 
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              whiteSpace: 'nowrap'
            }}
          >
            <Check size={16} /> Mark All as Read
          </button>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="notif-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        
        {/* Total Notifications */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '14px', 
          border: '1px solid var(--border)', 
          padding: '1.15rem 1.25rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Alerts
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem', lineHeight: 1 }}>
              {roleNotifications.length}
            </div>
          </div>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '12px', 
            backgroundColor: '#f1f5f9', 
            color: '#475569', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Bell size={22} />
          </div>
        </div>

        {/* Unread Alerts */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '14px', 
          border: '1px solid #fef3c7', 
          padding: '1.15rem 1.25rem',
          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div>
            <span style={{ fontSize: '0.725rem', color: '#b45309', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Unread Alerts
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#d97706', marginTop: '0.2rem', lineHeight: 1 }}>
              {unreadCount}
            </div>
          </div>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '12px', 
            backgroundColor: '#fffbeb', 
            color: '#d97706', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid #fde68a'
          }}>
            <Clock size={22} />
          </div>
        </div>

        {/* Application Updates */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '14px', 
          border: '1px solid #bfdbfe', 
          padding: '1.15rem 1.25rem',
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div>
            <span style={{ fontSize: '0.725rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Applications
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#2563eb', marginTop: '0.2rem', lineHeight: 1 }}>
              {appAlertsCount}
            </div>
          </div>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '12px', 
            backgroundColor: '#eff6ff', 
            color: '#2563eb', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid #bfdbfe'
          }}>
            <FileText size={22} />
          </div>
        </div>

        {/* Documents & Site Visits */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '14px', 
          border: '1px solid #bbf7d0', 
          padding: '1.15rem 1.25rem',
          boxShadow: '0 2px 8px rgba(34, 197, 94, 0.08)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div>
            <span style={{ fontSize: '0.725rem', color: '#15803d', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Documents & Visits
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#16a34a', marginTop: '0.2rem', lineHeight: 1 }}>
              {docAlertsCount + visitAlertsCount}
            </div>
          </div>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '12px', 
            backgroundColor: '#f0fdf4', 
            color: '#16a34a', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid #bbf7d0'
          }}>
            <ShieldCheck size={22} />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div 
        className="notif-toolbar-card"
        style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '14px', 
          border: '1px solid var(--border)', 
          padding: '0.75rem 1rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '0.75rem',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ position: 'relative', width: '100%', flex: '1 1 220px', minWidth: 0 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search alerts by App ID or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              paddingLeft: '2.25rem', 
              fontSize: '0.85rem', 
              borderRadius: '999px',
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border)',
              width: '100%'
            }}
          />
        </div>

        {/* Filter Pills */}
        <div className="notif-filter-pills">
          {[
            { id: 'All', label: 'All Alerts', count: roleNotifications.length },
            { id: 'Unread', label: 'Unread', count: unreadCount },
            { id: 'Applications', label: 'Applications', count: appAlertsCount },
            { id: 'Documents', label: 'Documents', count: docAlertsCount },
            { id: 'Site Visits', label: 'Site Visits', count: visitAlertsCount }
          ].map(tab => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`notif-filter-pill-btn ${isActive ? 'active' : ''}`}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: isActive ? '1px solid transparent' : '1px solid var(--border)',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'var(--primary)' : '#f8fafc',
                  color: isActive ? '#ffffff' : 'var(--text-main)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
              >
                <span>{tab.label}</span>
                <span style={{ 
                  fontSize: '0.7rem', 
                  padding: '0.1rem 0.4rem', 
                  borderRadius: '999px', 
                  backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                  color: isActive ? '#ffffff' : 'var(--text-muted)'
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications Card Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredNotifications.map((n, idx) => {
          const iconConf = getIconConfig(n.type);
          const IconComp = iconConf.icon;

          return (
            <div 
              key={n.id ? `${n.id}-${idx}` : `notif-${idx}`} 
              onClick={() => handleNotificationClick(n)}
              className={`doc-card-hover notification-item-card ${n.read ? 'read' : 'unread'}`}
            >
              {/* Left Accent indicator for Unread */}
              {!n.read && (
                <div className="notif-unread-bar" />
              )}

              {/* Icon + Message Info */}
              <div className="notif-card-main">
                <div 
                  className="notif-icon-box"
                  style={{ 
                    backgroundColor: iconConf.bg, 
                    color: iconConf.color,
                    border: `1px solid ${iconConf.color}25`
                  }}
                >
                  <IconComp size={18} />
                </div>

                <div className="notif-content-box">
                  <div className="notif-header-badges">
                    <span className="notif-target-id">
                      {n.targetId}
                    </span>

                    <span className="notif-type-tag">
                      {iconConf.label}
                    </span>

                    {!n.read && (
                      <span className="notif-new-badge">
                        NEW
                      </span>
                    )}
                  </div>

                  <p className="notif-message-text" style={{ 
                    color: n.read ? '#475569' : 'var(--text-main)', 
                    fontWeight: n.read ? 500 : 700 
                  }}>
                    {n.message}
                  </p>
                </div>
              </div>

              {/* Right / Bottom Side: Timestamp & View Link */}
              <div className="notif-card-meta">
                <span className="notif-timestamp">
                  <Clock size={12} style={{ color: '#94a3b8' }} /> {formatTime(n.timestamp)}
                </span>

                <div className="notif-view-btn">
                  View <ExternalLink size={12} />
                </div>
              </div>
            </div>
          );
        })}

        {filteredNotifications.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem', 
            backgroundColor: '#ffffff', 
            borderRadius: '16px', 
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>All Caught Up!</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
              No notifications matching the selected filter.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Zap, UserCheck, FileCheck, CheckCircle2, MapPin } from 'lucide-react';

export default function LiveToastContainer() {
  const { liveToasts, removeToast } = useApp();

  if (!liveToasts || liveToasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'application':
        return <Zap size={18} style={{ color: '#2563eb' }} />;
      case 'worker':
        return <UserCheck size={18} style={{ color: '#10b981' }} />;
      case 'document':
        return <FileCheck size={18} style={{ color: '#f59e0b' }} />;
      case 'stage':
        return <CheckCircle2 size={18} style={{ color: '#8b5cf6' }} />;
      case 'tracking':
        return <MapPin size={18} style={{ color: '#ec4899' }} />;
      default:
        return <Zap size={18} style={{ color: '#003366' }} />;
    }
  };

  return (
    <div className="toast-container">
      {liveToasts.map((toast) => (
        <div key={toast.id} className={`toast-item type-${toast.type || 'default'}`}>
          <div style={{ marginTop: '0.1rem', flexShrink: 0 }}>
            {getIcon(toast.type)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className="live-pulse-dot" style={{ width: '6px', height: '6px' }}></span>
                {toast.title || 'Live System Update'}
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{toast.time}</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.35 }}>
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0.1rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

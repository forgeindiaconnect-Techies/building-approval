import React from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function DocumentStatus({ status }) {
  if (status === 'Verified') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: 500 }}>
        <CheckCircle2 size={16} />
        <span>Verified</span>
      </div>
    );
  }
  if (status === 'Rejected') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', fontWeight: 500 }}>
        <XCircle size={16} />
        <span>Rejected</span>
      </div>
    );
  }
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', fontWeight: 500 }}>
      <Clock size={16} />
      <span>Pending Verification</span>
    </div>
  );
}

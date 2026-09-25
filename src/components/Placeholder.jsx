import React from 'react';
import { HardHat } from 'lucide-react';

export default function Placeholder({ title }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div style={{ padding: '2rem', backgroundColor: 'var(--surface-hover)', borderRadius: '50%', marginBottom: '1.5rem', color: 'var(--primary)' }}>
        <HardHat size={48} />
      </div>
      <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>{title}</h2>
      <p>This module is currently under construction for the Building Approval Software.</p>
    </div>
  );
}

import React from 'react';

export default function ApplicationPagination({ totalItems = 248 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Showing 1–10 of {totalItems}
      </span>
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem' }}>←</button>
        <button className="btn btn-primary" style={{ padding: '0.25rem 0.75rem' }}>1</button>
        <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem' }}>2</button>
        <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem' }}>3</button>
        <span style={{ padding: '0.25rem 0.5rem', color: 'var(--text-muted)' }}>...</span>
        <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem' }}>25</button>
        <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem' }}>→</button>
      </div>
    </div>
  );
}

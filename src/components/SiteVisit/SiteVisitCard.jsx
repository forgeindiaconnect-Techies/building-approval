import React from 'react';

export default function SiteVisitCard({ visitData, location, onSchedule, onViewPhoto }) {
  const isCompleted = visitData.status === 'Completed';

  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Visit Date</span>
          <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{visitData.visitDate ? formatDate(visitData.visitDate) : 'Not Scheduled'}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Assigned Worker</span>
          <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{visitData.officerName || 'Unassigned'}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Location</span>
          <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{location || 'N/A'}</span>
        </div>
      </div>

      {isCompleted ? (
        <>
          <p style={{ 
            fontSize: '0.875rem', 
            fontWeight: 600, 
            color: 'var(--success)',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            ✓ Completed
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Visit Photo</span>
              <button className="btn btn-outline" style={{ padding: '0.125rem 0.5rem', fontSize: '0.75rem', width: 'fit-content' }} onClick={onViewPhoto}>View</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Remarks</span>
              <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{visitData.remarks || 'Site verified successfully'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Completed Date</span>
              <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{formatDate(visitData.completedDate)}</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <p style={{ 
            fontSize: '0.875rem', 
            fontWeight: 600, 
            color: 'var(--warning)',
            marginBottom: '1.5rem'
          }}>
            Status: ● {visitData.status || 'Pending'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={onSchedule}>
              Schedule Visit
            </button>
          </div>
        </>
      )}
    </div>
  );
}

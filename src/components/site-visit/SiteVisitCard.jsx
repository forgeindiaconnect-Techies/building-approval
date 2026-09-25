import React from 'react';
import VisitStatus from './VisitStatus';

export default function SiteVisitCard({ visitData, appData }) {
  return (
    <div className="card">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Applicant</p>
          <p style={{ fontWeight: 500 }}>{appData.applicantName}</p>
        </div>
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Location</p>
          <p style={{ fontWeight: 500 }}>{appData.location || 'N/A'}</p>
        </div>
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Visit Date</p>
          <p style={{ fontWeight: 500 }}>{visitData.visitDate || 'Not Scheduled'}</p>
        </div>
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Assigned Worker</p>
          <p style={{ fontWeight: 500 }}>{visitData.officerName || 'Unassigned'}</p>
        </div>
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Status</p>
          <VisitStatus status={visitData.status} />
        </div>
      </div>
    </div>
  );
}

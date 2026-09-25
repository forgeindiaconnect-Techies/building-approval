import React from 'react';
import { useApp } from '../context/AppContext';

export default function OverallReport() {
  const { applications, currentUser } = useApp();

  const isWorker = currentUser !== 'Admin';
  
  const relevantApps = isWorker 
    ? applications.filter(a => a.assignedWorker === currentUser)
    : applications;

  const total = relevantApps.length;
  const completed = relevantApps.filter(a => a.status === 'COMPLETED').length;
  const inProgress = total - completed;

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Overall Performance Report</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Assigned</p>
          <h3 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{total}</h3>
        </div>
        <div className="card">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Currently In Progress</p>
          <h3 style={{ fontSize: '2rem', marginTop: '0.5rem', color: 'var(--primary)' }}>{inProgress}</h3>
        </div>
        <div className="card">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Completed</p>
          <h3 style={{ fontSize: '2rem', marginTop: '0.5rem', color: 'var(--success)' }}>{completed}</h3>
        </div>
      </div>

      <div className="card">
        <h3>Application Status Breakdown</h3>
        <ul style={{ marginTop: '1rem', listStyle: 'none' }}>
          <li style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
            <strong>Stage 1 (Docs) Pending:</strong> {relevantApps.filter(a => a.stages[1].status !== 'Completed').length}
          </li>
          <li style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
            <strong>Stage 2 (Drawing) Pending:</strong> {relevantApps.filter(a => a.stages[1].status === 'Completed' && a.stages[2].status !== 'Completed').length}
          </li>
          <li style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
            <strong>Stage 4 (Visit) Pending:</strong> {relevantApps.filter(a => a.stages[3].status === 'Completed' && a.stages[4].status !== 'Completed').length}
          </li>
        </ul>
      </div>
    </div>
  );
}

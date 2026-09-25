import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

export default function ApplicationProgress({ stages, currentStatus }) {
  // Map stages 1 to 5 to the user's specific names
  const stageMap = [
    { num: 1, title: 'Application Submitted' },
    { num: 2, title: 'Data / Documents Collected' },
    { num: 3, title: 'Application Started (Verified)' },
    { num: 4, title: 'Government Side Visit' },
    { num: 5, title: 'Final Approval' },
  ];

  return (
    <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)' }}>
      <div style={{ position: 'relative' }}>
        {/* Vertical line */}
        <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '24px', width: '2px', backgroundColor: 'var(--border)' }}></div>

        {stageMap.map((stage, idx) => {
          const sData = stages[stage.num];
          const isCompleted = sData.status === 'Completed';
          const isPending = sData.status === 'Pending';
          const isInProgress = sData.status === 'In Progress';
          
          return (
            <div key={stage.num} style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 1, marginBottom: idx === 4 ? 0 : '2rem' }}>
              <div style={{ 
                width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--background)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                color: isCompleted ? 'var(--success)' : (isInProgress ? 'var(--warning)' : 'var(--border)')
              }}>
                {isCompleted ? <CheckCircle2 size={24} /> : (isInProgress ? <Clock size={24} color="#b45309" /> : <Circle size={24} />)}
              </div>
              
              <div style={{ marginTop: '2px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: isCompleted || isInProgress ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  {stage.title}
                </h4>
                {isCompleted && sData.completedDate && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <p>{new Date(sData.completedDate).toLocaleDateString('en-GB')} • {new Date(sData.completedDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    {sData.by && <p>Completed by: {sData.by}</p>}
                    {sData.remarks && <p>Remarks: {sData.remarks}</p>}
                  </div>
                )}
                {isInProgress && (
                  <div style={{ fontSize: '0.875rem', color: '#b45309', marginTop: '0.25rem', fontWeight: 500 }}>
                    In Progress...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

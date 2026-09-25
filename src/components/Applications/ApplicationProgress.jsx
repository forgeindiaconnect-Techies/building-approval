import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

export default function ApplicationProgress({ stages }) {
  // Map stages 1 to 5 to the user's specific names
  const stageMap = [
    { num: 1, title: 'Application Submitted' },
    { num: 2, title: 'Documents Verified' },
    { num: 4, title: 'Government Side Visit' },
    { num: 5, title: 'Final Approval' },
  ];

  return (
    <div style={{ padding: '1.5rem 1.5rem 1.5rem 0.5rem' }}>
      <div style={{ position: 'relative' }}>
        {/* Vertical line */}
        <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '24px', width: '2px', backgroundColor: 'var(--border)' }}></div>

        {stageMap.map((stage, idx) => {
          const sData = stages[stage.num];
          const isCompleted = sData.status === 'Completed';
          const isInProgress = sData.status === 'In Progress';
          
          return (
            <div key={stage.num} style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 1, marginBottom: idx === stageMap.length - 1 ? 0 : '2.5rem' }}>
              <div style={{ 
                width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--background)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                color: isCompleted ? 'var(--success)' : (isInProgress ? 'var(--primary)' : 'var(--text-muted)')
              }}>
                {isCompleted ? <CheckCircle2 size={24} /> : (isInProgress ? <Clock size={24} color="var(--primary)" /> : <Circle size={24} />)}
              </div>
              
              <div style={{ marginTop: '2px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: isCompleted || isInProgress ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  {stage.title}
                </h4>
                {isCompleted && sData.completedDate && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <p>{new Date(sData.completedDate).toLocaleDateString('en-GB')} • {new Date(sData.completedDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    {sData.by && <p style={{ marginTop: '0.125rem' }}>Completed by: {sData.by}</p>}
                  </div>
                )}
                {isInProgress && stage.num === 4 && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <p>Scheduled: {sData.visitDate ? new Date(sData.visitDate).toLocaleDateString('en-GB') : 'Pending'}</p>
                    <p style={{ marginTop: '0.125rem' }}>Assigned to: {sData.officerName || 'Unassigned'}</p>
                  </div>
                )}
                {!isCompleted && !isInProgress && stage.num === 5 && (
                   <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                     Waiting for site visit
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

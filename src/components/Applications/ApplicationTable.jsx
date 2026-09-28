import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApplicationStatus from './ApplicationStatus';
import { Eye, Send, Trash2, AlertTriangle, CheckCircle, AlertCircle, Clock, Zap, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ApplicationTable({ applications, onClearFilters }) {
  const navigate = useNavigate();
  const { lastUpdatedAppId, lastLiveSync, isRealTimeEnabled, deleteApplication, currentUser } = useApp();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getStageAndStatus = (app) => {
    let stage = 'Documents';
    let status = app.status;
    
    if (status === 'approved') return { stage: 'Completed', status: 'Approved' };
    if (status === 'rejected') return { stage: 'Approval', status: 'Rejected' };
    if (status === 'site_visit_completed') return { stage: 'Approval', status: 'Pending Final Approval' };
    if (status === 'documents_verified') return { stage: 'Site Visit', status: 'Pending Visit' };
    if (status === 'under_review' || status === 'documents_under_review') return { stage: 'Documents', status: 'under_review' };
    if (status === 'submitted' || status === 'new') return { stage: 'Submission', status: 'submitted' };
    if (status === 'pending') return { stage: 'Documents', status: 'Pending Uploads' };
    
    return { stage: 'Documents', status: status || 'Pending' };
  };

  // Helper to format registered worker badge text
  const formatWorkerName = (app) => {
    if (!app || !app.workerId || app.workerId === null || app.source === 'Customer Public' || (app.assignedWorker && (app.assignedWorker.includes('Unassigned') || app.assignedWorker.includes('Customer')))) {
      return 'Direct Customer (Admin)';
    }
    const rawWorker = app.workerName || app.assignedWorker || app.workerId;
    if (!rawWorker) return 'Direct Customer (Admin)';
    if (rawWorker.includes('@')) {
      const namePart = rawWorker.split('@')[0];
      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }
    return rawWorker;
  };

  if (!applications || applications.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3.5rem 2rem', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
        <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '0.35rem', fontWeight: 700 }}>No Applications Found</h3>
        <p style={{ marginBottom: '1.25rem', fontSize: '0.85rem' }}>No records match your active search or filters.</p>
        <button className="btn btn-primary btn-sm" onClick={onClearFilters}>Clear Filters</button>
      </div>
    );
  }

  return (
    <div className="table-wrapper" style={{ paddingBottom: '0' }}>
      <div style={{ backgroundColor: 'var(--surface-hover)', padding: '0.4rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <span className={isRealTimeEnabled ? "live-pulse-dot" : ""} style={{ width: '7px', height: '7px', backgroundColor: isRealTimeEnabled ? '#10b981' : '#94a3b8' }}></span>
          <span style={{ color: isRealTimeEnabled ? '#047857' : 'var(--text-muted)' }}>
            {isRealTimeEnabled ? 'REAL-TIME DATA STREAM ACTIVE' : 'STREAM PAUSED'}
          </span>
        </div>
        <div>
          <span>Last Synced: <strong>{lastLiveSync}</strong></span>
        </div>
      </div>
      <table className="table">
        <thead>
          <tr style={{ backgroundColor: 'var(--primary-light)', borderBottom: '1px solid var(--border)' }}>
            <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap', minWidth: '150px' }}>ID</th>
            <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap', minWidth: '160px' }}>Applicant</th>
            <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap', minWidth: '170px' }}>Registered Worker</th>
            <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap', minWidth: '140px' }}>Location</th>
            <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>Stage</th>
            <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>Status</th>
            <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>Documents</th>
            <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(app => {
            const { stage, status } = getStageAndStatus(app);
            const verifiedCount = app.documents ? app.documents.filter(d => d.status === 'verified').length : 0;
            const rejectedCount = app.documents ? app.documents.filter(d => d.status === 'reupload_required').length : 0;
            const pendingCount = app.documents ? app.documents.filter(d => d.status === 'pending').length : 0;
            const totalDocs = app.requiredDocs ? app.requiredDocs.length : 10;
            const uploadedCount = app.documents ? app.documents.length : 0;
            const workerName = formatWorkerName(app);
            const isJustUpdated = app.id === lastUpdatedAppId;
            
            return (
              <tr key={app.id} className={isJustUpdated ? "row-live-updated" : ""} style={{ borderBottom: '1px solid var(--border)' }}>
                {/* ID */}
                <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
                    <span style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>{app.id}</span>
                    {isJustUpdated && (
                      <span className="live-badge" style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem', whiteSpace: 'nowrap' }}>NEW</span>
                    )}
                  </div>
                </td>

                {/* Applicant Name */}
                <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                  {app.applicantName}
                  {app.mobile && (
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 400, whiteSpace: 'nowrap' }}>
                      📞 {app.mobile}
                    </div>
                  )}
                </td>

                {/* Registered Worker */}
                <td style={{ padding: '0.85rem 1.25rem', whiteSpace: 'nowrap' }}>
                  <span style={{ 
                    backgroundColor: workerName.toLowerCase() === 'unassigned' ? 'var(--warning-bg)' : 'var(--primary-light)', 
                    color: workerName.toLowerCase() === 'unassigned' ? '#c2410c' : 'var(--primary)', 
                    fontWeight: 600, 
                    fontSize: '0.78rem', 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: 'var(--radius-full)', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.3rem',
                    whiteSpace: 'nowrap'
                  }}>
                    👤 {workerName}
                  </span>
                </td>

                {/* Location */}
                <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {app.location || 'N/A'}
                </td>

                {/* Stage */}
                <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                  <span style={{
                    backgroundColor: stage === 'Completed' ? 'var(--success-bg)' : '#F8FAFC',
                    color: stage === 'Completed' ? 'var(--success)' : '#334155',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: '1px solid var(--border)',
                    whiteSpace: 'nowrap'
                  }}>
                    {stage}
                  </span>
                </td>

                {/* Status */}
                <td style={{ padding: '0.85rem 1.25rem', whiteSpace: 'nowrap' }}>
                  <ApplicationStatus status={status} />
                </td>

                {/* Documents Indicator */}
                <td style={{ padding: '0.85rem 1.25rem', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {rejectedCount > 0 ? (
                      <span style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                        {rejectedCount} Rejected
                      </span>
                    ) : pendingCount > 0 ? (
                      <span style={{ backgroundColor: 'var(--warning-bg)', color: '#c2410c', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                        {pendingCount} Pending
                      </span>
                    ) : verifiedCount === totalDocs && totalDocs > 0 ? (
                      <span style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                        ✓ All Verified
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        {uploadedCount}/{totalDocs} Uploaded
                      </span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td style={{ padding: '0.85rem 1.25rem', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', whiteSpace: 'nowrap' }}>
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      onClick={() => navigate(`/admin/application/${app.id}`)}
                    >
                      <Eye size={13} /> View
                    </button>

                    {app.mobile && (
                      <a
                        href={`https://wa.me/${app.mobile}?text=${encodeURIComponent(`Hello ${app.applicantName}, regarding your building application ${app.id} stage: ${stage}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn"
                        style={{ padding: '0.3rem 0.45rem', backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)' }}
                        title="Share via WhatsApp"
                      >
                        <Send size={13} />
                      </a>
                    )}

                    <button
                      className="btn"
                      style={{ 
                        padding: '0.3rem 0.55rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.25rem',
                        backgroundColor: '#FEF2F2',
                        color: '#DC2626',
                        border: '1px solid #FECACA',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer'
                      }}
                      title={`Delete ${app.id}`}
                      onClick={() => setDeleteTarget(app)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) setDeleteTarget(null);
          }}
        >
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #F1F5F9',
              animation: 'scaleIn 0.15s ease-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div 
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <AlertTriangle size={24} color="#DC2626" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                  Delete Application?
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
                  Are you sure you want to permanently delete application <strong style={{ color: '#0F172A' }}>{deleteTarget.id}</strong> submitted by <strong style={{ color: '#0F172A' }}>{deleteTarget.applicantName}</strong>?
                </p>
                <div 
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.78rem',
                    color: '#475569'
                  }}
                >
                  📍 <strong>Location:</strong> {deleteTarget.location || 'N/A'}<br/>
                  🏢 <strong>Type:</strong> {deleteTarget.buildingType || 'Residential'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600 }}
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                style={{
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: isDeleting ? 'not-allowed' : 'pointer'
                }}
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await deleteApplication(deleteTarget.id);
                    setDeleteTarget(null);
                  } catch (err) {
                    alert('Failed to delete: ' + err.message);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
              >
                <Trash2 size={15} />
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Check, X, Eye } from 'lucide-react';

export default function DocumentCard({ doc, onVerify, onReject, onView, onDownload }) {
  const [showVerifyConfirm, setShowVerifyConfirm] = useState(false);
  const isVerified = doc.status === 'verified';
  const isRejected = doc.status === 'reupload_required';
  const isPending = doc.status === 'pending';

  const handleConfirmVerify = () => {
    setShowVerifyConfirm(false);
    onVerify();
  };

  return (
    <div className="card" style={{ padding: '1rem', marginBottom: '0.75rem', borderLeft: isVerified ? '4px solid var(--success)' : (isRejected ? '4px solid var(--danger)' : '4px solid var(--warning)') }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '1.25rem', marginTop: '2px' }}>📄</div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>{doc.name}</h4>
          {doc.appId && doc.applicantName && (
            <div style={{ marginBottom: '0.5rem', padding: '0.35rem 0.5rem', backgroundColor: 'var(--background)', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', margin: 0 }}>App ID: <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{doc.appId}</span> | Customer: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{doc.applicantName}</span></p>
            </div>
          )}
          <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>Uploaded: {new Date(doc.uploadDate).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' })}</p>
          
          {isVerified && (
            <div style={{ fontSize: '0.785rem', color: 'var(--success)', marginBottom: '0.65rem' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.15rem' }}>✓ Verified</p>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>Verified by: {doc.verifiedBy || 'Admin'}</p>
            </div>
          )}

          {isRejected && (
            <div style={{ fontSize: '0.785rem', color: 'var(--danger)', marginBottom: '0.65rem' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.15rem' }}>✕ Re-upload Required</p>
              <div style={{ color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.25rem' }}>
                Reason:
                <p style={{ color: 'var(--text-main)', marginTop: '0.15rem', margin: 0 }}>{doc.rejectedReason}</p>
              </div>
            </div>
          )}

          {isPending && (
            <p style={{ fontSize: '0.785rem', color: 'var(--text-main)', fontWeight: 500, marginBottom: '0.65rem' }}>
              Status: <span style={{ color: 'var(--warning)', fontWeight: 700 }}>Under Review</span>
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-outline" style={{ padding: '0.35rem 0.65rem', fontSize: '0.785rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={onView}>
              <Eye size={14}/> View
            </button>

            {onDownload && (
              <button 
                className="btn btn-outline" 
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.785rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)', borderColor: 'var(--border)' }} 
                onClick={onDownload}
                title="Download this document"
              >
                <span style={{ fontSize: '13px' }}>📥</span> Download
              </button>
            )}
            
            {isPending && !showVerifyConfirm && (
              <>
                <button 
                  className="btn" 
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.785rem', backgroundColor: 'var(--success)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }} 
                  onClick={() => setShowVerifyConfirm(true)}
                >
                  <Check size={14} /> Verify
                </button>
                <button 
                  className="btn" 
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.785rem', backgroundColor: 'var(--danger)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }} 
                  onClick={onReject}
                >
                  <X size={14} /> Reject
                </button>
              </>
            )}
          </div>

          {/* Verify Confirmation inline */}
          {showVerifyConfirm && (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '0.8rem' }}>Verify this document?</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => setShowVerifyConfirm(false)}>
                  Cancel
                </button>
                <button className="btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', backgroundColor: 'var(--success)', color: 'white', border: 'none' }} onClick={handleConfirmVerify}>
                  Confirm Verification
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

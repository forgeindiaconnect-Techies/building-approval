import React, { useState } from 'react';
import { 
  Eye, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  Check, 
  X,
  FileBadge,
  Sparkles
} from 'lucide-react';

export default function DocumentCard({ doc, onVerify, onReject, onView, onDownload }) {
  const [showVerifyConfirm, setShowVerifyConfirm] = useState(false);
  
  const isVerified = doc.status === 'verified';
  const isRejected = doc.status === 'reupload_required' || doc.status === 'rejected';
  const isPending = !isVerified && !isRejected;

  const handleConfirmVerify = () => {
    setShowVerifyConfirm(false);
    onVerify();
  };

  const getDocTypeIcon = () => {
    if (doc.name?.toLowerCase().includes('plan') || doc.name?.toLowerCase().includes('drawing')) {
      return { icon: FileText, color: '#3b82f6', bg: '#eff6ff', label: 'CAD / Plan' };
    }
    if (doc.name?.toLowerCase().includes('deed') || doc.name?.toLowerCase().includes('patta')) {
      return { icon: FileBadge, color: '#8b5cf6', bg: '#f5f3ff', label: 'Title Deed' };
    }
    if (doc.name?.toLowerCase().includes('tax') || doc.name?.toLowerCase().includes('receipt')) {
      return { icon: ShieldCheck, color: '#10b981', bg: '#ecfdf5', label: 'Revenue' };
    }
    return { icon: FileText, color: '#6366f1', bg: '#eef2ff', label: 'Document' };
  };

  const typeConfig = getDocTypeIcon();
  const IconComponent = typeConfig.icon;

  const formatUploadDate = (dateVal) => {
    if (!dateVal) return 'Recently uploaded';
    try {
      return new Date(dateVal).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Uploaded';
    }
  };

  return (
    <div 
      style={{ 
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        border: isVerified 
          ? '1px solid #bbf7d0' 
          : isRejected 
          ? '1px solid #fecaca' 
          : '1px solid #e2e8f0',
        boxShadow: isVerified 
          ? '0 2px 8px rgba(34, 197, 94, 0.06)' 
          : isRejected 
          ? '0 2px 8px rgba(239, 68, 68, 0.06)' 
          : '0 2px 8px rgba(0, 0, 0, 0.04)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden'
      }}
      className="doc-card-hover"
    >
      {/* Top Status Accent Pill Strip */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3.5px',
        backgroundColor: isVerified 
          ? '#10b981' 
          : isRejected 
          ? '#ef4444' 
          : '#f59e0b'
      }} />

      <div>
        {/* Header: Icon + Name + Status Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              backgroundColor: typeConfig.bg, 
              color: typeConfig.color,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0,
              border: `1px solid ${typeConfig.color}25`
            }}>
              <IconComponent size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, lineHeight: 1.25 }}>
                {doc.name}
              </h4>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {typeConfig.label}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          {isVerified && (
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.3rem', 
              padding: '0.25rem 0.6rem', 
              borderRadius: '999px', 
              backgroundColor: '#ecfdf5', 
              color: '#059669', 
              fontSize: '0.72rem', 
              fontWeight: 700,
              border: '1px solid #a7f3d0',
              flexShrink: 0
            }}>
              <CheckCircle2 size={12} /> Verified
            </span>
          )}

          {isRejected && (
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.3rem', 
              padding: '0.25rem 0.6rem', 
              borderRadius: '999px', 
              backgroundColor: '#fef2f2', 
              color: '#dc2626', 
              fontSize: '0.72rem', 
              fontWeight: 700,
              border: '1px solid #fecaca',
              flexShrink: 0
            }}>
              <AlertTriangle size={12} /> Rejected
            </span>
          )}

          {isPending && (
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.3rem', 
              padding: '0.25rem 0.6rem', 
              borderRadius: '999px', 
              backgroundColor: '#fffbeb', 
              color: '#b45309', 
              fontSize: '0.72rem', 
              fontWeight: 700,
              border: '1px solid #fde68a',
              flexShrink: 0
            }}>
              <Clock size={12} /> Under Review
            </span>
          )}
        </div>

        {/* Application context if available */}
        {doc.appId && doc.applicantName && (
          <div style={{ 
            marginBottom: '0.75rem', 
            padding: '0.45rem 0.65rem', 
            backgroundColor: '#f8fafc', 
            borderRadius: '8px', 
            border: '1px solid #e2e8f0',
            fontSize: '0.735rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>
              App: <strong style={{ color: 'var(--primary)' }}>{doc.appId}</strong>
            </span>
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
              {doc.applicantName}
            </span>
          </div>
        )}

        {/* Upload timestamp & Audit info */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
            <Clock size={13} style={{ color: '#94a3b8' }} />
            <span>Uploaded: {formatUploadDate(doc.uploadDate)}</span>
          </div>

          {isVerified && doc.verifiedBy && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#059669', fontWeight: 600, marginTop: '0.25rem' }}>
              <ShieldCheck size={13} />
              <span>Verified by: {doc.verifiedBy}</span>
            </div>
          )}

          {isRejected && (
            <div style={{ 
              marginTop: '0.45rem', 
              padding: '0.45rem 0.6rem', 
              backgroundColor: '#fef2f2', 
              borderRadius: '6px', 
              border: '1px solid #fecaca',
              color: '#b91c1c'
            }}>
              <span style={{ fontWeight: 700, display: 'block', fontSize: '0.72rem' }}>Reason for Rejection:</span>
              <span style={{ fontSize: '0.74rem', lineHeight: 1.3 }}>{doc.rejectedReason || 'Document requires re-upload.'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div>
        {/* Verification Inline Confirmation */}
        {showVerifyConfirm ? (
          <div style={{ 
            padding: '0.65rem 0.75rem', 
            backgroundColor: '#f0fdf4', 
            borderRadius: '8px', 
            border: '1px solid #bbf7d0',
            marginTop: '0.5rem'
          }}>
            <p style={{ fontWeight: 700, margin: '0 0 0.45rem 0', color: '#15803d', fontSize: '0.76rem' }}>
              Approve and verify this document?
            </p>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button 
                className="btn btn-outline" 
                style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem', flex: 1, backgroundColor: '#ffffff' }} 
                onClick={() => setShowVerifyConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn" 
                style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem', backgroundColor: '#16a34a', color: 'white', border: 'none', fontWeight: 700, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }} 
                onClick={handleConfirmVerify}
              >
                <Check size={13} /> Confirm
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', paddingTop: '0.65rem', borderTop: '1px solid #f1f5f9' }}>
            {/* View Button */}
            <button 
              onClick={onView}
              className="btn btn-outline"
              style={{ 
                flex: 1, 
                minWidth: '70px',
                padding: '0.4rem 0.6rem', 
                fontSize: '0.76rem', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.35rem',
                borderRadius: '7px',
                borderColor: '#cbd5e1',
                color: '#334155',
                fontWeight: 600,
                backgroundColor: '#f8fafc'
              }}
            >
              <Eye size={13} /> Preview
            </button>

            {/* Download Button */}
            {onDownload && (
              <button 
                onClick={onDownload}
                className="btn btn-outline"
                style={{ 
                  padding: '0.4rem 0.6rem', 
                  fontSize: '0.76rem', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.35rem',
                  borderRadius: '7px',
                  borderColor: '#cbd5e1',
                  color: '#334155',
                  fontWeight: 600,
                  backgroundColor: '#f8fafc'
                }}
                title="Download file"
              >
                <Download size={13} />
              </button>
            )}

            {/* Admin Verification Actions */}
            {isPending && (
              <>
                <button 
                  onClick={() => setShowVerifyConfirm(true)}
                  className="btn"
                  style={{ 
                    padding: '0.4rem 0.65rem', 
                    fontSize: '0.76rem', 
                    backgroundColor: '#16a34a', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '7px',
                    fontWeight: 700, 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.3rem',
                    cursor: 'pointer'
                  }}
                  title="Verify Document"
                >
                  <Check size={13} /> Verify
                </button>
                <button 
                  onClick={onReject}
                  className="btn"
                  style={{ 
                    padding: '0.4rem 0.65rem', 
                    fontSize: '0.76rem', 
                    backgroundColor: '#dc2626', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '7px',
                    fontWeight: 700, 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.3rem',
                    cursor: 'pointer'
                  }}
                  title="Reject & Request Re-upload"
                >
                  <X size={13} /> Reject
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

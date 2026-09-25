import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import DocumentCard from '../../components/documents/DocumentCard';
import { 
  downloadSingleDocument, 
  downloadApplicationZipBundle, 
  downloadApplicationPdfDossier, 
  downloadAllApplicationsZipBundle 
} from '../../utils/documentExporter';
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  X,
  Files,
  Download,
  FolderArchive,
  FileText,
  Filter,
  Check,
  Send,
  Eye,
  ShieldCheck,
  Building2,
  MapPin,
  Sparkles,
  RefreshCw,
  Layers
} from 'lucide-react';

export default function DocumentsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { applications = [], verifyDocument, currentUser } = useApp();
  
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Track expanded accordion states; default to expanded for apps with pending docs
  const [expandedAppIds, setExpandedAppIds] = useState({});

  // Lightbox Modal state for full document preview
  const [previewDoc, setPreviewDoc] = useState(null);

  // Reject modal state
  const [docRejectModal, setDocRejectModal] = useState(null);
  const [docRejectReason, setDocRejectReason] = useState('');

  const quickRejectReasons = [
    'Document is blurry or illegible. Please upload a high-resolution copy.',
    'Document expired or validity date not clearly visible.',
    'Official authorized signature or government seal is missing.',
    'Applicant name does not match submitted Aadhaar / Identity proof.',
    'Incorrect document type uploaded for this category.'
  ];

  const app = id ? applications.find(a => a && a.id === id) : null;

  // Filter applications belonging to user if worker (STRICT 🔐 Excludes workerId = null public customer applications)
  const isWorker = currentUser && currentUser !== 'Admin';
  const myApplications = isWorker 
    ? applications.filter(a => a && a.workerId && a.workerId !== null && a.source !== 'Customer Public' && (a.workerId === currentUser || a.assignedWorker === currentUser))
    : applications;

  const targetApps = app ? [app] : myApplications;

  // Build document list and metrics
  let allDocs = [];
  targetApps.forEach(a => {
    if (!a) return;
    const docs = a.documents || [];
    docs.forEach(d => {
      allDocs.push({ 
        ...d, 
        appId: a.id, 
        applicantName: a.applicantName,
        location: a.location 
      });
    });
  });

  // Calculate summary stats
  const totalDocsCount = allDocs.length;
  const pendingDocsCount = allDocs.filter(d => d.status === 'pending' || (!d.status && d.status !== 'verified' && d.status !== 'reupload_required')).length;
  const verifiedDocsCount = allDocs.filter(d => d.status === 'verified').length;
  const rejectedDocsCount = allDocs.filter(d => d.status === 'reupload_required' || d.status === 'rejected').length;

  const toggleAccordion = (appId) => {
    setExpandedAppIds(prev => {
      const current = prev[appId] !== undefined ? prev[appId] : !!app;
      return { 
        ...prev, 
        [appId]: !current 
      };
    });
  };

  const isAppExpanded = (appId) => {
    if (expandedAppIds[appId] !== undefined) {
      return expandedAppIds[appId];
    }
    // Auto-expand only if viewing a specific application directly via URL (/application/:id/documents)
    // Collapse / hide documents by default on the general Documents tab
    return !!app;
  };

  const handleConfirmRejection = () => {
    if (!docRejectModal) return;
    const reason = docRejectReason.trim() || 'Document requires re-upload.';
    verifyDocument(docRejectModal.appId, docRejectModal.doc.id, 'reupload_required', reason);
    setDocRejectModal(null);
    setDocRejectReason('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      
      {/* Back button if viewing specific app */}
      {app && (
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            color: 'var(--primary)', 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            padding: 0, 
            fontWeight: 700, 
            fontSize: '0.875rem' 
          }}
        >
          <ArrowLeft size={16} /> Back to Application Details
        </button>
      )}

      {/* Top Header & Export Banner */}
      <div 
        style={{ 
          backgroundColor: '#ffffff', 
          border: '1px solid var(--border)',
          padding: '1.5rem 1.75rem', 
          borderRadius: '16px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1.25rem' 
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ 
              padding: '0.2rem 0.6rem', 
              borderRadius: '999px', 
              fontSize: '0.72rem', 
              fontWeight: 700, 
              backgroundColor: '#eff6ff', 
              color: '#2563eb',
              border: '1px solid #bfdbfe'
            }}>
              DOCUMENT SCRUTINY
            </span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            {app ? `Documents Vault: ${app.id}` : 'Document Verification Vault'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>
            {app 
              ? `Review, verify, and export statutory documents uploaded by ${app.applicantName}.` 
              : 'Inspect, authenticate, or download customer building permit documents across all active applications.'
            }
          </p>
        </div>

        {/* Global Export Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {app ? (
            <>
              <button 
                className="btn" 
                onClick={() => downloadApplicationZipBundle(app)}
                style={{ 
                  backgroundColor: 'var(--primary)', 
                  color: 'white',
                  fontSize: '0.825rem', 
                  padding: '0.55rem 1rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.45rem', 
                  borderRadius: '10px', 
                  fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
                title="Download all documents of this application as a single ZIP bundle"
              >
                <FolderArchive size={16} /> Download All (ZIP)
              </button>
              <button 
                className="btn btn-outline" 
                onClick={() => downloadApplicationPdfDossier(app)}
                style={{ 
                  borderColor: '#3b82f6', 
                  color: '#2563eb', 
                  backgroundColor: '#eff6ff', 
                  fontSize: '0.825rem', 
                  padding: '0.55rem 1rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.45rem', 
                  borderRadius: '10px', 
                  fontWeight: 700 
                }}
                title="Generate & download consolidated PDF dossier"
              >
                <FileText size={16} /> Consolidated PDF Dossier
              </button>
            </>
          ) : (
            <button 
              className="btn btn-outline" 
              onClick={() => downloadAllApplicationsZipBundle(targetApps)}
              style={{ 
                borderColor: 'var(--border)', 
                color: 'var(--text-main)', 
                backgroundColor: '#ffffff', 
                fontSize: '0.825rem', 
                padding: '0.55rem 1rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.45rem', 
                borderRadius: '10px', 
                fontWeight: 700 
              }}
              title="Download all documents across all applications as a master ZIP archive"
            >
              <FolderArchive size={16} /> Export Master ZIP (All Applications)
            </button>
          )}
        </div>
      </div>

      {/* Modern KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        
        {/* Total Documents */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '14px', 
          border: '1px solid var(--border)', 
          padding: '1.15rem 1.25rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Uploaded
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem', lineHeight: 1 }}>
              {totalDocsCount}
            </div>
          </div>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '12px', 
            backgroundColor: '#f1f5f9', 
            color: '#475569', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Files size={22} />
          </div>
        </div>

        {/* Pending Review */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '14px', 
          border: '1px solid #fef3c7', 
          padding: '1.15rem 1.25rem',
          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div>
            <span style={{ fontSize: '0.725rem', color: '#b45309', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pending Review
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#d97706', marginTop: '0.2rem', lineHeight: 1 }}>
              {pendingDocsCount}
            </div>
          </div>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '12px', 
            backgroundColor: '#fffbeb', 
            color: '#d97706', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid #fde68a'
          }}>
            <Clock size={22} />
          </div>
        </div>

        {/* Verified Documents */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '14px', 
          border: '1px solid #bbf7d0', 
          padding: '1.15rem 1.25rem',
          boxShadow: '0 2px 8px rgba(34, 197, 94, 0.08)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div>
            <span style={{ fontSize: '0.725rem', color: '#15803d', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Verified
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#16a34a', marginTop: '0.2rem', lineHeight: 1 }}>
              {verifiedDocsCount}
            </div>
          </div>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '12px', 
            backgroundColor: '#f0fdf4', 
            color: '#16a34a', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid #bbf7d0'
          }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Rejected / Re-upload Required */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '14px', 
          border: '1px solid #fecaca', 
          padding: '1.15rem 1.25rem',
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.08)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div>
            <span style={{ fontSize: '0.725rem', color: '#b91c1c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Re-upload Required
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#dc2626', marginTop: '0.2rem', lineHeight: 1 }}>
              {rejectedDocsCount}
            </div>
          </div>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '12px', 
            backgroundColor: '#fef2f2', 
            color: '#dc2626', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid #fecaca'
          }}>
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div 
        style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '14px', 
          border: '1px solid var(--border)', 
          padding: '0.85rem 1.25rem',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-control"
            placeholder="Search by Application ID, Customer Name, or Document Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              paddingLeft: '2.25rem', 
              fontSize: '0.85rem', 
              borderRadius: '999px',
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border)'
            }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'All', label: 'All Documents', count: totalDocsCount },
            { id: 'pending', label: 'Pending Review', count: pendingDocsCount, color: '#f59e0b' },
            { id: 'verified', label: 'Verified', count: verifiedDocsCount, color: '#10b981' },
            { id: 'reupload_required', label: 'Re-upload Required', count: rejectedDocsCount, color: '#ef4444' }
          ].map(tab => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: isActive ? '1px solid transparent' : '1px solid var(--border)',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'var(--primary)' : '#f8fafc',
                  color: isActive ? '#ffffff' : 'var(--text-main)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 6px rgba(0,0,0,0.12)' : 'none'
                }}
              >
                <span>{tab.label}</span>
                <span style={{ 
                  fontSize: '0.72rem', 
                  padding: '0.1rem 0.45rem', 
                  borderRadius: '999px', 
                  backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                  color: isActive ? '#ffffff' : 'var(--text-muted)'
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Applications Document Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {targetApps.map(application => {
          if (!application) return null;
          const docs = application.documents || [];
          const filtered = docs.filter(d => {
            const isPendingDoc = d.status === 'pending' || (!d.status && d.status !== 'verified' && d.status !== 'reupload_required');
            const matchesFilter = filter === 'All' 
              ? true 
              : filter === 'pending' 
              ? isPendingDoc 
              : d.status === filter;

            const query = searchTerm.toLowerCase();
            const matchesSearch = 
              application.id.toLowerCase().includes(query) ||
              (application.applicantName && application.applicantName.toLowerCase().includes(query)) ||
              (d.name && d.name.toLowerCase().includes(query));

            return matchesFilter && matchesSearch;
          });

          if (filtered.length === 0 && (searchTerm || filter !== 'All')) {
            return null;
          }

          const appPending = docs.filter(d => d.status === 'pending' || (!d.status && d.status !== 'verified' && d.status !== 'reupload_required')).length;
          const appVerified = docs.filter(d => d.status === 'verified').length;
          const appRejected = docs.filter(d => d.status === 'reupload_required' || d.status === 'rejected').length;
          const totalReq = application.requiredDocs ? application.requiredDocs.length : (docs.length > 0 ? docs.length : 8);
          const expanded = isAppExpanded(application.id, appPending);

          return (
            <div 
              key={application.id} 
              style={{ 
                backgroundColor: '#ffffff', 
                borderRadius: '16px', 
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden'
              }}
            >
              {/* Accordion Application Header */}
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '1.25rem 1.5rem', 
                  backgroundColor: '#ffffff', 
                  cursor: 'pointer',
                  userSelect: 'none',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  borderBottom: expanded ? '1px solid var(--border)' : 'none'
                }}
                onClick={() => toggleAccordion(application.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '42px', 
                    height: '42px', 
                    borderRadius: '12px', 
                    backgroundColor: 'var(--primary-light, #eff6ff)', 
                    color: 'var(--primary)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <Building2 size={20} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {application.id}
                      </span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
                        • {application.applicantName}
                      </span>
                      {application.location && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={13} /> {application.location}
                        </span>
                      )}
                    </div>

                    {/* Progress Summary Chips */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: 700, 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '999px', 
                        backgroundColor: '#ecfdf5', 
                        color: '#059669',
                        border: '1px solid #a7f3d0'
                      }}>
                        ✓ {appVerified} Verified
                      </span>
                      {appPending > 0 && (
                        <span style={{ 
                          fontSize: '0.72rem', 
                          fontWeight: 700, 
                          padding: '0.2rem 0.6rem', 
                          borderRadius: '999px', 
                          backgroundColor: '#fffbeb', 
                          color: '#b45309',
                          border: '1px solid #fde68a'
                        }}>
                          ⏳ {appPending} Pending Review
                        </span>
                      )}
                      {appRejected > 0 && (
                        <span style={{ 
                          fontSize: '0.72rem', 
                          fontWeight: 700, 
                          padding: '0.2rem 0.6rem', 
                          borderRadius: '999px', 
                          backgroundColor: '#fef2f2', 
                          color: '#dc2626',
                          border: '1px solid #fecaca'
                        }}>
                          ✕ {appRejected} Rejected
                        </span>
                      )}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        ({docs.length} uploaded of {totalReq} required)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Toggle Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button 
                    className="btn btn-outline" 
                    onClick={(e) => { e.stopPropagation(); toggleAccordion(application.id); }}
                    style={{ 
                      fontSize: '0.8rem', 
                      padding: '0.4rem 0.85rem', 
                      borderRadius: '8px', 
                      fontWeight: 700,
                      backgroundColor: '#f8fafc',
                      borderColor: 'var(--border)'
                    }}
                  >
                    {expanded ? 'Hide Documents' : `View ${filtered.length} Document(s)`}
                  </button>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '8px', 
                    backgroundColor: '#f8fafc', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'var(--text-muted)'
                  }}>
                    {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </div>
              </div>

              {/* Accordion Content Grid */}
              {expanded && (
                <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc' }}>
                  
                  {/* Inside Action Bar */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '1.25rem', 
                    padding: '0.85rem 1.25rem', 
                    backgroundColor: '#ffffff', 
                    borderRadius: '12px', 
                    border: '1px solid var(--border)', 
                    flexWrap: 'wrap', 
                    gap: '0.75rem',
                    boxShadow: 'var(--shadow-xs)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={16} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontSize: '0.825rem', color: 'var(--text-main)', fontWeight: 600 }}>
                        Uploaded Documentation Checklist for <strong>{application.applicantName}</strong>
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <button 
                        className="btn"
                        onClick={() => downloadApplicationZipBundle(application)}
                        style={{ 
                          backgroundColor: '#0F2A4A', 
                          color: 'white', 
                          border: 'none', 
                          fontSize: '0.785rem', 
                          fontWeight: 700, 
                          padding: '0.45rem 0.9rem', 
                          borderRadius: '8px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.4rem',
                          cursor: 'pointer'
                        }}
                        title="Download all documents of this application as a single ZIP archive (.zip)"
                      >
                        <FolderArchive size={14} /> Download All (ZIP)
                      </button>
                      <button 
                        className="btn btn-outline"
                        onClick={() => downloadApplicationPdfDossier(application)}
                        style={{ 
                          borderColor: '#3b82f6', 
                          color: '#2563eb', 
                          backgroundColor: '#eff6ff', 
                          fontSize: '0.785rem', 
                          fontWeight: 700, 
                          padding: '0.45rem 0.9rem', 
                          borderRadius: '8px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.4rem',
                          cursor: 'pointer'
                        }}
                        title="Download all documents as a consolidated PDF file (.pdf)"
                      >
                        <FileText size={14} /> Download All (PDF)
                      </button>
                    </div>
                  </div>

                  {filtered.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '2.5rem', 
                      backgroundColor: '#ffffff', 
                      borderRadius: '12px', 
                      border: '1px dashed var(--border)',
                      color: 'var(--text-muted)', 
                      fontSize: '0.875rem' 
                    }}>
                      No documents in this application match the current filter.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.15rem' }}>
                      {filtered.map(doc => (
                        <DocumentCard 
                          key={doc.id} 
                          doc={doc} 
                          onVerify={() => verifyDocument(application.id, doc.id, 'verified')}
                          onReject={() => setDocRejectModal({ doc, appId: application.id })}
                          onView={() => setPreviewDoc({ ...doc, appId: application.id, applicantName: application.applicantName })}
                          onDownload={() => downloadSingleDocument(doc, application)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {allDocs.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem', 
            backgroundColor: '#ffffff', 
            borderRadius: '16px', 
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>No Documents Available</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
              No uploaded files found for the active filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Rejection Reason Modal */}
      {docRejectModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.6)', 
          zIndex: 1200, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '1.25rem' 
        }}>
          <div style={{ 
            maxWidth: '520px', 
            width: '100%', 
            backgroundColor: '#ffffff', 
            borderRadius: '16px', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', 
            overflow: 'hidden' 
          }}>
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fef2f2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626' }}>
                <AlertTriangle size={20} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Reject Document & Request Re-upload</h4>
              </div>
              <button 
                onClick={() => { setDocRejectModal(null); setDocRejectReason(''); }}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '1rem', lineHeight: 1.5 }}>
                You are rejecting <strong>{docRejectModal.doc.name}</strong> for Application <strong>{docRejectModal.appId}</strong>. Please specify the reason so the applicant can submit a valid document.
              </p>

              {/* Preset Reason Chips */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.45rem' }}>
                  QUICK PRESET REASONS:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {quickRejectReasons.map((reason, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setDocRejectReason(reason)}
                      style={{
                        padding: '0.45rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        textAlign: 'left',
                        border: docRejectReason === reason ? '1px solid #dc2626' : '1px solid #e2e8f0',
                        backgroundColor: docRejectReason === reason ? '#fef2f2' : '#f8fafc',
                        color: docRejectReason === reason ? '#b91c1c' : '#334155',
                        fontWeight: docRejectReason === reason ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      • {reason}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                CUSTOM REJECTION REASON:
              </label>
              <textarea
                className="form-control"
                rows={3}
                value={docRejectReason}
                onChange={(e) => setDocRejectReason(e.target.value)}
                placeholder="Describe clearly what needs to be fixed..."
                style={{ fontSize: '0.85rem', resize: 'vertical' }}
              />
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.5rem', backgroundColor: '#f8fafc', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button 
                className="btn btn-outline"
                onClick={() => { setDocRejectModal(null); setDocRejectReason(''); }}
                style={{ fontSize: '0.825rem', padding: '0.5rem 1rem' }}
              >
                Cancel
              </button>
              <button 
                className="btn"
                onClick={handleConfirmRejection}
                style={{ 
                  backgroundColor: '#dc2626', 
                  color: 'white', 
                  border: 'none', 
                  fontSize: '0.825rem', 
                  padding: '0.5rem 1.25rem', 
                  fontWeight: 700,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <X size={15} /> Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Lightbox Preview Modal */}
      {previewDoc && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.85)', 
          zIndex: 1300, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '1.5rem' 
        }}>
          <div style={{ 
            maxWidth: '900px', 
            width: '100%', 
            maxHeight: '90vh', 
            display: 'flex', 
            flexDirection: 'column', 
            backgroundColor: '#ffffff', 
            borderRadius: '16px', 
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
          }}>
            
            {/* Modal Topbar */}
            <div style={{ 
              padding: '1rem 1.5rem', 
              borderBottom: '1px solid var(--border)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              backgroundColor: '#f8fafc' 
            }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{previewDoc.name}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                  Application ID: <strong style={{ color: 'var(--primary)' }}>{previewDoc.appId}</strong> {previewDoc.applicantName ? `| Applicant: ${previewDoc.applicantName}` : ''}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button 
                  className="btn btn-outline" 
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }} 
                  onClick={() => downloadSingleDocument(previewDoc, { id: previewDoc.appId, applicantName: previewDoc.applicantName })}
                >
                  <Download size={14} /> Download File
                </button>
                <button 
                  className="btn btn-outline" 
                  style={{ padding: '0.35rem 0.6rem' }} 
                  onClick={() => setPreviewDoc(null)}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Document Viewer Body */}
            <div style={{ flex: 1, padding: '1.5rem', overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
              {previewDoc.file && previewDoc.file.startsWith('data:image/') ? (
                <img 
                  src={previewDoc.file} 
                  alt={previewDoc.name} 
                  style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', borderRadius: '8px' }} 
                />
              ) : previewDoc.file && previewDoc.file.startsWith('data:application/pdf') ? (
                <iframe 
                  src={previewDoc.file} 
                  title={previewDoc.name}
                  style={{ width: '100%', height: '65vh', border: 'none', borderRadius: '8px', backgroundColor: '#ffffff' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#ffffff', borderRadius: '12px', maxWidth: '400px' }}>
                  <FileText size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>{previewDoc.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Standard statutory electronic filing on record.
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => downloadSingleDocument(previewDoc, { id: previewDoc.appId, applicantName: previewDoc.applicantName })}
                  >
                    <Download size={15} /> Download Document
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

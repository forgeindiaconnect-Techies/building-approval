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
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  X,
  Files,
  Download,
  FolderArchive,
  FileText
} from 'lucide-react';

export default function DocumentsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { applications, verifyDocument, currentUser } = useApp();
  
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Track expanded accordion states; default to expanded for apps with pending docs
  const [expandedAppIds, setExpandedAppIds] = useState({});

  // Lightbox Modal state for full document preview
  const [previewDoc, setPreviewDoc] = useState(null);

  // Reject modal state
  const [docRejectModal, setDocRejectModal] = useState(null);
  const [docRejectReason, setDocRejectReason] = useState('');

  const app = id ? applications.find(a => a.id === id) : null;

  // Filter applications belonging to user if worker (STRICT 🔐 Excludes workerId = null public customer applications)
  const isWorker = currentUser && currentUser !== 'Admin';
  const myApplications = isWorker 
    ? applications.filter(a => a.workerId && a.workerId !== null && a.source !== 'Customer Public' && (a.workerId === currentUser || a.assignedWorker === currentUser || a.workerId === workerDisplayName || a.assignedWorker === workerDisplayName))
    : applications;

  const targetApps = app ? [app] : myApplications;

  // Build document list and metrics
  let allDocs = [];
  targetApps.forEach(a => {
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
  const pendingDocsCount = allDocs.filter(d => d.status === 'pending').length;
  const verifiedDocsCount = allDocs.filter(d => d.status === 'verified').length;
  const rejectedDocsCount = allDocs.filter(d => d.status === 'reupload_required').length;

  const toggleAccordion = (appId) => {
    setExpandedAppIds(prev => ({ 
      ...prev, 
      [appId]: prev[appId] === undefined ? false : !prev[appId] 
    }));
  };

  const isAppExpanded = (appId, pendingCount) => {
    if (expandedAppIds[appId] !== undefined) {
      return expandedAppIds[appId];
    }
    // Auto-expand if there are pending docs or if single app view
    return app ? true : pendingCount > 0;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2.5rem' }}>
      
      {/* Back button if viewing specific app */}
      {app && (
        <button 
          onClick={() => navigate(-1)} 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600, fontSize: '0.825rem' }}
        >
          <ArrowLeft size={15} /> Back to Application Details
        </button>
      )}

      {/* Header Banner */}
      <div className="card" style={{ 
        backgroundColor: '#ffffff', 
        border: '1px solid #cbd5e1',
        padding: '1.25rem 1.5rem', 
        borderRadius: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              {app ? `Documents: ${app.id}` : 'Document Verification Vault'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '0.15rem', margin: 0 }}>
              {app ? `Review & verify uploaded documents for ${app.applicantName}` : 'Inspect, verify, or download customer building approval document bundles as ZIP & PDF.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            {app ? (
              <>
                <button 
                  className="btn btn-primary" 
                  onClick={() => downloadApplicationZipBundle(app)}
                  style={{ backgroundColor: '#0F2A4A', fontSize: '0.8rem', padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px', fontWeight: 600 }}
                  title="Download all documents of this application as a single ZIP archive"
                >
                  <FolderArchive size={15} /> Download All (ZIP)
                </button>
                <button 
                  className="btn btn-outline" 
                  onClick={() => downloadApplicationPdfDossier(app)}
                  style={{ borderColor: '#2563EB', color: '#2563EB', backgroundColor: '#EFF6FF', fontSize: '0.8rem', padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px', fontWeight: 600 }}
                  title="Generate & print/download a consolidated multi-page PDF dossier"
                >
                  <FileText size={15} /> Consolidated PDF Dossier
                </button>
              </>
            ) : (
              <button 
                className="btn btn-outline" 
                onClick={() => downloadAllApplicationsZipBundle(targetApps)}
                style={{ borderColor: '#CBD5E1', color: '#0F2A4A', backgroundColor: '#FFFFFF', fontSize: '0.8rem', padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px', fontWeight: 600 }}
                title="Download all documents of all applications as a master ZIP bundle"
              >
                <FolderArchive size={15} /> Export Master ZIP (All Applications)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid - Compact sizes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1rem 1.25rem', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.725rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Uploaded</p>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0.15rem 0 0 0' }}>{totalDocsCount}</h3>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Files size={18} />
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.725rem', fontWeight: 600, textTransform: 'uppercase' }}>Pending Review</p>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0.15rem 0 0 0' }}>{pendingDocsCount}</h3>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={18} />
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.725rem', fontWeight: 600, textTransform: 'uppercase' }}>Verified Docs</p>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0.15rem 0 0 0' }}>{verifiedDocsCount}</h3>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={18} />
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.725rem', fontWeight: 600, textTransform: 'uppercase' }}>Re-upload Needed</p>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0.15rem 0 0 0' }}>{rejectedDocsCount}</h3>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={18} />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
        
        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-control"
            placeholder="Search Application ID, Customer Name, or Document Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2rem', fontSize: '0.825rem' }}
          />
        </div>

        {/* Filter Chips */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'All', label: 'All Documents' },
            { id: 'pending', label: `Pending (${pendingDocsCount})` },
            { id: 'verified', label: `Verified (${verifiedDocsCount})` },
            { id: 'reupload_required', label: `Rejected (${rejectedDocsCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '14px',
                fontSize: '0.785rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: filter === tab.id ? 'var(--primary)' : 'var(--background)',
                color: filter === tab.id ? 'white' : 'var(--text-muted)',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Accordion & Document Cards List */}
      <div>
        {targetApps.map(application => {
          const docs = application.documents || [];
          const filtered = docs.filter(d => {
            const matchesFilter = filter === 'All' ? true : d.status === filter;
            const matchesSearch = 
              application.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
              application.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              d.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesFilter && matchesSearch;
          });

          if (filtered.length === 0 && (searchTerm || filter !== 'All')) {
            return null;
          }

          const appPending = docs.filter(d => d.status === 'pending').length;
          const appVerified = docs.filter(d => d.status === 'verified').length;
          const appRejected = docs.filter(d => d.status === 'reupload_required').length;
          const totalReq = application.requiredDocs ? application.requiredDocs.length : 10;
          const expanded = isAppExpanded(application.id, appPending);

          return (
            <div 
              key={application.id} 
              className="card" 
              style={{ 
                marginBottom: '1rem', 
                padding: 0, 
                overflow: 'hidden',
                borderLeft: appPending > 0 ? '4px solid var(--warning)' : appVerified === totalReq ? '4px solid var(--success)' : '4px solid var(--primary)'
              }}
            >
              {/* Accordion Header */}
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '1rem 1.25rem', 
                  backgroundColor: 'white', 
                  cursor: 'pointer',
                  userSelect: 'none',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
                onClick={() => toggleAccordion(application.id)}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                      Application: {application.id}
                    </h4>
                    <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {application.applicantName} ({application.location || 'N/A'})
                    </span>
                  </div>

                  {/* Status Breakdown Pills */}
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.725rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '12px', backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
                      ✓ {appVerified} Verified
                    </span>
                    {appPending > 0 && (
                      <span style={{ fontSize: '0.725rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '12px', backgroundColor: 'var(--warning-bg)', color: '#b45309' }}>
                        ⏳ {appPending} Pending
                      </span>
                    )}
                    {appRejected > 0 && (
                      <span style={{ fontSize: '0.725rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '12px', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
                        ✕ {appRejected} Rejected
                      </span>
                    )}
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      | {docs.length} uploaded of {totalReq} required
                    </span>
                  </div>
                </div>

                {/* Right Action Button (Clean Outside) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button 
                    className="btn btn-outline" 
                    onClick={(e) => { e.stopPropagation(); toggleAccordion(application.id); }}
                    style={{ fontSize: '0.785rem', padding: '0.35rem 0.85rem', borderRadius: '8px', fontWeight: 600 }}
                  >
                    {expanded ? 'Hide Documents' : `View ${filtered.length} Document(s)`}
                  </button>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </span>
                </div>
              </div>

              {/* Accordion Content Grid (Inside View) */}
              {expanded && (
                <div style={{ padding: '1.25rem', backgroundColor: 'var(--background)', borderTop: '1px solid var(--border)' }}>
                  
                  {/* Inside Action Bar with ZIP and PDF Download buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', padding: '0.85rem 1.25rem', backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.825rem', color: '#475569', fontWeight: 600 }}>
                      📄 <strong>{docs.length}</strong> Total Documents Uploaded for <strong>{application.applicantName}</strong>
                    </span>
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <button 
                        className="btn"
                        onClick={() => downloadApplicationZipBundle(application)}
                        style={{ 
                          backgroundColor: '#0F2A4A', 
                          color: 'white', 
                          border: 'none', 
                          fontSize: '0.785rem', 
                          fontWeight: 600, 
                          padding: '0.45rem 0.85rem', 
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
                          borderColor: '#2563EB', 
                          color: '#2563EB', 
                          backgroundColor: '#EFF6FF', 
                          fontSize: '0.785rem', 
                          fontWeight: 600, 
                          padding: '0.45rem 0.85rem', 
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
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No documents in this application match the selected filter.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
                      {filtered.map(doc => (
                        <DocumentCard 
                          key={doc.id} 
                          doc={doc} 
                          onVerify={() => verifyDocument(application.id, doc.id, 'verified')}
                          onReject={() => setDocRejectModal({ doc, appId: application.id })}
                          onView={() => setPreviewDoc(doc)}
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
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <Files size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>No Documents Uploaded</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '0.2rem' }}>
              Customers haven't uploaded any documents yet.
            </p>
          </div>
        )}
      </div>

      {/* Document Lightbox Preview Modal */}
      {previewDoc && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 1100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
          <div className="card" style={{ maxWidth: '850px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', backgroundColor: 'white', padding: 0, overflow: 'hidden', borderRadius: '12px' }}>
            
            {/* Modal Topbar */}
            <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--background)' }}>
              <div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>{previewDoc.name}</h4>
                <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', margin: 0 }}>App ID: {previewDoc.appId} | Customer: {previewDoc.applicantName}</p>
              </div>
              <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setPreviewDoc(null)}>
                <X size={16} />
              </button>
            </div>

            {/* Document Image/PDF Viewer */}
            <div style={{ flex: 1, padding: '1.25rem', overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' }}>
              {previewDoc.file && previewDoc.file.startsWith('data:image/') ? (
                <img 
                  src={previewDoc.file} 
                  alt={previewDoc.name} 
                  style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: '6px' }} 
                />
              ) : previewDoc.file ? (
                <iframe 
                  src={previewDoc.file} 
                  title={previewDoc.name}
                  style={{ width: '100%', height: '60vh', border: 'none', borderRadius: '6px' }}
                ></iframe>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>Document record on file.</p>
                  <button 
                    className="btn btn-outline" 
                    onClick={() => {
                      const parentApp = targetApps.find(a => a.id === previewDoc.appId) || app || {};
                      downloadSingleDocument(previewDoc, parentApp);
                    }}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <span>📥</span> Download Printable Document
                  </button>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Status: <strong style={{ textTransform: 'capitalize', color: previewDoc.status === 'verified' ? 'var(--success)' : previewDoc.status === 'reupload_required' ? 'var(--danger)' : 'var(--warning)' }}>{previewDoc.status.replace('_', ' ')}</strong>
              </span>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button 
                  className="btn btn-outline" 
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0F2A4A' }}
                  onClick={() => {
                    const parentApp = targetApps.find(a => a.id === previewDoc.appId) || app || {};
                    downloadSingleDocument(previewDoc, parentApp);
                  }}
                >
                  <span>📥</span> Download File
                </button>

                {previewDoc.status === 'pending' && (
                  <>
                    <button 
                      className="btn" 
                      style={{ backgroundColor: 'var(--danger)', color: 'white', border: 'none', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                      onClick={() => {
                        setDocRejectModal({ doc: previewDoc, appId: previewDoc.appId });
                        setPreviewDoc(null);
                      }}
                    >
                      Reject Document
                    </button>
                    <button 
                      className="btn btn-primary" 
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                      onClick={() => {
                        verifyDocument(previewDoc.appId, previewDoc.id, 'verified');
                        setPreviewDoc(null);
                      }}
                    >
                      Approve & Verify ✓
                    </button>
                  </>
                )}
                <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }} onClick={() => setPreviewDoc(null)}>
                  Close Preview
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Document Rejection Reason Modal */}
      {docRejectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '420px', width: '100%', backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--danger)' }}>Reject Document</h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Rejection reason for <strong>{docRejectModal.doc.name}</strong>:
            </p>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Reason for Rejection *</label>
              <textarea 
                className="form-control"
                rows="3"
                placeholder="e.g. Document image is blurred, please re-upload clear copy."
                value={docRejectReason}
                onChange={e => setDocRejectReason(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-outline" style={{ flex: 1, fontSize: '0.825rem' }} onClick={() => setDocRejectModal(null)}>Cancel</button>
              <button 
                className="btn" 
                style={{ flex: 1, backgroundColor: 'var(--danger)', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.825rem' }} 
                onClick={() => {
                  if (!docRejectReason) return alert('Please provide a reason for rejection.');
                  verifyDocument(docRejectModal.appId, docRejectModal.doc.id, 'reupload_required', docRejectReason);
                  setDocRejectModal(null);
                  setDocRejectReason('');
                }}
              >
                Reject & Request Re-upload
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Check, 
  XCircle, 
  Send, 
  FileText, 
  Eye, 
  User, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Calendar,
  X,
  FolderArchive,
  Download,
  Phone,
  Mail,
  FileCheck,
  Compass,
  Layers,
  Sparkles,
  Printer,
  Share2,
  HardHat,
  BadgeCheck,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { 
  downloadSingleDocument, 
  downloadApplicationZipBundle, 
  downloadApplicationPdfDossier 
} from '../../utils/documentExporter';

export default function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { applications = [], updateStage, updateAppStatus, currentUser, verifyDocument, themeSettings, pushLiveToast, deleteApplication } = useApp();
  
  const [activeTab, setActiveTab] = useState('documents');
  const [docRejectModal, setDocRejectModal] = useState(null);
  const [docRejectReason, setDocRejectReason] = useState('Document is unclear / blurry. Please re-upload a clear copy.');
  const [previewDoc, setPreviewDoc] = useState(null); // Document preview lightbox

  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [finalRejectReason, setFinalRejectReason] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const app = applications.find(a => a && a.id === id);

  // Transition 'submitted' to 'documents_under_review' when Admin opens it
  useEffect(() => {
    if (app && (app.status === 'submitted' || app.status === 'new' || app.status === 'pending') && currentUser === 'Admin') {
      updateAppStatus(app.id, 'documents_under_review');
    }
  }, [app, currentUser, updateAppStatus]);

  if (!app) return (
    <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '3rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Application Not Found</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>The requested application reference <strong>{id}</strong> could not be located.</p>
      <button className="btn btn-primary" onClick={() => navigate(currentUser === 'Admin' ? '/admin/applications' : '/worker/applications')}>
        <ArrowLeft size={16} /> Back to Applications
      </button>
    </div>
  );

  // Worker Restriction: Public direct customer applications (workerId = null) are strictly Admin-only
  if (currentUser !== 'Admin' && (!app.workerId || app.workerId === null || app.source === 'Customer Public')) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '16px', margin: '3rem auto', maxWidth: '600px', border: '2px solid #fee2e2', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔐</div>
        <h2 style={{ color: '#dc2626', fontWeight: 900, marginBottom: '0.5rem', fontSize: '1.4rem' }}>Worker Access Restricted</h2>
        <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Application <strong>{app.id}</strong> was submitted directly by a citizen through the public portal without an assigned field worker.<br />
          Administrative security requires an Administrator account to access direct public clearances.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/worker/applications')}>
          <ArrowLeft size={16} /> Back to My Applications
        </button>
      </div>
    );
  }

  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const siteVisitData = app.stages?.[4] || { status: 'Pending' };
  const docsList = app.documents || [];
  
  const requiredDocsCount = app.requiredDocs?.length || (docsList.length > 0 ? docsList.length : 6);
  const verifiedDocsCount = docsList.filter(d => d.status === 'verified').length;
  const pendingDocsCount = docsList.filter(d => d.status === 'pending' || !d.status).length;
  const rejectedDocsCount = docsList.filter(d => d.status === 'reupload_required').length;

  const isDocumentsComplete = docsList.length > 0 && verifiedDocsCount === docsList.length;
  const isSiteVisitComplete = siteVisitData.status === 'Completed';
  const isReadyForFinalApproval = isDocumentsComplete && isSiteVisitComplete;

  const activeColor = themeSettings?.sidebarActiveColor || '#D97706';

  const handleFinalApprove = () => {
    updateStage(id, 5, { 
      status: 'Approved', 
      officerName: currentUser || 'Admin',
      completedDate: new Date().toISOString(),
      remarks: 'Application fully scrutinized and sanctioned according to municipal building bye-laws.',
      finalNo: `TN-DTCP-PERMIT-${Date.now().toString().slice(-6)}`
    });
    setApproveModal(false);
    if (pushLiveToast) pushLiveToast('Permit Sanctioned', `Application ${app.id} approved successfully`, 'success');
  };

  const handleFinalReject = () => {
    if (!finalRejectReason.trim()) return alert('Please enter a rejection reason.');
    updateStage(id, 5, { 
      status: 'Rejected', 
      officerName: currentUser || 'Admin',
      completedDate: new Date().toISOString(),
      remarks: finalRejectReason 
    });
    setRejectModal(false);
    setFinalRejectReason('');
    if (pushLiveToast) pushLiveToast('Permit Rejected', `Application ${app.id} rejected: ${finalRejectReason}`, 'warning');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* 1. Modern Breadcrumb & Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button 
          onClick={() => navigate(currentUser === 'Admin' ? '/admin/applications' : '/worker/applications')} 
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} /> Back to Applications Directory
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {app.mobile && (
            <a
              href={`https://wa.me/${app.mobile}?text=${encodeURIComponent(`Hello ${app.applicantName}, regarding your building application ${app.id} on BuildPermit Portal.`)}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm"
              style={{ backgroundColor: '#25D366', color: 'white', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}
              title="Message Applicant on WhatsApp"
            >
              <Send size={14} /> WhatsApp Applicant
            </a>
          )}

          <button
            onClick={() => downloadApplicationZipBundle(app)}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            title="Download full statutory documents bundle as ZIP archive"
          >
            <FolderArchive size={15} color="var(--primary)" /> Download ZIP
          </button>

          <button
            onClick={() => downloadApplicationPdfDossier(app)}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE' }}
            title="Generate & print/download official consolidated PDF Dossier"
          >
            <Printer size={15} /> Print / Export PDF
          </button>

          {currentUser === 'Admin' && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-sm"
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                border: '1px solid #FECACA',
                cursor: 'pointer'
              }}
              title="Permanently delete this application"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      </div>

      {/* 2. Hero Application Identity Card */}
      <div className="card" style={{ padding: '1.75rem 2rem', marginBottom: '1.5rem', borderLeft: `6px solid ${app.status === 'approved' ? '#10B981' : (app.status === 'rejected' ? '#EF4444' : activeColor)}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
                Application Dossier
              </span>
              <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 700 }}>
                {app.buildingType || 'Residential'}
              </span>
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 0.4rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {app.id}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-main)', fontWeight: 700 }}>
                <User size={16} color="var(--primary)" /> {app.applicantName}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Phone size={15} /> {app.mobile || 'N/A'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={15} /> {app.location || app.address || 'Chennai Zone'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={15} /> Submitted: <strong>{formatDate(app.createdAt)}</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <span style={{
              backgroundColor: app.status === 'approved' ? '#dcfce7' : (app.status === 'rejected' ? '#fee2e2' : '#eff6ff'),
              color: app.status === 'approved' ? '#166534' : (app.status === 'rejected' ? '#991b1b' : '#1e40af'),
              border: `1px solid ${app.status === 'approved' ? '#86efac' : (app.status === 'rejected' ? '#fca5a5' : '#bfdbfe')}`,
              padding: '0.45rem 1rem',
              borderRadius: '30px',
              fontSize: '0.85rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: app.status === 'approved' ? '#16a34a' : (app.status === 'rejected' ? '#dc2626' : '#2563eb') }} />
              {app.status === 'approved' ? 'Permit Approved & Cleared' : (app.status === 'rejected' ? 'Application Rejected' : (isDocumentsComplete ? 'Documents Verified (Site Visit Stage)' : 'Documents Under Scrutiny'))}
            </span>

            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Assigned Worker: <strong>{app.assignedWorker || app.workerName || 'Direct Customer (Admin)'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 3. 4-Stage Visual Progress Workflow */}
      <div className="card" style={{ padding: '1.5rem 1.75rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={18} color="var(--primary)" /> Statutory Clearance Workflow
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Stage <strong>{app.status === 'approved' ? '4/4' : isSiteVisitComplete ? '3/4' : isDocumentsComplete ? '2/4' : '1/4'}</strong>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
          
          {/* Stage 1: Submission */}
          <div style={{ 
            padding: '1rem', 
            borderRadius: '12px', 
            backgroundColor: '#f0fdf4', 
            border: '1px solid #86efac',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>STAGE 1</div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#065f46' }}>Application Submitted</div>
              <div style={{ fontSize: '0.72rem', color: '#047857' }}>{formatDate(app.createdAt)}</div>
            </div>
          </div>

          {/* Stage 2: Document Scrutiny */}
          <div style={{ 
            padding: '1rem', 
            borderRadius: '12px', 
            backgroundColor: isDocumentsComplete ? '#f0fdf4' : '#eff6ff', 
            border: isDocumentsComplete ? '1px solid #86efac' : '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: isDocumentsComplete ? '#dcfce7' : '#dbeafe', color: isDocumentsComplete ? '#16a34a' : '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
              {isDocumentsComplete ? <CheckCircle2 size={18} /> : <Clock size={18} />}
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: isDocumentsComplete ? '#166534' : '#1e40af', textTransform: 'uppercase' }}>STAGE 2</div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: isDocumentsComplete ? '#065f46' : '#1e3a8a' }}>
                {isDocumentsComplete ? 'Documents Verified' : 'Document Scrutiny'}
              </div>
              <div style={{ fontSize: '0.72rem', color: isDocumentsComplete ? '#047857' : '#2563eb' }}>
                {verifiedDocsCount} / {docsList.length || requiredDocsCount} Verified
              </div>
            </div>
          </div>

          {/* Stage 3: Site Inspection */}
          <div style={{ 
            padding: '1rem', 
            borderRadius: '12px', 
            backgroundColor: isSiteVisitComplete ? '#f0fdf4' : (isDocumentsComplete ? '#fff7ed' : '#f8fafc'), 
            border: isSiteVisitComplete ? '1px solid #86efac' : (isDocumentsComplete ? '1px solid #fed7aa' : '1px solid #e2e8f0'),
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: isSiteVisitComplete ? '#dcfce7' : (isDocumentsComplete ? '#ffedd5' : '#f1f5f9'), color: isSiteVisitComplete ? '#16a34a' : (isDocumentsComplete ? '#c2410c' : '#94a3b8'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
              {isSiteVisitComplete ? <CheckCircle2 size={18} /> : (isDocumentsComplete ? <Clock size={18} /> : <Lock size={16} />)}
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: isSiteVisitComplete ? '#166534' : (isDocumentsComplete ? '#9a3412' : '#64748b'), textTransform: 'uppercase' }}>STAGE 3</div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: isSiteVisitComplete ? '#065f46' : (isDocumentsComplete ? '#7c2d12' : '#64748b') }}>
                {isSiteVisitComplete ? 'Site Inspection Passed' : 'Site Visit Inspection'}
              </div>
              <div style={{ fontSize: '0.72rem', color: isSiteVisitComplete ? '#047857' : '#64748b' }}>
                {isSiteVisitComplete ? formatDate(siteVisitData.completedDate) : (isDocumentsComplete ? 'Ready for Inspection' : 'Locked')}
              </div>
            </div>
          </div>

          {/* Stage 4: Final Sanction */}
          <div style={{ 
            padding: '1rem', 
            borderRadius: '12px', 
            backgroundColor: app.status === 'approved' ? '#f0fdf4' : (app.status === 'rejected' ? '#fef2f2' : '#f8fafc'), 
            border: app.status === 'approved' ? '1px solid #86efac' : (app.status === 'rejected' ? '1px solid #fca5a5' : '1px solid #e2e8f0'),
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: app.status === 'approved' ? '#dcfce7' : (app.status === 'rejected' ? '#fee2e2' : '#f1f5f9'), color: app.status === 'approved' ? '#16a34a' : (app.status === 'rejected' ? '#dc2626' : '#94a3b8'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
              {app.status === 'approved' ? <CheckCircle2 size={18} /> : (app.status === 'rejected' ? <XCircle size={18} /> : <Lock size={16} />)}
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: app.status === 'approved' ? '#166534' : (app.status === 'rejected' ? '#991b1b' : '#64748b'), textTransform: 'uppercase' }}>STAGE 4</div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: app.status === 'approved' ? '#065f46' : (app.status === 'rejected' ? '#991b1b' : '#64748b') }}>
                {app.status === 'approved' ? 'Permit Sanctioned' : (app.status === 'rejected' ? 'Permit Denied' : 'Final Clearance')}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {app.status === 'approved' ? 'Official Sanction Issued' : (isReadyForFinalApproval ? 'Ready for Decision' : 'Awaiting Steps 2 & 3')}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Tab Navigation for Details */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', overflowX: 'auto' }}>
        {[
          { id: 'documents', label: 'Statutory Documents & Clearances', icon: FileCheck, count: `${verifiedDocsCount}/${docsList.length}` },
          { id: 'profile', label: 'Applicant & Building Specifications', icon: Building2 },
          { id: 'site_visit', label: 'Field Inspection & Site Visit', icon: HardHat },
          { id: 'approval', label: 'Final Sanction & Order', icon: BadgeCheck }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: isActive ? `3px solid ${activeColor}` : '3px solid transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <tab.icon size={17} color={isActive ? activeColor : 'inherit'} /> {tab.label}
              {tab.count && (
                <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', borderRadius: '12px', backgroundColor: isDocumentsComplete ? '#dcfce7' : '#f1f5f9', color: isDocumentsComplete ? '#166534' : '#475569', fontWeight: 700 }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: STATUTORY DOCUMENTS & SCRUTINY */}
      {activeTab === 'documents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={20} color="var(--primary)" /> Statutory Document Verification & Review
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                  Verify each required statutory proof before sanctioning field site inspection.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ 
                  fontSize: '0.8rem', 
                  fontWeight: 800, 
                  backgroundColor: isDocumentsComplete ? '#dcfce7' : '#fef3c7', 
                  color: isDocumentsComplete ? '#166534' : '#92400e', 
                  border: `1px solid ${isDocumentsComplete ? '#86efac' : '#fde68a'}`,
                  padding: '0.35rem 0.85rem', 
                  borderRadius: '20px' 
                }}>
                  {isDocumentsComplete ? '✓ All Documents Scrutinized' : `${verifiedDocsCount} of ${docsList.length} Verified`}
                </span>
              </div>
            </div>

            {/* Documents List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {docsList.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                  <FileText size={32} style={{ margin: '0 auto 0.5rem auto', opacity: 0.4 }} />
                  <p style={{ fontWeight: 600 }}>No statutory documents attached to this application.</p>
                </div>
              ) : (
                docsList.map((doc, idx) => {
                  const isVerified = doc.status === 'verified';
                  const isRejected = doc.status === 'reupload_required';

                  return (
                    <div 
                      key={doc.id || doc.name || idx}
                      style={{
                        backgroundColor: isVerified ? '#f0fdf4' : (isRejected ? '#fef2f2' : '#ffffff'),
                        border: isVerified ? '1px solid #86efac' : (isRejected ? '1.5px solid #ef4444' : '1px solid #cbd5e1'),
                        borderRadius: '12px',
                        padding: '1.15rem 1.35rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        flexWrap: 'wrap',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: '240px' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: isVerified ? '#dcfce7' : '#f1f5f9', color: isVerified ? '#166534' : '#64748b', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {idx + 1}
                          </span>
                          {doc.name}
                        </div>

                        {isVerified && (
                          <div style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 700, marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <CheckCircle2 size={14} /> Verified by <strong>{doc.verifiedBy || 'Admin'}</strong> on {formatDate(doc.verifiedAt || Date.now())}
                          </div>
                        )}

                        {isRejected && (
                          <div style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 700, marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <XCircle size={14} /> Re-upload Required: <em>{doc.rejectedReason || 'Document is unclear / blurry'}</em>
                          </div>
                        )}

                        {!isVerified && !isRejected && (
                          <div style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 600, marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Clock size={14} /> Pending Statutory Scrutiny
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        
                        {/* View Lightbox */}
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Eye size={14} /> Preview
                        </button>

                        {/* Download Document */}
                        <button
                          onClick={() => downloadSingleDocument(doc, app)}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          title="Download this document"
                        >
                          <Download size={14} /> Download
                        </button>

                        {/* Verify & Reject Actions for Admin */}
                        {currentUser === 'Admin' && !isVerified && (
                          <button
                            onClick={() => {
                              verifyDocument(app.id, doc.id, 'verified');
                              if (pushLiveToast) pushLiveToast('Document Verified', `"${doc.name}" marked as verified`, 'document');
                            }}
                            className="btn btn-sm"
                            style={{ backgroundColor: '#10b981', color: 'white', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', border: 'none' }}
                          >
                            <Check size={14} /> Verify
                          </button>
                        )}

                        {currentUser === 'Admin' && !isRejected && (
                          <button
                            onClick={() => setDocRejectModal(doc)}
                            className="btn btn-sm"
                            style={{ backgroundColor: '#ffffff', color: '#ef4444', border: '1px solid #fca5a5', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        )}

                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: APPLICANT & BUILDING SPECIFICATIONS */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
          
          {/* Applicant Info Card */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="var(--primary)" /> Applicant & Citizen Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>FULL NAME</div>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>{app.applicantName}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>MOBILE NUMBER</div>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>{app.mobile || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>EMAIL ADDRESS</div>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>{app.email || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>ID / AADHAAR NUMBER</div>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>{app.aadhaarNumber || 'Verified ID On File'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>DISTRICT / ZONE</div>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>{app.district || 'Chennai'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>TALUK / WARD</div>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>{app.taluk || app.village || 'City Zone'}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>FULL SITE ADDRESS</div>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem', lineHeight: 1.4 }}>{app.address || app.location || 'Chennai Main Road'}</div>
              </div>
            </div>
          </div>

          {/* Building Specifications Card */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} color="var(--primary)" /> Building & Construction Specifications
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>BUILDING CATEGORY</div>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>{app.buildingType || 'Residential'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>SURVEY / PATTA NO.</div>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>{app.surveyNumber || 'Survey No 14/2B'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>PLOT AREA</div>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>{app.buildingDetails?.plotArea || '1,200 sq.ft'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>PROPOSED BUILT-UP AREA</div>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>{app.buildingDetails?.builtUpArea || '2,100 sq.ft'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>FLOORS STRUCTURE</div>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>{app.buildingDetails?.noOfFloors || 'G+2 Floors'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>PERMIT PROJECT NAME</div>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>{app.projectName || 'Residential Housing Construction'}</div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: FIELD INSPECTION & SITE VISIT */}
      {activeTab === 'site_visit' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HardHat size={20} color="var(--primary)" /> Field Site Visit Inspection & Physical Audit
          </h3>

          {!isDocumentsComplete ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem', backgroundColor: '#fff7ed', color: '#c2410c', borderRadius: '12px', border: '1px solid #fed7aa', fontWeight: 700, fontSize: '0.9rem' }}>
              <Lock size={20} /> Complete statutory document verification first to unlock field site inspection.
            </div>
          ) : siteVisitData.status !== 'Completed' ? (
            <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                All statutory documents have been successfully verified. The site inspection officer can now conduct the physical on-site audit and mark the inspection as complete.
              </p>
              {currentUser === 'Admin' && (
                <button 
                  onClick={() => {
                    updateStage(id, 4, { 
                      status: 'Completed', 
                      completedDate: new Date().toISOString(),
                      officerName: currentUser || 'Admin' 
                    });
                    if (pushLiveToast) pushLiveToast('Site Visit Completed', `Physical inspection cleared for ${app.id}`, 'worker');
                  }}
                  className="btn btn-primary"
                  style={{ backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: 800, padding: '0.65rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <CheckCircle2 size={18} /> Mark Site Visit as Completed
                </button>
              )}
            </div>
          ) : (
            <div style={{ padding: '1.5rem', border: '1px solid #86efac', borderRadius: '12px', backgroundColor: '#f0fdf4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>
                <CheckCircle2 size={22} color="#16a34a" /> Site Visit Inspection Successfully Completed
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', color: '#0f172a', fontSize: '0.875rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>INSPECTING OFFICER</div>
                  <div style={{ fontWeight: 800, marginTop: '0.2rem' }}>{siteVisitData.officerName || 'Admin'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>COMPLETION DATE</div>
                  <div style={{ fontWeight: 800, marginTop: '0.2rem' }}>{formatDate(siteVisitData.completedDate)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>INSPECTION STATUS</div>
                  <div style={{ fontWeight: 800, marginTop: '0.2rem', color: '#16a34a' }}>Physical Clearance Granted</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: FINAL SANCTION & STATUTORY DECISION */}
      {activeTab === 'approval' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BadgeCheck size={20} color="var(--primary)" /> Final Statutory Approval & Permit Sanction
          </h3>

          {app.status === 'approved' ? (
            <div style={{ padding: '1.75rem', backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontWeight: 900, fontSize: '1.25rem', marginBottom: '1rem' }}>
                <CheckCircle2 size={24} color="#16a34a" /> Official Building Permit Sanctioned
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', fontSize: '0.88rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>SANCTIONING OFFICER</div>
                  <div style={{ fontWeight: 800, marginTop: '0.2rem' }}>{app.stages?.[5]?.officerName || 'Directorate Officer'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>SANCTION DATE</div>
                  <div style={{ fontWeight: 800, marginTop: '0.2rem' }}>{formatDate(app.stages?.[5]?.completedDate || Date.now())}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>SANCTION ORDER REF</div>
                  <div style={{ fontWeight: 800, marginTop: '0.2rem', fontFamily: 'monospace', color: '#166534' }}>{app.stages?.[5]?.finalNo || `GOV-TN-${app.id}`}</div>
                </div>
              </div>
            </div>
          ) : !isReadyForFinalApproval ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem', backgroundColor: '#fff7ed', color: '#c2410c', borderRadius: '12px', border: '1px solid #fed7aa', fontWeight: 700, fontSize: '0.9rem' }}>
              <Lock size={20} /> Both Document Scrutiny and Field Site Inspection must be completed to unlock Final Sanction.
            </div>
          ) : (
            <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '1.25rem', fontWeight: 600 }}>
                All prerequisite checks (Statutory Documents + Field Site Inspection) have been fully cleared. You may now sanction or reject the official building clearance.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => setApproveModal(true)}
                  className="btn btn-primary"
                  style={{ backgroundColor: '#10b981', borderColor: '#10b981', padding: '0.75rem 1.75rem', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <CheckCircle2 size={18} /> Grant Final Approval
                </button>
                <button 
                  onClick={() => setRejectModal(true)}
                  className="btn btn-outline"
                  style={{ color: '#ef4444', borderColor: '#fca5a5', padding: '0.75rem 1.5rem', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <XCircle size={18} /> Reject Application
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reject Document Modal */}
      {docRejectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #cbd5e1' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.4rem 0', color: '#dc2626' }}>Reject Document</h3>
            <p style={{ fontSize: '0.88rem', color: '#475569', fontWeight: 700, margin: '0 0 1.25rem 0' }}>{docRejectModal.name}</p>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>Reason for Rejection</label>
              <textarea 
                rows={3}
                placeholder="e.g. Document is unclear / blurry. Please re-upload a clear scanned copy."
                value={docRejectReason}
                onChange={e => setDocRejectReason(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.88rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setDocRejectModal(null)} className="btn btn-outline btn-sm">Cancel</button>
              <button 
                onClick={() => {
                  if (!docRejectReason.trim()) return alert('Please provide a rejection reason');
                  verifyDocument(app.id, docRejectModal.id, 'reupload_required', docRejectReason);
                  setDocRejectModal(null);
                  setDocRejectReason('');
                  if (pushLiveToast) pushLiveToast('Document Rejected', `Re-upload requested for "${docRejectModal.name}"`, 'warning');
                }}
                className="btn btn-sm"
                style={{ backgroundColor: '#dc2626', color: 'white', fontWeight: 800, border: 'none' }}
              >
                Reject Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Lightbox Modal */}
      {previewDoc && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '850px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} /> Document Preview: {previewDoc.name}
              </div>
              <button onClick={() => setPreviewDoc(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '2rem', flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              {previewDoc.file ? (
                previewDoc.file.startsWith('data:image') || previewDoc.file.includes('base64') ? (
                  <img src={previewDoc.file} alt={previewDoc.name} style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                ) : (
                  <iframe src={previewDoc.file} title={previewDoc.name} style={{ width: '100%', height: '500px', border: 'none' }} />
                )
              ) : (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>
                  <FileText size={48} style={{ margin: '0 auto 0.75rem auto', opacity: 0.3 }} />
                  <p style={{ fontWeight: 700 }}>Official Statutory Document ({previewDoc.name})</p>
                </div>
              )}
            </div>
            <div style={{ padding: '0.85rem 1.5rem', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button onClick={() => downloadSingleDocument(previewDoc, app)} className="btn btn-outline btn-sm">
                <Download size={14} /> Download File
              </button>
              <button onClick={() => setPreviewDoc(null)} className="btn btn-primary btn-sm">
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Final Approve Modal */}
      {approveModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #cbd5e1' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.4rem 0', color: 'var(--primary)' }}>Grant Statutory Sanction?</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>
              Are you sure you want to approve and sanction the building permit for application <strong>{app.id}</strong> ({app.applicantName})?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setApproveModal(false)} className="btn btn-outline btn-sm">Cancel</button>
              <button onClick={handleFinalApprove} className="btn btn-primary btn-sm" style={{ backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: 800 }}>
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Reject Modal */}
      {rejectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #cbd5e1' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.4rem 0', color: '#dc2626' }}>Reject Application</h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>Rejection Reason</label>
              <textarea rows={3} placeholder="State reasons for building clearance refusal..." value={finalRejectReason} onChange={e => setFinalRejectReason(e.target.value)} style={{ width: '100%', padding: '0.75rem', fontSize: '0.88rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setRejectModal(false)} className="btn btn-outline btn-sm">Cancel</button>
              <button onClick={handleFinalReject} className="btn btn-sm" style={{ backgroundColor: '#dc2626', color: 'white', fontWeight: 800, border: 'none' }}>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Application Modal */}
      {showDeleteModal && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(15, 23, 42, 0.65)', 
            backdropFilter: 'blur(4px)', 
            zIndex: 9999, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '1rem' 
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) setShowDeleteModal(false);
          }}
        >
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={22} color="#DC2626" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>Delete Application?</h3>
                <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Permanent action</span>
              </div>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete application <strong>{app.id}</strong> ({app.applicantName})? This record will be erased from the database and cannot be recovered.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button 
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)} 
                className="btn btn-outline btn-sm"
              >
                Cancel
              </button>
              <button 
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await deleteApplication(app.id);
                    navigate(currentUser === 'Admin' ? '/admin/applications' : '/worker/applications');
                  } catch (err) {
                    alert('Failed to delete application: ' + err.message);
                    setIsDeleting(false);
                  }
                }} 
                className="btn btn-sm" 
                style={{ backgroundColor: '#DC2626', color: 'white', fontWeight: 800, border: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Trash2 size={14} />
                {isDeleting ? 'Deleting...' : 'Delete Application'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

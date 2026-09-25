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
  Copy, 
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
  Download
} from 'lucide-react';
import { 
  downloadSingleDocument, 
  downloadApplicationZipBundle, 
  downloadApplicationPdfDossier 
} from '../../utils/documentExporter';

export default function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { applications, updateStage, updateAppStatus, currentUser, verifyDocument } = useApp();
  
  const [docRejectModal, setDocRejectModal] = useState(null);
  const [docRejectReason, setDocRejectReason] = useState('Document is unclear / blurry');
  const [previewDoc, setPreviewDoc] = useState(null); // Document preview lightbox

  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [finalRejectReason, setFinalRejectReason] = useState('');

  const app = applications.find(a => a.id === id);

  // Step 42.4: Admin Starts Verification — transition 'submitted' to 'documents_under_review' when Admin opens it
  useEffect(() => {
    if (app && (app.status === 'submitted' || app.status === 'new' || app.status === 'pending') && currentUser === 'Admin') {
      updateAppStatus(app.id, 'documents_under_review');
    }
  }, [app, currentUser, updateAppStatus]);

  if (!app) return (
    <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '16px', margin: '2rem' }}>
      <h2>Application Not Found</h2>
      <button onClick={() => navigate('/admin/applications')} style={{ backgroundColor: '#003366', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', cursor: 'pointer', marginTop: '1rem' }}>
        Back to Applications
      </button>
    </div>
  );

  // Step 42.8 Worker Restriction 🔐: Public direct customer applications (workerId = null) are strictly Admin-only
  if (currentUser !== 'Admin' && (!app.workerId || app.workerId === null || app.source === 'Customer Public')) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '16px', margin: '2rem auto', maxWidth: '600px', border: '2px solid #fee2e2' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔐</div>
        <h2 style={{ color: '#dc2626', fontWeight: 900, marginBottom: '0.5rem', fontSize: '1.5rem' }}>Worker Access Denied</h2>
        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Application <strong>{app.id}</strong> was submitted directly by a customer without an assigned field worker (<code>workerId = null</code>).<br />
          Workers are strictly restricted from viewing, verifying, or approving public customer applications.
        </p>
        <button onClick={() => navigate('/worker/applications')} style={{ backgroundColor: '#003366', color: 'white', padding: '0.75rem 1.75rem', borderRadius: '8px', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
          Back to My Applications
        </button>
      </div>
    );
  }

  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const siteVisitData = app.stages[4] || { status: 'Pending' };
  const docsList = app.documents || [];
  
  const requiredDocsCount = app.requiredDocs?.length || (docsList.length > 0 ? docsList.length : 6);
  const verifiedDocsCount = docsList.filter(d => d.status === 'verified').length;
  const pendingDocsCount = docsList.filter(d => d.status === 'pending' || !d.status).length;
  const rejectedDocsCount = docsList.filter(d => d.status === 'reupload_required').length;

  // Step 36: Automatic status check - if all documents are verified
  const isDocumentsComplete = docsList.length > 0 && verifiedDocsCount === docsList.length;
  const isSiteVisitComplete = siteVisitData.status === 'Completed';
  const isReadyForFinalApproval = isDocumentsComplete && isSiteVisitComplete;

  const uploadLink = `${window.location.origin}/track?id=${app.id}`;

  const handleFinalApprove = () => {
    updateStage(id, 5, { 
      status: 'Approved', 
      officerName: currentUser || 'Admin',
      completedDate: new Date().toISOString(),
      remarks: 'Approved',
      finalNo: `GOV-${Date.now()}`
    });
    setApproveModal(false);
  };

  const handleFinalReject = () => {
    if (!finalRejectReason) return alert('Please enter a rejection reason.');
    updateStage(id, 5, { 
      status: 'Rejected', 
      officerName: currentUser || 'Admin',
      completedDate: new Date().toISOString(),
      remarks: finalRejectReason 
    });
    setRejectModal(false);
    setFinalRejectReason('');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem', fontFamily: "'Inter', system-ui, sans-serif" }}>
      
      {/* 1. Step 34 Application Header */}
      <div className="card" style={{ marginBottom: '1.5rem', borderRadius: '16px', borderTop: '5px solid #003366', padding: '1.75rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <button onClick={() => navigate('/admin/applications')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#003366', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '0.85rem', fontSize: '0.875rem', fontWeight: 700 }}>
              <ArrowLeft size={16} /> Back to Applications Directory
            </button>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#003366', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Application ID
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: '0.1rem 0 0.4rem 0' }}>
              {app.id}
            </h1>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', margin: 0 }}>
              {app.applicantName}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{
              backgroundColor: app.status === 'approved' ? '#d1fae5' : (app.status === 'rejected' ? '#fee2e2' : '#eff6ff'),
              color: app.status === 'approved' ? '#047857' : (app.status === 'rejected' ? '#b91c1c' : '#1e40af'),
              border: `1px solid ${app.status === 'approved' ? '#6ee7b7' : (app.status === 'rejected' ? '#fca5a5' : '#bfdbfe')}`,
              padding: '0.5rem 1.1rem',
              borderRadius: '30px',
              fontSize: '0.875rem',
              fontWeight: 800,
              display: 'inline-block'
            }}>
              ● Status: {app.status === 'approved' ? 'Approved' : (app.status === 'rejected' ? 'Rejected' : (isDocumentsComplete ? 'Documents Verified (Ready for Site Visit)' : 'Documents Under Review'))}
            </span>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
              Submitted: <strong>{formatDate(app.createdAt)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Step 34 4-Stage Workflow Timeline */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.75rem 2rem', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#003366', marginBottom: '1.5rem' }}>
          Approval Process Flow
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #86efac' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857' }}>STAGE 1</div>
            <div style={{ fontWeight: 800, color: '#065f46', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={16} /> Application Submitted
            </div>
          </div>

          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: isDocumentsComplete ? '#f0fdf4' : '#eff6ff', border: isDocumentsComplete ? '1px solid #86efac' : '1px solid #bfdbfe' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isDocumentsComplete ? '#047857' : '#1e40af' }}>STAGE 2</div>
            <div style={{ fontWeight: 800, color: isDocumentsComplete ? '#065f46' : '#1d4ed8', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {isDocumentsComplete ? <CheckCircle2 size={16} /> : <Clock size={16} />} 
              {isDocumentsComplete ? 'Documents Verified' : 'Document Scrutiny'}
            </div>
          </div>

          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: isSiteVisitComplete ? '#f0fdf4' : (isDocumentsComplete ? '#eff6ff' : '#f8fafc'), border: isSiteVisitComplete ? '1px solid #86efac' : (isDocumentsComplete ? '1px solid #bfdbfe' : '1px solid #e2e8f0') }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isSiteVisitComplete ? '#047857' : '#64748b' }}>STAGE 3</div>
            <div style={{ fontWeight: 800, color: isSiteVisitComplete ? '#065f46' : (isDocumentsComplete ? '#1d4ed8' : '#64748b'), marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {isSiteVisitComplete ? <CheckCircle2 size={16} /> : (isDocumentsComplete ? <Clock size={16} /> : <Lock size={15} />)} 
              {isSiteVisitComplete ? 'Site Visit Done' : 'Site Visit Inspection'}
            </div>
          </div>

          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: app.status === 'approved' ? '#f0fdf4' : '#f8fafc', border: app.status === 'approved' ? '1px solid #86efac' : '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: app.status === 'approved' ? '#047857' : '#64748b' }}>STAGE 4</div>
            <div style={{ fontWeight: 800, color: app.status === 'approved' ? '#065f46' : '#64748b', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {app.status === 'approved' ? <CheckCircle2 size={16} /> : <Lock size={15} />} 
              {app.status === 'approved' ? 'Permit Approved' : 'Final Approval'}
            </div>
          </div>
        </div>
      </div>

      {/* 34.1 Customer Information Card */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.75rem 2rem', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#003366', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.65rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          👤 34.1 Customer Information
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>FULL NAME</div>
            <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{app.applicantName}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>MOBILE NUMBER</div>
            <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{app.mobile || '9876543210'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>EMAIL ADDRESS</div>
            <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{app.email || 'rajesh@example.com'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>ID NUMBER</div>
            <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{app.aadhaarNumber || '1234 5678 9012'}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>DISTRICT</div>
            <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{app.district || 'Chennai'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>TALUK</div>
            <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{app.taluk || 'Tambaram Taluk'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>VILLAGE / WARD</div>
            <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{app.village || 'Ward 142'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>FULL ADDRESS</div>
            <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{app.address || app.location || 'Chennai Main Road'}</div>
          </div>
        </div>
      </div>

      {/* 34.2 Building Information Card */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.75rem 2rem', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#003366', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.65rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🏗️ 34.2 Building Information
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>BUILDING TYPE</div>
            <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{app.buildingType || 'Residential'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>SURVEY NUMBER</div>
            <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{app.surveyNumber || 'Survey No 14/2B'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>PLOT AREA</div>
            <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{app.buildingDetails?.plotArea || '1200 sq.ft'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>PROPOSED BUILDING AREA</div>
            <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{app.buildingDetails?.builtUpArea || '2100 sq.ft'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>NUMBER OF FLOORS</div>
            <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{app.buildingDetails?.noOfFloors || 'G+2 Floors'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>PURPOSE OF BUILDING</div>
            <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{app.projectName || 'Residential Housing Construction'}</div>
          </div>
        </div>
      </div>

      {/* Step 35 Admin Document Verification & Step 36 Auto Status Calculation */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.75rem 2rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F2A4A', margin: 0 }}>
              📁 Step 35 — Admin Document Verification
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>
              Inspect and verify statutory attachments or download the full document bundle.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {docsList.length > 0 && (
              <>
                <button
                  onClick={() => downloadApplicationZipBundle(app)}
                  style={{
                    backgroundColor: '#0F2A4A',
                    color: 'white',
                    border: 'none',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                  title="Download all documents as a ZIP archive"
                >
                  <FolderArchive size={15} /> Download All (ZIP)
                </button>

                <button
                  onClick={() => downloadApplicationPdfDossier(app)}
                  style={{
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    border: '1px solid #93C5FD',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                  title="Generate & print/download consolidated PDF Dossier"
                >
                  <FileText size={15} /> PDF Dossier
                </button>
              </>
            )}

            <div style={{ fontSize: '0.825rem', fontWeight: 800, backgroundColor: isDocumentsComplete ? '#d1fae5' : '#fff7ed', color: isDocumentsComplete ? '#047857' : '#c2410c', border: `1px solid ${isDocumentsComplete ? '#6ee7b7' : '#ffedd5'}`, padding: '0.35rem 0.85rem', borderRadius: '20px' }}>
              {verifiedDocsCount} / {docsList.length || requiredDocsCount} Verified
            </div>
          </div>
        </div>

        {/* Step 36 Auto Status Banner */}
        <div style={{ backgroundColor: isDocumentsComplete ? '#f0fdf4' : '#eff6ff', border: isDocumentsComplete ? '1px solid #86efac' : '1px solid #bfdbfe', borderRadius: '10px', padding: '0.85rem 1.15rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: isDocumentsComplete ? '#166534' : '#1e40af', fontWeight: 700 }}>
          {isDocumentsComplete ? '✓ All Documents Verified — Application automatically progressed to Site Visit stage.' : `⏳ Document Scrutiny In Progress (${verifiedDocsCount} verified, ${pendingDocsCount} pending review).`}
        </div>

        {/* Documents List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {docsList.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
              No statutory documents attached to this application.
            </div>
          ) : (
            docsList.map((doc) => {
              const isVerified = doc.status === 'verified';
              const isRejected = doc.status === 'reupload_required';

              return (
                <div 
                  key={doc.id || doc.name}
                  style={{
                    backgroundColor: isVerified ? '#f0fdf4' : (isRejected ? '#fef2f2' : '#ffffff'),
                    border: isVerified ? '1px solid #86efac' : (isRejected ? '2px solid #ef4444' : '1px solid #cbd5e1'),
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <FileText size={18} color="#003366" /> {doc.name}
                    </div>

                    {isVerified && (
                      <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700, marginTop: '0.35rem' }}>
                        ✓ Document Verified • Verified by: <strong>{doc.verifiedBy || 'Admin'}</strong> on {formatDate(doc.verifiedAt || Date.now())}
                      </div>
                    )}

                    {isRejected && (
                      <div style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 700, marginTop: '0.35rem' }}>
                        ✕ Re-upload Required • Reason: {doc.rejectedReason || 'Document is unclear / blurry'}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {/* View Document Button */}
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#003366',
                        padding: '0.5rem 0.85rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Eye size={15} /> View
                    </button>

                    {/* Download Document Button */}
                    <button
                      onClick={() => downloadSingleDocument(doc, app)}
                      style={{
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        color: '#0F2A4A',
                        padding: '0.5rem 0.85rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                      title="Download this document"
                    >
                      <Download size={15} /> Download
                    </button>

                    {/* Step 35 Action Buttons */}
                    {!isVerified && !isRejected && (
                      <>
                        <button
                          onClick={() => verifyDocument(app.id, doc.id, 'verified')}
                          style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.5rem 0.9rem', fontSize: '0.8rem', fontWeight: 800, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <Check size={16} /> Verify
                        </button>
                        <button
                          onClick={() => setDocRejectModal(doc)}
                          style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 0.9rem', fontSize: '0.8rem', fontWeight: 800, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Step 37 Site Visit Section */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.75rem 2rem', borderRadius: '16px', opacity: isDocumentsComplete ? 1 : 0.6 }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#003366', marginBottom: '1.25rem' }}>
          📍 Step 37 — Site Visit Inspection
        </h3>

        {!isDocumentsComplete ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', backgroundColor: '#fff7ed', color: '#c2410c', borderRadius: '10px', fontWeight: 700, fontSize: '0.875rem' }}>
            <Lock size={16} /> Complete document verification first to unlock Site Visit inspection.
          </div>
        ) : siteVisitData.status !== 'Completed' ? (
          <div>
            <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              All documents verified. Admin or authorized field officer can complete the site visit.
            </p>
            <button 
              onClick={() => {
                updateStage(id, 4, { 
                  status: 'Completed', 
                  completedDate: new Date().toISOString(),
                  officerName: currentUser || 'Admin' 
                });
              }}
              style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.75rem 1.75rem', fontSize: '0.925rem', fontWeight: 800, borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
            >
              <CheckCircle2 size={18} /> ✓ Site Visit Completed
            </button>
          </div>
        ) : (
          <div style={{ padding: '1.35rem 1.65rem', border: '1px solid #86efac', borderRadius: '12px', backgroundColor: '#f0fdf4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#047857', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>
              <CheckCircle2 size={22} color="#10b981" /> ✓ Site Visit Completed
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', color: '#0f172a', fontSize: '0.875rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>COMPLETED BY</div>
                <div style={{ fontWeight: 800, marginTop: '0.2rem' }}>{siteVisitData.officerName || currentUser || 'Admin'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>DATE</div>
                <div style={{ fontWeight: 800, marginTop: '0.2rem' }}>{new Date(siteVisitData.completedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>TIME</div>
                <div style={{ fontWeight: 800, marginTop: '0.2rem' }}>{new Date(siteVisitData.completedDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step 38 Final Approval Section */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.75rem 2rem', borderRadius: '16px', opacity: isReadyForFinalApproval || app.status === 'approved' || app.status === 'rejected' ? 1 : 0.6 }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#003366', marginBottom: '1.25rem' }}>
          🏛️ Step 38 — Final Approval
        </h3>

        {app.status === 'approved' ? (
          <div style={{ padding: '1.5rem', backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#047857', fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.85rem' }}>
              <CheckCircle2 size={24} color="#10b981" /> ✓ Application Approved
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', color: '#0f172a', fontSize: '0.875rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>APPROVED BY</div>
                <div style={{ fontWeight: 800, marginTop: '0.2rem' }}>{app.stages[5]?.officerName || 'Admin'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>APPROVED DATE</div>
                <div style={{ fontWeight: 800, marginTop: '0.2rem' }}>{app.stages[5]?.completedDate ? formatDate(app.stages[5].completedDate) : formatDate(Date.now())}</div>
              </div>
            </div>
          </div>
        ) : !isReadyForFinalApproval ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', backgroundColor: '#fff7ed', color: '#c2410c', borderRadius: '10px', fontWeight: 700, fontSize: '0.875rem' }}>
            <Lock size={16} /> Complete Site Visit first to unlock Final Approval.
          </div>
        ) : (
          <div>
            <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.25rem', fontWeight: 600 }}>
              All documents & site inspection verified. Grant final statutory permit clearance.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setApproveModal(true)}
                style={{ backgroundColor: '#003366', color: 'white', border: 'none', padding: '0.85rem 2rem', fontSize: '0.95rem', fontWeight: 800, borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(0,51,102,0.3)' }}
              >
                <CheckCircle2 size={18} /> ✓ Approve Application
              </button>
              <button 
                onClick={() => setRejectModal(true)}
                style={{ backgroundColor: '#ffffff', color: '#ef4444', border: '2px solid #ef4444', padding: '0.85rem 1.75rem', fontSize: '0.95rem', fontWeight: 800, borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <XCircle size={18} /> ✕ Reject Application
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Document Modal (Step 35) */}
      {docRejectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #cbd5e1' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#dc2626' }}>Reject Document</h3>
            <p style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 700, margin: '0 0 1.25rem 0' }}>{docRejectModal.name}</p>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>Reason for Rejection</label>
              <textarea 
                rows={3}
                placeholder="e.g. Document is unclear / blurry. Please re-upload clear copy."
                value={docRejectReason}
                onChange={e => setDocRejectReason(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setDocRejectModal(null)} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button 
                onClick={() => {
                  if (!docRejectReason) return alert('Please provide a rejection reason');
                  verifyDocument(app.id, docRejectModal.id, 'reupload_required', docRejectReason);
                  setDocRejectModal(null);
                  setDocRejectReason('');
                }}
                style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
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
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '800px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ backgroundColor: '#003366', color: 'white', padding: '1.25rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>📄 Document Preview: {previewDoc.name}</div>
              <button onClick={() => setPreviewDoc(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={22} /></button>
            </div>
            <div style={{ padding: '2rem', flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              {previewDoc.file ? (
                previewDoc.file.startsWith('data:image') || previewDoc.file.includes('base64') ? (
                  <img src={previewDoc.file} alt={previewDoc.name} style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                ) : (
                  <iframe src={previewDoc.file} title={previewDoc.name} style={{ width: '100%', height: '500px', border: 'none' }} />
                )
              ) : (
                <div style={{ textAlign: 'center', color: '#64748b' }}>Statutory Document Attached ({previewDoc.name})</div>
              )}
            </div>
            <div style={{ padding: '1rem 1.75rem', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setPreviewDoc(null)} style={{ backgroundColor: '#003366', color: 'white', padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Close Preview</button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {approveModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #cbd5e1' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#003366' }}>Approve Application?</h3>
            <p style={{ fontSize: '0.9rem', color: '#475569', margin: '0 0 1.5rem 0' }}>Are you sure you want to approve permit for <strong>{app.id}</strong> ({app.applicantName})?</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setApproveModal(false)} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleFinalApprove} style={{ backgroundColor: '#003366', color: 'white', border: 'none', padding: '0.65rem 1.75rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>Confirm Approval</button>
            </div>
          </div>
        </div>
      )}

      {/* Final Reject Modal */}
      {rejectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #cbd5e1' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#dc2626' }}>Reject Application</h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>Rejection Reason</label>
              <textarea rows={3} placeholder="Enter reason for rejection..." value={finalRejectReason} onChange={e => setFinalRejectReason(e.target.value)} style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setRejectModal(false)} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleFinalReject} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>Reject Application</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

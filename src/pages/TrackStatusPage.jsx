import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  UploadCloud, 
  ArrowLeft, 
  Building2, 
  ShieldCheck, 
  MapPin, 
  User, 
  Calendar,
  Check,
  RefreshCw,
  XCircle,
  AlertTriangle,
  Award
} from 'lucide-react';

export default function TrackStatusPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { applications = [], reuploadCustomerDocument, pushLiveToast } = useApp();

  // Extract ID from URL query params (e.g. ?id=APP-2026-00125)
  const queryParams = new URLSearchParams(location.search);
  const initialId = queryParams.get('id') || 'APP-2026-00125';

  const [searchId, setSearchId] = useState(initialId);
  const [activeApp, setActiveApp] = useState(null);
  const [searched, setSearched] = useState(false);
  const [reuploadSuccessDoc, setReuploadSuccessDoc] = useState(null);

  const performSearch = (targetId) => {
    const query = (targetId || searchId).trim().toUpperCase();
    if (!query) return;

    const found = applications.find(a => 
      a && a.id && (
        a.id.toUpperCase() === query || 
        (a.mobile && a.mobile.includes(query)) ||
        (a.applicantName && a.applicantName.toUpperCase().includes(query))
      )
    );

    setActiveApp(found || null);
    setSearched(true);
  };

  useEffect(() => {
    if (initialId && applications.length > 0) {
      performSearch(initialId);
    }
  }, [initialId, applications]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(searchId);
  };

  // Section 39.10 - Selective Re-upload for Rejected Document
  const handleReuploadFile = (docName, file) => {
    if (!file || !activeApp) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      reuploadCustomerDocument(activeApp.id, docName, uploadEvent.target.result);
      setReuploadSuccessDoc(docName);
      
      // Notify Admin
      if (pushLiveToast) {
        pushLiveToast('Document Re-uploaded', `${docName} re-uploaded for ${activeApp.id}`, 'document');
      }

      setTimeout(() => setReuploadSuccessDoc(null), 4000);
    };
    reader.readAsDataURL(file);
  };

  // Format Date cleanly (39.2)
  const formatAppDate = (dateStr) => {
    if (!dateStr) return '24 Sep 2026';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return '24 Sep 2026';
    }
  };

  // Determine stage levels for 39.3 timeline
  const getStageStates = (app) => {
    if (!app) return { stage1: 'completed', stage2: 'pending', stage3: 'pending', stage4: 'pending', stage5: 'pending' };

    const docs = app.documents || [];
    const isRejected = app.status === 'rejected';
    const isApproved = app.status === 'approved' || app.stages?.[5]?.status === 'Approved';
    const isSiteVisitDone = app.stages?.[4]?.status === 'Completed' || app.status === 'site_visit_completed';
    const isDocsVerified = app.status === 'documents_verified' || (docs.length > 0 && docs.every(d => d.status === 'verified'));
    const isDocsUnderReview = app.status === 'under_review' || docs.some(d => d.status === 'pending');

    if (isRejected) {
      return { stage1: 'completed', stage2: 'rejected', stage3: 'rejected', stage4: 'rejected', stage5: 'rejected' };
    }

    if (isApproved) {
      return { stage1: 'completed', stage2: 'completed', stage3: 'completed', stage4: 'completed', stage5: 'completed' };
    }

    if (isSiteVisitDone) {
      return { stage1: 'completed', stage2: 'completed', stage3: 'completed', stage4: 'completed', stage5: 'active' };
    }

    if (isDocsVerified) {
      return { stage1: 'completed', stage2: 'completed', stage3: 'completed', stage4: 'active', stage5: 'upcoming' };
    }

    if (isDocsUnderReview) {
      return { stage1: 'completed', stage2: 'completed', stage3: 'active', stage4: 'upcoming', stage5: 'upcoming' };
    }

    return { stage1: 'completed', stage2: 'active', stage3: 'upcoming', stage4: 'upcoming', stage5: 'upcoming' };
  };

  const getStatusDisplayLabel = (app) => {
    if (!app) return 'Documents Under Review';
    if (app.status === 'approved') return 'Application Approved';
    if (app.status === 'rejected') return 'Application Rejected';
    if (app.status === 'site_visit_completed' || app.stages?.[4]?.status === 'Completed') return 'Site Visit Completed';
    if (app.status === 'documents_verified') return 'Documents Verified';
    if (app.status === 'under_review') return 'Documents Under Review';
    return 'Application Submitted';
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#f4f6f9', color: '#1e293b', fontFamily: "'Inter', system-ui, sans-serif" }}>
      
      {/* Top Official Government Banner */}
      <div style={{ position: 'sticky', top: 0, zIndex: 1000, width: '100%', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #cbd5e1', padding: '0.85rem 2.5rem' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
              <div style={{ backgroundColor: '#003366', color: 'white', padding: '0.65rem 0.75rem', borderRadius: '12px' }}>
                <Building2 size={26} />
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#003366' }}>
                  ApprovalTrack <span style={{ fontSize: '0.75rem', backgroundColor: '#e6f0fa', color: '#003366', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>PUBLIC TRACKING</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                  Citizen Building Approval Status Portal
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => navigate('/')} 
                style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#003366', padding: '0.55rem 1.15rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ArrowLeft size={16} /> Back to Home
              </button>
              <button 
                onClick={() => navigate('/apply')} 
                style={{ backgroundColor: '#003366', color: 'white', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
              >
                + Apply Now
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Main Content Wrapper */}
      <div style={{ maxWidth: '960px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
        
        {/* Section 39.1 — Track Application Screen */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 8px 25px rgba(0,0,0,0.05)', border: '1px solid #cbd5e1', padding: '2.5rem', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#003366', margin: '0 0 0.4rem 0', textAlign: 'center' }}>
            Track Your Application
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#64748b', textAlign: 'center', margin: '0 auto 1.75rem auto', maxWidth: '520px' }}>
            Enter your Application ID to check the current status of your building approval.
          </p>

          <form onSubmit={handleSearchSubmit} style={{ maxWidth: '560px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                <Search size={20} color="#64748b" style={{ position: 'absolute', left: '1rem' }} />
                <input 
                  type="text" 
                  placeholder="e.g. APP-2026-00125"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.85rem', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', border: '2px solid #003366', borderRadius: '10px', outline: 'none' }}
                />
              </div>
              <button 
                type="submit"
                style={{ backgroundColor: '#003366', color: '#ffffff', border: 'none', padding: '0.85rem 2.25rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,51,102,0.35)' }}
              >
                Track Status
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', margin: 0, fontWeight: 500 }}>
              Your Application ID was provided after successfully submitting your application.
            </p>
          </form>
        </div>

        {/* 39.10 Re-upload Success Toast */}
        {reuploadSuccessDoc && (
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderLeft: '5px solid #10b981', color: '#166534', padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <CheckCircle2 size={22} color="#10b981" /> Document "{reuploadSuccessDoc}" re-uploaded successfully! Status updated to Under Review.
          </div>
        )}

        {/* Results Showcase */}
        {activeApp ? (
          <div>
            
            {/* Section 39.2 — Application Summary (Public Only, No Internal Data 🔐) */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #cbd5e1', borderTop: '6px solid #003366', padding: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.04)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#003366', margin: '0 0 0.25rem 0' }}>
                    Application Summary
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Official Citizen Tracking Portal • Tamil Nadu Municipal Clearance
                  </div>
                </div>

                <span style={{
                  backgroundColor: activeApp.status === 'approved' ? '#d1fae5' : (activeApp.status === 'rejected' ? '#fee2e2' : '#e0f2fe'),
                  color: activeApp.status === 'approved' ? '#047857' : (activeApp.status === 'rejected' ? '#b91c1c' : '#0369a1'),
                  border: `1px solid ${activeApp.status === 'approved' ? '#6ee7b7' : (activeApp.status === 'rejected' ? '#fca5a5' : '#7dd3fc')}`,
                  padding: '0.45rem 1.15rem',
                  borderRadius: '30px',
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  {activeApp.status === 'approved' ? '✓ APPROVED' : (activeApp.status === 'rejected' ? '✕ REJECTED' : '● UNDER REVIEW')}
                </span>
              </div>

              {/* 39.2 4 Summary Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Application ID</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginTop: '0.2rem' }}>{activeApp.id}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Applicant</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>{activeApp.applicantName}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Application Date</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>{formatAppDate(activeApp.createdAt)}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Current Status</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: activeApp.status === 'approved' ? '#047857' : (activeApp.status === 'rejected' ? '#dc2626' : '#003366'), marginTop: '0.2rem' }}>
                    {getStatusDisplayLabel(activeApp)}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 39.11 — Rejected Application Banner */}
            {activeApp.status === 'rejected' && (
              <div style={{ backgroundColor: '#fef2f2', border: '2px solid #ef4444', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 8px 20px rgba(239,68,68,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#b91c1c' }}>
                  <XCircle size={32} />
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>✕ Application Rejected</h3>
                </div>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #fca5a5', padding: '1.15rem 1.35rem', borderRadius: '12px', fontSize: '0.95rem', color: '#991b1b', lineHeight: 1.6 }}>
                  <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Reason:</strong>
                  {activeApp.rejectionReason || activeApp.remarks || 'Required property documents could not be verified.'}
                </div>
              </div>
            )}

            {/* Section 39.8 — Approved Application Banner */}
            {activeApp.status === 'approved' && (
              <div style={{ backgroundColor: '#f0fdf4', border: '2px solid #10b981', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', textAlign: 'center', boxShadow: '0 8px 20px rgba(16,185,129,0.1)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#065f46', margin: '0 0 0.5rem 0' }}>
                  Your building approval application has been approved.
                </h2>
                <p style={{ fontSize: '1rem', color: '#047857', margin: 0, fontWeight: 600 }}>
                  Official digitally signed QR-coded Building Permit Order is active for construction commencement.
                </p>
              </div>
            )}

            {/* Section 39.3 — Application Progress Stepper Timeline */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #cbd5e1', padding: '2.25rem', boxShadow: '0 10px 25px rgba(0,0,0,0.04)', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#003366', marginBottom: '1.75rem' }}>
                Application Progress
              </h2>

              {(() => {
                const stages = getStageStates(activeApp);

                const timelineItems = [
                  {
                    id: 1,
                    symbol: '✓',
                    title: 'Application Submitted',
                    desc: `Your application has been successfully submitted.\nApplication ID: ${activeApp.id}`,
                    state: 'completed'
                  },
                  {
                    id: 2,
                    symbol: stages.stage2 === 'completed' ? '✓' : (stages.stage2 === 'active' ? '●' : '○'),
                    title: 'Documents Uploaded',
                    desc: (activeApp.documents || []).length > 0 ? `${(activeApp.documents || []).length} statutory document files attached` : 'Documents uploaded',
                    state: stages.stage2
                  },
                  {
                    id: 3,
                    symbol: stages.stage3 === 'completed' ? '✓' : (stages.stage3 === 'active' ? '●' : '○'),
                    title: 'Document Verification',
                    desc: stages.stage3 === 'completed' ? 'All required documents have been verified. Your application is ready for the site visit.' : (stages.stage3 === 'active' ? 'Your documents are currently being reviewed. Please wait for the verification process to complete.' : 'Pending document verification'),
                    state: stages.stage3
                  },
                  {
                    id: 4,
                    symbol: stages.stage4 === 'completed' ? '✓' : (stages.stage4 === 'active' ? '●' : '○'),
                    title: 'Site Visit',
                    desc: stages.stage4 === 'completed' ? 'Site visit has been completed. Your application is waiting for final approval.' : (stages.stage4 === 'active' ? 'Field officer scheduled for geotagged site inspection' : 'Pending site visit inspection'),
                    state: stages.stage4
                  },
                  {
                    id: 5,
                    symbol: stages.stage5 === 'completed' ? '✓' : (stages.stage5 === 'active' ? '●' : '○'),
                    title: 'Final Approval',
                    desc: stages.stage5 === 'completed' ? '🎉 Your building approval application has been approved.' : 'Pending final Municipal Commissioner clearance',
                    state: stages.stage5
                  }
                ];

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {timelineItems.map((item, idx) => {
                      const isCompleted = item.state === 'completed';
                      const isActive = item.state === 'active';
                      const isRejected = item.state === 'rejected';

                      return (
                        <div key={item.id} style={{ display: 'flex', gap: '1.25rem', position: 'relative', paddingBottom: idx < timelineItems.length - 1 ? '1.75rem' : '0' }}>
                          
                          {/* Vertical Connecting Line */}
                          {idx < timelineItems.length - 1 && (
                            <div style={{
                              position: 'absolute',
                              left: '17px',
                              top: '36px',
                              bottom: 0,
                              width: '3px',
                              backgroundColor: isCompleted ? '#10b981' : '#e2e8f0',
                              zIndex: 0
                            }}></div>
                          )}

                          {/* Bullet Icon Symbol */}
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            backgroundColor: isCompleted ? '#10b981' : (isActive ? '#003366' : (isRejected ? '#ef4444' : '#f1f5f9')),
                            color: isCompleted || isActive || isRejected ? '#ffffff' : '#94a3b8',
                            border: `2px solid ${isCompleted ? '#10b981' : (isActive ? '#003366' : (isRejected ? '#ef4444' : '#cbd5e1'))}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                            fontSize: '1rem',
                            zIndex: 1,
                            flexShrink: 0,
                            boxShadow: isActive ? '0 0 0 4px rgba(0,51,102,0.18)' : 'none'
                          }}>
                            {item.symbol}
                          </div>

                          {/* Stage Text & Description */}
                          <div style={{ flex: 1, paddingTop: '0.2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: isCompleted ? '#065f46' : (isActive ? '#003366' : '#64748b'), margin: 0 }}>
                                {item.title}
                              </h3>
                              {isActive && (
                                <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.55rem', borderRadius: '12px' }}>
                                  ● Current Stage
                                </span>
                              )}
                            </div>
                            
                            <p style={{ fontSize: '0.875rem', color: isCompleted ? '#334155' : (isActive ? '#1e293b' : '#94a3b8'), margin: '0.3rem 0 0 0', lineHeight: 1.5, whiteSpace: 'pre-line', fontWeight: isActive ? 600 : 400 }}>
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Section 39.9 & 39.10 — Documents List & Selective Re-Upload */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #cbd5e1', padding: '2.25rem', boxShadow: '0 10px 25px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#003366', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                Documents
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(activeApp.documents || []).length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                    No documents attached yet.
                  </div>
                ) : (
                  (activeApp.documents || []).map((doc) => {
                    const isVerified = doc.status === 'verified';
                    const isRejectedDoc = doc.status === 'reupload_required';

                    return (
                      <div 
                        key={doc.id || doc.name}
                        style={{
                          backgroundColor: isVerified ? '#f0fdf4' : (isRejectedDoc ? '#fef2f2' : '#ffffff'),
                          border: isVerified ? '1px solid #86efac' : (isRejectedDoc ? '2px solid #ef4444' : '1px solid #cbd5e1'),
                          borderRadius: '12px',
                          padding: '1.25rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '1rem'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: '240px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: 800, fontSize: '1rem', color: isVerified ? '#065f46' : (isRejectedDoc ? '#991b1b' : '#0f172a') }}>
                              {isVerified ? '✓ ' : (isRejectedDoc ? '✕ ' : '● ')}{doc.name}
                            </span>
                            {isRejectedDoc && (
                              <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '0.75rem', fontWeight: 800, padding: '0.15rem 0.55rem', borderRadius: '12px' }}>
                                Re-upload Required
                              </span>
                            )}
                          </div>

                          {/* 39.9 Rejection Reason Box */}
                          {isRejectedDoc && doc.rejectedReason && (
                            <div style={{ marginTop: '0.5rem', backgroundColor: '#ffffff', border: '1px solid #fca5a5', padding: '0.6rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', color: '#991b1b' }}>
                              <strong>Reason:</strong> {doc.rejectedReason}
                            </div>
                          )}

                          {/* 39.9 Locked Status for Verified Documents */}
                          {isVerified && (
                            <div style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 600, marginTop: '0.25rem' }}>
                              Verified — Upload unavailable
                            </div>
                          )}

                          {!isVerified && !isRejectedDoc && (
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                              Status: Under Review
                            </div>
                          )}
                        </div>

                        {/* 39.9 Selective Re-upload Button (ONLY rejected docs get the button) */}
                        <div>
                          {isRejectedDoc ? (
                            <label style={{
                              backgroundColor: '#dc2626',
                              color: '#ffffff',
                              padding: '0.65rem 1.25rem',
                              borderRadius: '8px',
                              fontSize: '0.875rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.45rem',
                              boxShadow: '0 4px 12px rgba(220,38,38,0.3)'
                            }}>
                              <UploadCloud size={16} /> Re-upload {doc.name}
                              <input 
                                type="file" 
                                accept=".pdf,image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  const file = e.target.files && e.target.files[0];
                                  if (file) handleReuploadFile(doc.name, file);
                                }}
                              />
                            </label>
                          ) : isVerified ? (
                            <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 800, backgroundColor: '#d1fae5', padding: '0.4rem 0.85rem', borderRadius: '20px' }}>
                              ✓ Locked & Verified
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 700, backgroundColor: '#e0f2fe', padding: '0.4rem 0.85rem', borderRadius: '20px' }}>
                              Under Review
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        ) : searched ? (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #cbd5e1', padding: '3.5rem 2rem', textAlign: 'center' }}>
            <AlertCircle size={48} color="#d97706" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>No Application Found</h2>
            <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: '500px', margin: '0.5rem auto 1.5rem auto' }}>
              We couldn't find an application matching "<strong>{searchId}</strong>". Please double check your Application ID.
            </p>
            <button 
              onClick={() => { setSearchId('APP-2026-00125'); performSearch('APP-2026-00125'); }} 
              style={{ backgroundColor: '#003366', color: 'white', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              Try Sample ID: APP-2026-00125
            </button>
          </div>
        ) : null}

      </div>

    </div>
  );
}

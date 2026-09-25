import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Edit, MoreVertical, FileText, Download, Eye, Calendar, User, MapPin } from 'lucide-react';
import ApplicationProgress from '../components/ApplicationProgress';

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { applications, updateStage } = useApp();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  const app = applications.find(a => a.id === id);

  if (!app) return <div style={{ padding: '2rem' }}>Application not found.</div>;

  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleAdminDecision = (decision) => {
    if (decision === 'reject') {
      setShowRejectModal(true);
    } else {
      if (window.confirm("Are you sure you want to approve this application?")) {
        updateStage(id, 5, { status: 'Completed', remarks: 'Approved by Admin', finalNo: `GOV-${Date.now()}` });
      }
    }
  };

  const confirmRejection = () => {
    if (!rejectReason) return alert('Please enter a reason.');
    updateStage(id, 5, { status: 'Rejected', remarks: rejectReason, completedDate: new Date().toISOString() });
    setShowRejectModal(false);
  };

  const handleSiteVisitSchedule = () => {
     updateStage(id, 4, { status: 'In Progress', visitDate: new Date().toISOString(), officerName: 'Assigned Worker' });
  };

  const handleSiteVisitComplete = () => {
     updateStage(id, 4, { status: 'Completed', remarks: 'Site verified successfully', completedDate: new Date().toISOString() });
  };

  const siteVisitData = app.stages[4];
  const isVisitCompleted = siteVisitData.status === 'Completed';

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '4rem' }}>
      {/* 1. Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '1rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Back to Applications
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Application Details</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>{app.id}</p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
              Pending <span>▼</span>
            </button>
            <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
              <Edit size={16} /> Edit
            </button>
            <button className="btn btn-outline" style={{ padding: '0.5rem' }}>
              <MoreVertical size={16} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* 2. Applicant Information */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Applicant Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Name</p>
              <p style={{ fontWeight: 500 }}>{app.applicantName}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Mobile</p>
              <p style={{ fontWeight: 500 }}>{app.mobile || 'N/A'}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Email</p>
              <p style={{ fontWeight: 500 }}>{app.email || 'N/A'}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Village</p>
              <p style={{ fontWeight: 500 }}>{app.location || 'N/A'}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Application</p>
              <p style={{ fontWeight: 500 }}>{app.id}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Applied Date</p>
              <p style={{ fontWeight: 500 }}>{formatDate(app.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* 2.5 Client Communication */}
        {currentUser === 'Admin' && (
          <div className="card" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#166534' }}>Client Communication</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#166534', fontSize: '0.875rem', marginBottom: '0.25rem' }}>WhatsApp Contact</p>
                <p style={{ fontWeight: 600, color: '#14532d' }}>{app.mobile || '9876543210'}</p>
              </div>
              <a 
                href={`https://wa.me/${(app.mobile || '9876543210').replace(/\D/g,'')}`} 
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary" 
                style={{ backgroundColor: '#22c55e', borderColor: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Open WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* 2.5 Client Communication */}
        {currentUser === 'Admin' && (
          <div className="card" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#166534' }}>Client Communication</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#166534', fontSize: '0.875rem', marginBottom: '0.25rem' }}>WhatsApp Contact</p>
                <p style={{ fontWeight: 600, color: '#14532d' }}>{app.mobile || '9876543210'}</p>
              </div>
              <a 
                href={`https://wa.me/${(app.mobile || '9876543210').replace(/\D/g,'')}`} 
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary" 
                style={{ backgroundColor: '#22c55e', borderColor: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Open WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* 3. Property Information */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Property Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Location</p>
              <p style={{ fontWeight: 500 }}>{app.address || 'N/A'}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Village</p>
              <p style={{ fontWeight: 500 }}>{app.location || 'N/A'}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Survey No</p>
              <p style={{ fontWeight: 500 }}>{app.surveyNumber || 'N/A'}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Building Type</p>
              <p style={{ fontWeight: 500 }}>{app.buildingType || 'N/A'}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Building Area</p>
              <p style={{ fontWeight: 500 }}>{app.area || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* 4. Approval Progress */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Approval Progress</h3>
          <ApplicationProgress stages={app.stages} currentStatus={app.status} />
        </div>

        {/* 5. Documents */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Documents</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {app.requiredDocs.slice(0, 4).map((doc, i) => (
               <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-md)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <FileText size={20} color="var(--primary)" />
                   <span style={{ fontWeight: 500 }}>{doc}</span>
                 </div>
                 <div style={{ display: 'flex', gap: '0.5rem' }}>
                   {currentUser === 'Admin' && (
                     <button className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>Upload</button>
                   )}
                   <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}><Eye size={14} style={{ display: 'inline', marginRight: '0.25rem'}} /> View</button>
                   <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}><Download size={14} style={{ display: 'inline', marginRight: '0.25rem'}} /> Download</button>
                 </div>
               </div>
            ))}
          </div>
        </div>

        {/* 6. Site Visit */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Site Visit</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Visit Date</p>
              <p style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={16} color="var(--primary)" /> {siteVisitData.visitDate ? formatDate(siteVisitData.visitDate) : 'Not Scheduled'}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Assigned Worker</p>
              <p style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={16} color="var(--primary)" /> {siteVisitData.officerName || 'Unassigned'}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Location</p>
              <p style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} color="var(--primary)" /> {app.location || 'N/A'}</p>
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Status</p>
              <p style={{ fontWeight: 600, color: isVisitCompleted ? 'var(--success)' : 'var(--warning)', marginTop: '0.25rem' }}>{siteVisitData.status}</p>
              {isVisitCompleted && siteVisitData.remarks && <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>"{siteVisitData.remarks}"</p>}
            </div>
            <div>
               <button 
                 className="btn btn-primary" 
                 onClick={() => navigate(`/${currentUser === 'Admin' ? 'admin' : 'worker'}/site-visit/${app.id}`)}
               >
                 Manage Site Visit →
               </button>
            </div>
          </div>
        </div>

        {/* 7. Approval Action */}
        {currentUser === 'Admin' && (
          <div className="card" style={{ backgroundColor: 'var(--surface-hover)' }}>
             <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Admin Decision</h3>
             <div className="flex gap-4">
               <button className="btn btn-primary" style={{ padding: '0.75rem 2rem', backgroundColor: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => handleAdminDecision('approve')}>
                 Approve Application
               </button>
               <button className="btn btn-outline" style={{ padding: '0.75rem 2rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleAdminDecision('reject')}>
                 Reject Application
               </button>
             </div>
          </div>
        )}

      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '400px', backgroundColor: 'var(--background)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--danger)' }}>Reject Application</h3>
            
            <div className="form-group">
              <label className="form-label">Reason for Rejection</label>
              <textarea 
                className="form-control"
                rows="4"
                placeholder="Enter reason..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button className="btn" style={{ flex: 1, backgroundColor: 'var(--danger)', color: 'white', border: 'none' }} onClick={confirmRejection}>Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

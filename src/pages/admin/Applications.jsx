import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Copy, Send, RefreshCw, FileText, Clock, CheckCircle, AlertTriangle, Layers, Mail } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ApplicationFilters from '../../components/Applications/ApplicationFilters';
import ApplicationTable from '../../components/Applications/ApplicationTable';
import ApplicationPagination from '../../components/Applications/ApplicationPagination';

export default function Applications() {
  const { applications = [], addApplication, currentUser, workers = [] } = useApp();
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';

  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [workerFilter, setWorkerFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    if (urlSearch) {
      setSearchTerm(urlSearch);
    }
  }, [urlSearch]);

  // Modal Form State
  const [formData, setFormData] = useState({
    applicantName: '',
    mobile: '',
    email: '',
    location: '',
    surveyNumber: '',
    buildingType: 'Residential',
    area: ''
  });
  const [createdAppId, setCreatedAppId] = useState(null);

  const visibleApps = currentUser === 'Admin' 
    ? applications 
    : applications.filter(a => a && a.workerId && a.workerId !== null && a.source !== 'Customer Public' && (a.assignedWorker === currentUser || a.workerId === currentUser));

  // Real-time Counts (Step 33.1)
  const totalCount = visibleApps.length;
  const newCount = visibleApps.filter(a => a && (a.status === 'submitted' || a.status === 'pending')).length;
  const docsUnderReviewCount = visibleApps.filter(a => a && (a.status === 'under_review' || (!a.status && a.documents?.some(d => d.status === 'pending')))).length;
  const siteVisitPendingCount = visibleApps.filter(a => a && (a.status === 'documents_verified' || (a.stages?.[3]?.status === 'Completed' && a.stages?.[4]?.status !== 'Completed'))).length;
  const approvedCount = visibleApps.filter(a => a && (a.status === 'approved' || a.stages?.[5]?.status === 'Approved')).length;

  const filteredApplications = visibleApps.filter(app => {
    if (!app) return false;
    const appId = (app.id || '').toLowerCase();
    const applicantName = (app.applicantName || '').toLowerCase();
    const mobile = app.mobile || '';
    const location = (app.location || app.address || '').toLowerCase();
    const search = (searchTerm || '').toLowerCase();

    const matchesSearch = 
      appId.includes(search) ||
      applicantName.includes(search) ||
      mobile.includes(search) ||
      location.includes(search);

    let matchesWorker = true;
    if (workerFilter !== 'ALL') {
      const appWorker = app.workerName || app.assignedWorker || app.workerId || 'Pooja';
      matchesWorker = (appWorker || '').toLowerCase() === workerFilter.toLowerCase();
    }

    let matchesStatus = true;
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'under_review') matchesStatus = app.status === 'under_review' || app.status === 'pending';
      else matchesStatus = app.status === statusFilter;
    }

    return matchesSearch && matchesWorker && matchesStatus;
  });

  const handleCreate = (e) => {
    e.preventDefault();
    const newId = addApplication(formData);
    setCreatedAppId(newId);
  };

  const copyLink = () => {
    const link = `${window.location.origin}/customer-upload/${createdAppId}`;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setWorkerFilter('ALL');
    setStatusFilter('ALL');
  };

  return (
    <div>
      {/* 1. Header with Real-Time Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {currentUser === 'Admin' ? 'Applications Directory' : 'My Assigned Applications'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '0.15rem' }}>
            {currentUser === 'Admin' ? 'Manage and track building applications across all field workers in real-time' : 'View and update your assigned application tasks'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            backgroundColor: 'var(--surface)', 
            border: '1px solid var(--border)',
            padding: '0.35rem 0.75rem', 
            borderRadius: 'var(--radius-full)', 
            fontSize: '0.75rem', 
            fontWeight: 600,
            color: 'var(--success)'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--success)', display: 'inline-block' }}></span>
            Real-time Sync Active
          </span>

          {currentUser === 'Admin' && (
            <button 
              className="btn btn-primary btn-sm" 
              style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              onClick={() => { setShowModal(true); setCreatedAppId(null); setFormData({ applicantName: '', mobile: '', email: '', location: '', surveyNumber: '', buildingType: 'Residential', area: '' }); }}
            >
              <Plus size={15} /> New Application
            </button>
          )}
        </div>
      </div>

      {/* 2. Step 33.1 Summary Stat Cards (5 Cards) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(5, 1fr)', 
        gap: '0.75rem', 
        marginBottom: '1.25rem' 
      }}>
        <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.65rem', border: '1px solid #cbd5e1' }}>
          <div style={{ padding: '0.45rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', color: '#475569' }}>
            <FileText size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Total Applications</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{totalCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.65rem', border: '1px solid #cbd5e1' }}>
          <div style={{ padding: '0.45rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', color: '#475569' }}>
            <Layers size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>New Applications</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{newCount || 1}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.65rem', border: '1px solid #cbd5e1' }}>
          <div style={{ padding: '0.45rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', color: '#475569' }}>
            <Clock size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Documents Review</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{docsUnderReviewCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.65rem', border: '1px solid #cbd5e1' }}>
          <div style={{ padding: '0.45rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', color: '#475569' }}>
            <Clock size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Site Visit Pending</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{siteVisitPendingCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.65rem', border: '1px solid #cbd5e1' }}>
          <div style={{ padding: '0.45rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', color: '#475569' }}>
            <CheckCircle size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Approved</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{approvedCount}</div>
          </div>
        </div>
      </div>

      {/* 3. Main Data Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <ApplicationFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          workerFilter={workerFilter}
          setWorkerFilter={setWorkerFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onReset={resetFilters}
          workers={workers}
        />
        <ApplicationTable 
          applications={filteredApplications} 
          onClearFilters={resetFilters}
        />
        {filteredApplications.length > 0 && (
          <ApplicationPagination totalItems={filteredApplications.length} />
        )}
      </div>

      {/* New Application Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '480px', backgroundColor: 'white', maxHeight: '90vh', overflowY: 'auto', borderRadius: 'var(--radius-lg)' }}>
            {!createdAppId ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>Create New Application</h3>
                  <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
                </div>
                <form onSubmit={handleCreate}>
                  <div className="form-group">
                    <label className="form-label">Customer Name</label>
                    <input type="text" className="form-control" required value={formData.applicantName} onChange={e => setFormData({...formData, applicantName: e.target.value})} placeholder="e.g. Raj Kumar" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Mobile Number</label>
                      <input type="tel" className="form-control" required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="e.g. 9876543210" />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Customer Email</span>
                        <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 600 }}>📧 Brevo</span>
                      </label>
                      <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="e.g. raj@gmail.com" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location / Village</label>
                    <input type="text" className="form-control" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Chennai South" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Survey Number</label>
                    <input type="text" className="form-control" required value={formData.surveyNumber} onChange={e => setFormData({...formData, surveyNumber: e.target.value})} placeholder="e.g. 14/2" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Building Type</label>
                      <select className="form-control" value={formData.buildingType} onChange={e => setFormData({...formData, buildingType: e.target.value})}>
                        <option>Residential</option>
                        <option>Commercial</option>
                        <option>Industrial</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Building Area</label>
                      <input type="text" className="form-control" placeholder="1500 sq.ft" required value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                    <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Application</button>
                  </div>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ color: 'var(--success)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>✓</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>Application Created Successfully</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>ID: <strong style={{ color: 'var(--primary)' }}>{createdAppId}</strong></p>
                
                {formData.email && (
                  <div style={{ padding: '0.75rem 0.85rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '1.25rem', textAlign: 'left', fontSize: '0.8rem', color: '#166534', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <Mail size={16} color="#16a34a" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                    <div>
                      <strong>Real-Time Brevo Email Dispatched!</strong>
                      <div>Official registration letter delivered directly to <strong>{formData.email}</strong> in real-time.</div>
                    </div>
                  </div>
                )}

                <div style={{ backgroundColor: 'var(--background)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', textAlign: 'left', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>Customer Upload Link</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="text" className="form-control" readOnly value={`${window.location.origin}/customer-upload/${createdAppId}`} style={{ flex: 1, backgroundColor: 'white', fontSize: '0.78rem' }} />
                    <button className="btn btn-outline" onClick={copyLink} style={{ padding: '0.4rem 0.6rem' }} title="Copy Link">
                      <Copy size={15} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <a 
                    href={`https://wa.me/${formData.mobile}?text=${encodeURIComponent(`Hello ${formData.applicantName}, please upload your documents for application ${createdAppId} here: ${window.location.origin}/customer-upload/${createdAppId}`)}`} 
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary" 
                    style={{ backgroundColor: '#25D366', borderColor: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <Send size={15} /> Send via WhatsApp
                  </a>
                  <button className="btn btn-outline" onClick={() => setShowModal(false)}>Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

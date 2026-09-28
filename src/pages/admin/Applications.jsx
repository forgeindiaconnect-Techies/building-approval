import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Copy, Send, RefreshCw, FileText, Clock, CheckCircle, AlertTriangle, Layers, Mail } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ApplicationFilters from '../../components/Applications/ApplicationFilters';
import ApplicationTable from '../../components/Applications/ApplicationTable';
import ApplicationPagination from '../../components/Applications/ApplicationPagination';

const TN_DISTRICTS = [
  'Chennai', 'Chengalpattu', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 
  'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram', 'Kanyakumari', 
  'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 
  'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 
  'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 
  'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 
  'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'
];

const initialAdminFormData = {
  applicantName: '',
  mobile: '',
  email: '',
  aadhaarNumber: '',
  district: 'Chennai',
  taluk: '',
  village: '',
  address: '',
  location: '',
  buildingType: 'Residential',
  surveyNumber: '',
  plotArea: '1200',
  area: '2100',
  numberOfFloors: 'G+2 Floors',
  buildingPurpose: 'Residential Housing'
};

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
  const [formData, setFormData] = useState(initialAdminFormData);
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
    const loc = formData.location || `${formData.village ? formData.village + ', ' : ''}${formData.district || 'Chennai'}`;
    const newId = addApplication({
      ...formData,
      fullName: formData.applicantName,
      location: loc,
      proposedBuildingArea: formData.area || '2100',
      purposeOfBuilding: formData.buildingPurpose || 'Residential Housing',
      buildingDetails: {
        plotArea: `${formData.plotArea || '1200'} sq.ft`,
        builtUpArea: `${formData.area || '2100'} sq.ft`,
        noOfFloors: formData.numberOfFloors || 'G+2 Floors',
        buildingPurpose: formData.buildingPurpose || 'Residential Housing'
      },
      workerId: currentUser === 'Admin' ? 'Admin' : currentUser,
      workerName: currentUser === 'Admin' ? 'Direct Customer (Admin)' : currentUser,
      assignedWorker: currentUser === 'Admin' ? 'Direct Customer (Admin)' : currentUser
    });
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
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--canvas-title, #0F172A)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {currentUser === 'Admin' ? 'Applications Directory' : 'My Assigned Applications'}
          </h2>
          <p style={{ color: 'var(--canvas-sub, #475569)', fontSize: '0.825rem', marginTop: '0.15rem' }}>
            {currentUser === 'Admin' ? 'Manage and track building applications across all field workers in real-time' : 'View and update your assigned application tasks'}
          </p>
        </div>

        <div className="admin-dashboard-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
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
              className="btn btn-primary btn-sm admin-header-btn" 
              style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              onClick={() => { setShowModal(true); setCreatedAppId(null); setFormData(initialAdminFormData); }}
            >
              <Plus size={15} /> New Application
            </button>
          )}
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '640px', backgroundColor: '#ffffff', maxHeight: '92vh', overflow: 'hidden', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            {!createdAppId ? (
              <>
                <div style={{ backgroundColor: 'var(--primary, #0F2A4A)', color: '#ffffff', padding: '1.1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                      Register New Application
                    </h3>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.785rem', color: 'rgba(255,255,255,0.85)' }}>
                      Enter complete applicant & building details to generate official application & upload link.
                    </p>
                  </div>
                  <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#ffffff', lineHeight: 1 }}>&times;</button>
                </div>

                <form onSubmit={handleCreate} style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Section 1: Applicant Details */}
                  <div style={{ backgroundColor: '#f8fafc', padding: '1rem 1.15rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                      <span style={{ backgroundColor: 'var(--primary, #0F2A4A)', color: '#ffffff', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>1</span>
                      <h4 style={{ margin: 0, fontSize: '0.925rem', fontWeight: 800, color: '#0f172a' }}>
                        Applicant Details
                      </h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                          Full Name *
                        </label>
                        <input 
                          type="text" 
                          placeholder="Enter applicant full name" 
                          required 
                          value={formData.applicantName} 
                          onChange={e => setFormData({...formData, applicantName: e.target.value})}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.825rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                          Mobile Number *
                        </label>
                        <input 
                          type="tel" 
                          placeholder="10-digit mobile number" 
                          required 
                          pattern="[0-9]{10}"
                          title="Please enter a valid 10-digit mobile number"
                          value={formData.mobile} 
                          onChange={e => setFormData({...formData, mobile: e.target.value})}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.825rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                          Email Address (Optional)
                        </label>
                        <input 
                          type="email" 
                          placeholder="e.g. applicant@gmail.com" 
                          value={formData.email} 
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.825rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                          ID Number * (Aadhaar / Voter ID / Passport)
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. 1234 5678 9012" 
                          required 
                          value={formData.aadhaarNumber} 
                          onChange={e => setFormData({...formData, aadhaarNumber: e.target.value})}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.825rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                          District *
                        </label>
                        <select 
                          value={formData.district} 
                          onChange={e => setFormData({...formData, district: e.target.value})}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.825rem', backgroundColor: '#ffffff' }}
                        >
                          {TN_DISTRICTS.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                          Taluk *
                        </label>
                        <input 
                          type="text" 
                          placeholder="Taluk name (e.g. Tambaram)" 
                          required 
                          value={formData.taluk} 
                          onChange={e => setFormData({...formData, taluk: e.target.value})}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.825rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                          Village *
                        </label>
                        <input 
                          type="text" 
                          placeholder="Village / Ward name" 
                          required 
                          value={formData.village} 
                          onChange={e => setFormData({...formData, village: e.target.value})}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.825rem' }}
                        />
                      </div>

                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                          Address *
                        </label>
                        <textarea 
                          rows={2}
                          placeholder="Enter complete door no, street name & location address" 
                          required 
                          value={formData.address} 
                          onChange={e => setFormData({...formData, address: e.target.value})}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.825rem', resize: 'vertical' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Building Details */}
                  <div style={{ backgroundColor: '#f8fafc', padding: '1rem 1.15rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                      <span style={{ backgroundColor: '#0284c7', color: '#ffffff', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>2</span>
                      <h4 style={{ margin: 0, fontSize: '0.925rem', fontWeight: 800, color: '#0f172a' }}>
                        Building Details
                      </h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                          Building Type *
                        </label>
                        <select 
                          value={formData.buildingType} 
                          onChange={e => setFormData({...formData, buildingType: e.target.value})}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.825rem', backgroundColor: '#ffffff' }}
                        >
                          <option value="Residential">Residential</option>
                          <option value="Commercial">Commercial</option>
                          <option value="Industrial">Industrial</option>
                          <option value="Institutional">Institutional</option>
                          <option value="Mixed Use">Mixed Use</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                          Survey Number *
                        </label>
                        <input 
                          type="text" 
                          placeholder="Survey Number / Plot No" 
                          required 
                          value={formData.surveyNumber} 
                          onChange={e => setFormData({...formData, surveyNumber: e.target.value})}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.825rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                          Plot Area (sq.ft)
                        </label>
                        <input 
                          type="text" 
                          placeholder="1200" 
                          value={formData.plotArea} 
                          onChange={e => setFormData({...formData, plotArea: e.target.value})}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.825rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                          Proposed Building Area (sq.ft) *
                        </label>
                        <input 
                          type="text" 
                          placeholder="2100" 
                          required
                          value={formData.area} 
                          onChange={e => setFormData({...formData, area: e.target.value})}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.825rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                          Number of Floors
                        </label>
                        <select 
                          value={formData.numberOfFloors} 
                          onChange={e => setFormData({...formData, numberOfFloors: e.target.value})}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.825rem', backgroundColor: '#ffffff' }}
                        >
                          <option value="Ground Floor (G)">Ground Floor (G)</option>
                          <option value="G+1 Floors">G+1 Floors</option>
                          <option value="G+2 Floors">G+2 Floors</option>
                          <option value="G+3 Floors">G+3 Floors</option>
                          <option value="G+4 Floors">G+4 Floors</option>
                          <option value="Stilt+3 Floors">Stilt+3 Floors</option>
                          <option value="Stilt+4 Floors">Stilt+4 Floors</option>
                          <option value="High-Rise (5+ Floors)">High-Rise (5+ Floors)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                          Building Purpose
                        </label>
                        <input 
                          type="text" 
                          placeholder="Residential Housing" 
                          value={formData.buildingPurpose} 
                          onChange={e => setFormData({...formData, buildingPurpose: e.target.value})}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.825rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
                    <button type="button" className="btn btn-outline" style={{ flex: 1, padding: '0.7rem' }} onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      <Plus size={16} /> Create Application
                    </button>
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

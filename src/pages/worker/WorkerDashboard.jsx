import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  Plus, 
  Search, 
  Phone, 
  MapPin, 
  FileText, 
  Copy, 
  Send, 
  CheckCircle, 
  Clock, 
  UserPlus, 
  ChevronRight,
  Sparkles,
  AlertCircle,
  Files,
  Mail
} from 'lucide-react';

export default function WorkerDashboard() {
  const { applications, addApplication, sendBrevoRegistrationEmail, currentUser, attendanceRecords, dailyReports } = useApp();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [createdAppId, setCreatedAppId] = useState(null);
  const [resendingEmailId, setResendingEmailId] = useState(null);
  const [emailStatusMsg, setEmailStatusMsg] = useState('');

  // Formatted User Name (e.g. pooja@gmail.com -> Pooja)
  const displayName = currentUser 
    ? (currentUser.includes('@') ? currentUser.split('@')[0] : currentUser).replace(/^\w/, c => c.toUpperCase())
    : 'Worker';

  // Quick Register Form State
  const [formData, setFormData] = useState({
    applicantName: '',
    mobile: '',
    email: '',
    location: '',
    surveyNumber: '',
    buildingType: 'Residential',
    area: ''
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter for worker's assigned applications (STRICT 🔐 Excludes workerId = null public customer applications)
  const myApplications = applications.filter(a => {
    if (!a.workerId || a.workerId === null || a.source === 'Customer Public') return false;
    if (a.assignedWorker && (a.assignedWorker.includes('Unassigned') || a.assignedWorker.includes('Customer Public'))) return false;
    return a.workerId === currentUser || 
           a.assignedWorker === currentUser || 
           a.workerId === workerDisplayName || 
           a.assignedWorker === workerDisplayName;
  });

  // Today's attendance status
  const todayAttendance = attendanceRecords.find(r => (r.workerId === currentUser || r.workerName === currentUser) && r.date === todayStr);
  const isPresent = !!todayAttendance;

  // Today's daily report status
  const todayReport = dailyReports.find(r => (r.workerId === currentUser || r.workerName === currentUser) && r.date === todayStr);
  const isReportSubmitted = !!todayReport;

  // Metrics
  const assignedCount = myApplications.length;
  const pendingDocsCount = myApplications.filter(a => a.status === 'pending' || a.status === 'under_review').length;
  const approvedCount = myApplications.filter(a => a.status === 'approved').length;
  const docsVerifiedTotal = myApplications.reduce((acc, app) => {
    const vCount = app.documents ? app.documents.filter(d => d.status === 'verified').length : 0;
    return acc + vCount;
  }, 0);

  // Filtered applications list
  const filteredApps = myApplications.filter(app => {
    const matchesSearch = 
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.mobile && app.mobile.includes(searchTerm));

    let matchesStatus = true;
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'under_review') matchesStatus = app.status === 'under_review' || app.status === 'pending';
      else matchesStatus = app.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.applicantName || !formData.mobile) {
      alert("Please fill in Customer Name and Mobile Number.");
      return;
    }
    const newId = addApplication({
      ...formData,
      workerId: currentUser,
      workerName: currentUser
    });
    setCreatedAppId(newId);
  };

  const handleSendEmail = async (app) => {
    const email = app.email || prompt(`Enter customer email address for ${app.applicantName}:`);
    if (!email || !email.includes('@')) {
      if (email) alert('Please provide a valid email address.');
      return;
    }
    setResendingEmailId(app.id);
    const res = await sendBrevoRegistrationEmail({ ...app, email });
    setResendingEmailId(null);
    if (res.success) {
      alert(`✅ Brevo confirmation email successfully dispatched in real-time to ${email}!`);
    } else {
      alert(`⚠️ Email delivery response: ${res.error || 'Server error'}`);
    }
  };

  const copyLink = (appId) => {
    const targetId = appId || createdAppId;
    const link = `${window.location.origin}/customer-upload/${targetId}`;
    navigator.clipboard.writeText(link);
    alert('Customer Upload Link copied to clipboard!');
  };

  const shareWhatsApp = (app) => {
    const link = `${window.location.origin}/customer-upload/${app.id}`;
    const text = `Hello ${app.applicantName}, please upload your building approval documents using this link: ${link}`;
    window.open(`https://wa.me/${app.mobile ? app.mobile.replace(/[^0-9]/g, '') : ''}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return { label: 'Approved', bg: 'var(--success-bg)', color: 'var(--success)' };
      case 'rejected':
        return { label: 'Rejected', bg: 'var(--danger-bg)', color: 'var(--danger)' };
      case 'under_review':
        return { label: 'Under Review', bg: '#e0f2fe', color: '#0369a1' };
      case 'pending':
      default:
        return { label: 'Pending Uploads', bg: 'var(--warning-bg)', color: '#b45309' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2.5rem' }}>
      
      {/* Top Header Card */}
      <div className="card" style={{ 
        backgroundColor: '#ffffff', 
        border: '1px solid #cbd5e1',
        padding: '1.25rem 1.5rem', 
        borderRadius: '12px', 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <Sparkles size={15} color="var(--primary)" />
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Field Worker Dashboard</span>
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            Welcome back, {displayName}! 👋
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '0.15rem', margin: 0 }}>
            Manage registered applications, verify uploaded documents, and submit daily reports.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setCreatedAppId(null);
              setFormData({ applicantName: '', mobile: '', email: '', location: '', surveyNumber: '', buildingType: 'Residential', area: '' });
              setShowModal(true);
            }}
            style={{ fontWeight: 600, padding: '0.5rem 1rem', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <UserPlus size={16} /> Register Customer
          </button>

          <button 
            className="btn" 
            onClick={() => navigate('/worker/attendance')}
            style={{ 
              backgroundColor: isPresent ? 'var(--success-bg)' : 'white', 
              color: isPresent ? 'var(--success)' : 'var(--text-main)', 
              border: isPresent ? '1px solid var(--success)' : '1px solid var(--border)', 
              fontWeight: 600,
              padding: '0.5rem 1rem', 
              fontSize: '0.825rem',
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.35rem' 
            }}
          >
            <CheckCircle size={16} color={isPresent ? 'var(--success)' : 'var(--text-muted)'} /> Attendance: {isPresent ? 'Present ✓' : 'Check In'}
          </button>

          <button 
            className="btn" 
            onClick={() => navigate('/worker/daily-reports')}
            style={{ 
              backgroundColor: isReportSubmitted ? 'var(--primary-light)' : 'white', 
              color: isReportSubmitted ? 'var(--primary)' : 'var(--text-main)', 
              border: isReportSubmitted ? '1px solid var(--primary)' : '1px solid var(--border)', 
              fontWeight: 600,
              padding: '0.5rem 1rem', 
              fontSize: '0.825rem',
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.35rem' 
            }}
          >
            <FileText size={16} color={isReportSubmitted ? 'var(--primary)' : 'var(--text-muted)'} /> Daily Report: {isReportSubmitted ? 'Submitted ✓' : 'Log Work'}
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - Compact sizes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
        
        {/* Card 1: Registered Applications */}
        <div 
          className="card" 
          onClick={() => navigate('/worker/applications')}
          style={{ cursor: 'pointer', padding: '1rem 1.25rem', border: '1px solid #cbd5e1', transition: 'all 0.2s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.725rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Applications</p>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0.15rem 0 0 0' }}>{assignedCount}</h3>
            <span style={{ fontSize: '0.725rem', color: '#003366', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.35rem' }}>
              View list <ChevronRight size={11} />
            </span>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={18} />
          </div>
        </div>

        {/* Card 2: Pending Reviews */}
        <div 
          className="card" 
          onClick={() => { setStatusFilter('under_review'); }}
          style={{ cursor: 'pointer', padding: '1rem 1.25rem', border: '1px solid #cbd5e1', transition: 'all 0.2s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.725rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Pending Reviews</p>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0.15rem 0 0 0' }}>{pendingDocsCount}</h3>
            <span style={{ fontSize: '0.725rem', color: '#003366', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.35rem' }}>
              Requires action <ChevronRight size={11} />
            </span>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={18} />
          </div>
        </div>

        {/* Card 3: Docs Verified */}
        <div 
          className="card" 
          onClick={() => navigate('/worker/documents')}
          style={{ cursor: 'pointer', padding: '1rem 1.25rem', border: '1px solid #cbd5e1', transition: 'all 0.2s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.725rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Verified Docs</p>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0.15rem 0 0 0' }}>{docsVerifiedTotal}</h3>
            <span style={{ fontSize: '0.725rem', color: '#003366', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.35rem' }}>
              View vault <ChevronRight size={11} />
            </span>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Files size={18} />
          </div>
        </div>

        {/* Card 4: Attendance & Daily Report */}
        <div 
          className="card" 
          onClick={() => navigate('/worker/attendance')}
          style={{ cursor: 'pointer', padding: '1rem 1.25rem', border: '1px solid #cbd5e1', transition: 'all 0.2s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.725rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Daily Tracker</p>
            <div style={{ marginTop: '0.25rem' }}>
              <div style={{ fontSize: '0.785rem', fontWeight: 700, color: isPresent ? '#047857' : 'var(--text-muted)' }}>
                {isPresent ? '🟢 Attendance Marked' : '🔴 Attendance Pending'}
              </div>
              <div style={{ fontSize: '0.785rem', fontWeight: 700, color: isReportSubmitted ? '#003366' : 'var(--text-muted)', marginTop: '0.15rem' }}>
                {isReportSubmitted ? '🔵 Report Submitted' : '⏳ Report Pending'}
              </div>
            </div>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={18} />
          </div>
        </div>

      </div>

      {/* Main Applications Table & Controls */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        
        {/* Table Header Bar */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Registered Applications</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Customer applications registered by you</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              {/* Search input */}
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Search application or customer..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '2rem', fontSize: '0.825rem', height: '34px' }}
                />
              </div>

              <button className="btn btn-primary" onClick={() => navigate('/worker/applications')} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', height: '34px', fontSize: '0.8rem' }}>
                <Plus size={15} /> View All
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: `All (${myApplications.length})` },
              { id: 'pending', label: `Pending Docs (${myApplications.filter(a => a.status === 'pending').length})` },
              { id: 'under_review', label: `Under Review (${myApplications.filter(a => a.status === 'under_review').length})` },
              { id: 'approved', label: `Approved (${approvedCount})` }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '14px',
                  fontSize: '0.785rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: statusFilter === tab.id ? 'var(--primary)' : 'var(--background)',
                  color: statusFilter === tab.id ? 'white' : 'var(--text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Applications Table */}
        <div className="table-wrapper">
          <table className="table" style={{ fontSize: '0.825rem' }}>
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Customer Name</th>
                <th>Location</th>
                <th>Docs Verified</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem 1.25rem' }}>
                    <AlertCircle size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.35rem' }} />
                    <p style={{ fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>No Applications Found</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {searchTerm ? 'No customer matches your search.' : 'Click "Register Customer" to create an application.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredApps.slice(0, 6).map(app => {
                  const badge = getStatusBadge(app.status);
                  const docsList = app.requiredDocs || [];
                  const verifiedCount = docsList.filter(d => {
                    const doc = app.documents?.find(item => item.name === d);
                    return doc && doc.status === 'verified';
                  }).length;
                  const totalDocs = docsList.length || 10;
                  const progressPct = Math.round((verifiedCount / totalDocs) * 100);

                  return (
                    <tr key={app.id}>
                      <td style={{ verticalAlign: 'middle' }}>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{app.id}</span>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Today'}
                        </div>
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{app.applicantName}</div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Phone size={11} /> {app.mobile || 'N/A'}
                        </div>
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem', color: 'var(--text-main)' }}>
                          <MapPin size={12} color="var(--text-muted)" /> {app.location || 'N/A'}
                        </div>
                      </td>
                      <td style={{ verticalAlign: 'middle', minWidth: '130px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                          <span>{verifiedCount} / {totalDocs} Docs</span>
                          <span style={{ color: 'var(--primary)' }}>{progressPct}%</span>
                        </div>
                        <div style={{ height: '5px', width: '100%', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${progressPct}%`, backgroundColor: progressPct === 100 ? 'var(--success)' : 'var(--primary)', transition: 'width 0.3s ease' }}></div>
                        </div>
                      </td>
                      <td style={{ verticalAlign: 'middle' }}>
                        <span style={{ 
                          padding: '0.25rem 0.65rem', 
                          borderRadius: '1rem', 
                          fontSize: '0.725rem', 
                          fontWeight: 700,
                          backgroundColor: badge.bg,
                          color: badge.color,
                          display: 'inline-block'
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ verticalAlign: 'middle', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-outline"
                            title="Copy Upload Link"
                            onClick={() => copyLink(app.id)}
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.725rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <Copy size={12} /> Link
                          </button>
                          <button 
                            className="btn"
                            title="Send WhatsApp Link"
                            onClick={() => shareWhatsApp(app)}
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.725rem', backgroundColor: '#25D366', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <Send size={12} /> WhatsApp
                          </button>
                          <button 
                            className="btn btn-outline"
                            title={app.email ? `Send/Resend Real-Time Brevo Email to ${app.email}` : 'Enter email and send via Brevo'}
                            onClick={() => handleSendEmail(app)}
                            disabled={resendingEmailId === app.id}
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.725rem', display: 'flex', alignItems: 'center', gap: '0.25rem', borderColor: '#3b82f6', color: '#1d4ed8', backgroundColor: '#eff6ff' }}
                          >
                            <Mail size={12} /> {resendingEmailId === app.id ? 'Sending...' : 'Email'}
                          </button>
                          <button 
                            className="btn btn-primary" 
                            onClick={() => navigate('/worker/documents')}
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.725rem' }}
                          >
                            Verify
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Registration Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px' }}>
            
            {!createdAppId ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Register New Customer</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Auto-dispatches real-time email via Brevo</p>
                  </div>
                  <button className="btn btn-outline" style={{ padding: '0.2rem 0.4rem', border: 'none' }} onClick={() => setShowModal(false)}>✕</button>
                </div>

                <form onSubmit={handleCreate}>
                  <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Customer Name *</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="e.g. Rajesh Kumar" 
                      required
                      value={formData.applicantName}
                      onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Mobile Number *</label>
                      <input 
                        type="tel" 
                        className="form-control"
                        placeholder="9876543210" 
                        required
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Location / Town *</label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="e.g. Krishnagiri" 
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  {/* Customer Email Field with Brevo Tag */}
                  <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Customer Email (Real-Time Notification)</span>
                      <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Mail size={11} /> Brevo Connected
                      </span>
                    </label>
                    <input 
                      type="email" 
                      className="form-control"
                      placeholder="e.g. customer@gmail.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Survey No. (Optional)</label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="e.g. 142/3A" 
                        value={formData.surveyNumber}
                        onChange={(e) => setFormData({ ...formData, surveyNumber: e.target.value })}
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Building Type</label>
                      <select 
                        className="form-control"
                        value={formData.buildingType}
                        onChange={(e) => setFormData({ ...formData, buildingType: e.target.value })}
                        style={{ fontSize: '0.85rem' }}
                      >
                        <option value="Residential">Residential</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Industrial">Industrial</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="button" className="btn btn-outline" style={{ flex: 1, fontSize: '0.825rem' }} onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, fontWeight: 700, fontSize: '0.825rem' }}>
                      Register & Generate Link
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '0.85rem 0' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.85rem' }}>
                  <CheckCircle size={28} />
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>Customer Registered!</h4>
                <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.85rem' }}>Application ID: {createdAppId}</p>

                {formData.email ? (
                  <div style={{ padding: '0.75rem 0.85rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '1rem', textAlign: 'left', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <Mail size={16} color="#16a34a" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                    <div style={{ fontSize: '0.75rem', color: '#166534', lineHeight: 1.4 }}>
                      <strong>📧 Real-Time Email Dispatched!</strong>
                      <div>Official registration letter and document upload link delivered to <strong>{formData.email}</strong> via Brevo.</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', marginBottom: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#92400e' }}>
                    💡 Tip: Next time enter customer email to automatically send real-time confirmation via Brevo!
                  </div>
                )}

                <div style={{ padding: '0.85rem', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.25rem', textAlign: 'left' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Customer Upload Link:</p>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', wordBreak: 'break-all', margin: 0 }}>
                    {`${window.location.origin}/customer-upload/${createdAppId}`}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  <button className="btn btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.8rem' }} onClick={() => copyLink(createdAppId)}>
                    <Copy size={14} /> Copy Link
                  </button>
                  <button 
                    className="btn" 
                    style={{ flex: 1, backgroundColor: '#25D366', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.8rem' }} 
                    onClick={() => shareWhatsApp({ id: createdAppId, applicantName: formData.applicantName, mobile: formData.mobile })}
                  >
                    <Send size={14} /> Send WhatsApp
                  </button>
                </div>

                <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem' }} onClick={() => setShowModal(false)}>
                  Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

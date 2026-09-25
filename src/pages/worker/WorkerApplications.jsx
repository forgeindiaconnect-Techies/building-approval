import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  Plus, Search, Phone, MapPin, Calendar, FileText, ChevronRight, Copy, Send, 
  CheckCircle, AlertCircle, Clock, ShieldCheck, Building2, RefreshCw, Mail
} from 'lucide-react';

export default function WorkerApplications() {
  const { applications, addApplication, sendBrevoRegistrationEmail, currentUser } = useApp();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [sendingEmailId, setSendingEmailId] = useState(null);

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

  // Format current worker name nicely
  const workerDisplayName = currentUser === 'Pooja' || currentUser === 'pooja@gmail.com' ? 'Pooja' : currentUser;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  // Filter applications belonging strictly to logged-in Worker (Step 19.4 & Step 42.8 Worker Privacy 🔐)
  const workerApps = applications.filter(app => {
    // Customer public direct applications (workerId === null) MUST NOT be visible to workers
    if (!app.workerId || app.workerId === null || app.source === 'Customer Public') return false;
    if (app.assignedWorker && (app.assignedWorker.includes('Unassigned') || app.assignedWorker.includes('Customer Public'))) return false;

    return app.workerId === currentUser || 
           app.assignedWorker === currentUser || 
           app.workerId === workerDisplayName || 
           app.assignedWorker === workerDisplayName;
  });

  // Calculate summary counts
  const pendingCount = workerApps.filter(a => a.status === 'pending' || !a.status).length;
  const underReviewCount = workerApps.filter(a => a.status === 'under_review').length;
  const approvedCount = workerApps.filter(a => a.status === 'approved').length;
  const rejectedCount = workerApps.filter(a => a.status === 'rejected').length;

  const filteredApps = workerApps.filter(app => {
    const matchesSearch = 
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.mobile && app.mobile.includes(searchTerm)) ||
      (app.location && app.location.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesStatus = true;
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'under_review') matchesStatus = app.status === 'under_review';
      else if (statusFilter === 'pending') matchesStatus = app.status === 'pending' || !app.status;
      else matchesStatus = app.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  const handleCreate = (e) => {
    e.preventDefault();
    const newId = addApplication({
      ...formData,
      workerId: currentUser,
      workerName: workerDisplayName,
      assignedWorker: workerDisplayName
    });
    setCreatedAppId(newId);
  };

  const handleSendEmail = async (app) => {
    const email = app.email || prompt(`Enter customer email address for ${app.applicantName}:`);
    if (!email || !email.includes('@')) {
      if (email) alert('Please enter a valid email address.');
      return;
    }
    setSendingEmailId(app.id);
    const res = await sendBrevoRegistrationEmail({ ...app, email });
    setSendingEmailId(null);
    if (res.success) {
      alert(`✅ Brevo confirmation email successfully dispatched in real-time to ${email}!`);
    } else {
      alert(`⚠️ Email delivery notice: ${res.error || 'Server error'}`);
    }
  };

  const copyLink = (appId) => {
    const link = `${window.location.origin}/customer-upload/${appId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(appId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return { label: 'Approved', bg: '#e7f5e8', color: '#138808', icon: CheckCircle, border: '#138808' };
      case 'rejected':
        return { label: 'Rejected', bg: '#fee2e2', color: '#dc2626', icon: AlertCircle, border: '#dc2626' };
      case 'under_review':
        return { label: 'Under Review', bg: '#e6f0fa', color: '#003366', icon: Clock, border: '#003366' };
      case 'pending':
      default:
        return { label: 'Pending Uploads', bg: '#fff5e6', color: '#d97706', icon: Clock, border: '#FF9933' };
    }
  };

  return (
    <div style={{ paddingBottom: '2.5rem' }}>
      
      {/* Header Banner - Compact Typography */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        color: 'var(--text-main)',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.25rem',
        boxShadow: '0 6px 18px rgba(0, 51, 102, 0.12)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '0.15rem 0.55rem', borderRadius: '14px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px' }}>
              FIELD OFFICER PORTAL
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>•</span>
            <span style={{ color: '#64748b', fontSize: '0.78rem' }}>{workerDisplayName}</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0f172a', letterSpacing: '-0.01em' }}>
            My Applications Directory
          </h2>
          <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.825rem' }}>
            Manage registered building applications and share customer upload links.
          </p>
        </div>

        <button 
          onClick={() => { 
            setCreatedAppId(null); 
            setFormData({ applicantName: '', mobile: '', email: '', location: '', surveyNumber: '', buildingType: 'Residential', area: '' }); 
            setShowModal(true); 
          }}
          style={{
            backgroundColor: '#003366',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.65rem 1.1rem',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s ease'
          }}
        >
          <Plus size={16} /> Register New Customer
        </button>
      </div>

      {/* KPI Stats Bar - Compact font sizes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
          border: '1px solid #cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Registered</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem' }}>{workerApps.length}</div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
            <FileText size={18} />
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
          border: '1px solid #cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Uploads</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem' }}>{pendingCount}</div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
            <Clock size={18} />
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
          border: '1px solid #cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Under Review</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem' }}>{underReviewCount}</div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
            <ShieldCheck size={18} />
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
          border: '1px solid #cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Approved</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem' }}>{approvedCount}</div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
            <CheckCircle size={18} />
          </div>
        </div>
      </div>

      {/* Toolbar: Search and Filter Pills */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '0.85rem 1.25rem',
        marginBottom: '1.25rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Search Field */}
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '380px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input 
            type="text" 
            placeholder="Search ID, Name, Mobile or Location..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              paddingLeft: '2.5rem',
              paddingRight: '0.85rem',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.825rem',
              color: '#1e293b',
              outline: 'none'
            }}
          />
        </div>

        {/* Status Filter Chips */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `All (${workerApps.length})` },
            { id: 'pending', label: `Pending (${pendingCount})` },
            { id: 'under_review', label: `Review (${underReviewCount})` },
            { id: 'approved', label: `Approved (${approvedCount})` },
            { id: 'rejected', label: `Rejected (${rejectedCount})` }
          ].map(chip => {
            const active = statusFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setStatusFilter(chip.id)}
                style={{
                  backgroundColor: active ? '#003366' : '#f1f5f9',
                  color: active ? '#ffffff' : '#475569',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.785rem',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid / Cards */}
      {isLoading ? (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <RefreshCw size={28} className="animate-spin" style={{ color: '#003366', margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>Loading Applications...</h4>
        </div>
      ) : filteredApps.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <FileText size={40} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}>
            {workerApps.length === 0 ? "No applications registered yet." : 'No Applications Found'}
          </h4>
          <p style={{ color: '#64748b', fontSize: '0.825rem', maxWidth: '400px', margin: '0 auto 1.25rem' }}>
            {searchTerm || statusFilter !== 'ALL' 
              ? 'No applications match your current filters.' 
              : 'Click below to register your first customer application.'}
          </p>
          <button 
            onClick={() => setShowModal(true)}
            style={{
              backgroundColor: '#003366',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem 1.2rem',
              fontWeight: 600,
              fontSize: '0.825rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Plus size={16} /> Register Customer Now
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
          gap: '1.25rem'
        }}>
          {filteredApps.map(app => {
            const badge = getStatusBadge(app.status);
            const StatusIcon = badge.icon;
            const createdDateStr = new Date(app.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const isJustCopied = copiedId === app.id;

            return (
              <div 
                key={app.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  borderLeft: `5px solid ${badge.border}`,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  {/* Top Row: App ID & Status Pill */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <span style={{
                      backgroundColor: '#e6f0fa',
                      color: '#003366',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px'
                    }}>
                      {app.id}
                    </span>

                    <span style={{
                      backgroundColor: badge.bg,
                      color: badge.color,
                      fontWeight: 700,
                      fontSize: '0.725rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '16px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <StatusIcon size={12} />
                      {badge.label}
                    </span>
                  </div>

                  {/* Customer Card Info */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: '#003366',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      lineHeight: 1,
                      textAlign: 'center',
                      flexShrink: 0
                    }}>
                      {app.applicantName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        {app.applicantName}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.785rem', marginTop: '0.15rem' }}>
                        <Building2 size={12} /> {app.buildingType || 'Residential'} • {app.area || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    fontSize: '0.785rem',
                    color: '#334155',
                    marginBottom: '1rem',
                    border: '1px solid #f1f5f9'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Phone size={13} color="#64748b" /> 
                      <strong>Mobile:</strong> {app.mobile || 'N/A'}
                    </div>
                    {app.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={13} color="#64748b" />
                        <strong>Location:</strong> {app.location} {app.surveyNumber ? `(Survey: ${app.surveyNumber})` : ''}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={13} color="#64748b" />
                      <strong>Registered:</strong> {createdDateStr}
                    </div>
                  </div>

                  {/* Action Bar: WhatsApp & Copy Link */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyLink(app.id);
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: isJustCopied ? '#e7f5e8' : '#ffffff',
                        color: isJustCopied ? '#138808' : '#003366',
                        border: isJustCopied ? '1px solid #138808' : '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '0.4rem 0.6rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <Copy size={13} /> {isJustCopied ? 'Copied!' : 'Copy Link'}
                    </button>

                    <a 
                      href={`https://wa.me/${app.mobile}?text=${encodeURIComponent(`Hello ${app.applicantName}, please upload your building approval documents for application ${app.id} here: ${window.location.origin}/customer-upload/${app.id}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        flex: 1,
                        backgroundColor: '#25D366',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.4rem 0.6rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <Send size={13} /> WhatsApp
                    </a>

                    <button 
                      onClick={() => handleSendEmail(app)}
                      disabled={sendingEmailId === app.id}
                      title={app.email ? `Send real-time Brevo email to ${app.email}` : 'Enter email and dispatch via Brevo'}
                      style={{
                        padding: '0.4rem 0.6rem',
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        border: '1px solid #bfdbfe',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <Mail size={13} /> {sendingEmailId === app.id ? '...' : 'Email'}
                    </button>
                  </div>
                </div>

                {/* Footer Action */}
                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                  <button 
                    onClick={() => navigate(`/worker/application/${app.id}`)}
                    style={{
                      width: '100%',
                      backgroundColor: '#e6f0fa',
                      color: '#003366',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.55rem 0.85rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    View Application Details <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Customer Registration Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {!createdAppId ? (
              <>
                <div style={{
                  backgroundColor: '#003366',
                  color: '#ffffff',
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                      Register New Customer
                    </h3>
                    <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.785rem', color: 'rgba(255,255,255,0.8)' }}>
                      Enter customer details to generate upload link.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowModal(false)} 
                    style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleCreate} style={{ padding: '1.25rem 1.5rem', overflowY: 'auto' }}>
                  <div style={{ marginBottom: '0.85rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                      Customer / Applicant Name *
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Ramesh Kumar" 
                      required 
                      value={formData.applicantName} 
                      onChange={e => setFormData({...formData, applicantName: e.target.value})}
                      style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                        Mobile Number *
                      </label>
                      <input 
                        type="tel" 
                        placeholder="e.g. 9876543210" 
                        required 
                        value={formData.mobile} 
                        onChange={e => setFormData({...formData, mobile: e.target.value})}
                        style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                        Email (Optional)
                      </label>
                      <input 
                        type="email" 
                        placeholder="e.g. ramesh@gmail.com" 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                        Location / Town *
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. Chennai South" 
                        required 
                        value={formData.location} 
                        onChange={e => setFormData({...formData, location: e.target.value})}
                        style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                        Survey Number *
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. 142/2B" 
                        required 
                        value={formData.surveyNumber} 
                        onChange={e => setFormData({...formData, surveyNumber: e.target.value})}
                        style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                        Building Type
                      </label>
                      <select 
                        value={formData.buildingType} 
                        onChange={e => setFormData({...formData, buildingType: e.target.value})}
                        style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                      >
                        <option>Residential</option>
                        <option>Commercial</option>
                        <option>Industrial</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                        Building Area
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. 1800 sq.ft" 
                        required 
                        value={formData.area} 
                        onChange={e => setFormData({...formData, area: e.target.value})}
                        style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.85rem', borderTop: '1px solid #e2e8f0' }}>
                    <button 
                      type="button" 
                      onClick={() => setShowModal(false)}
                      style={{ flex: 1, padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#ffffff', fontWeight: 600, color: '#475569', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      style={{ flex: 1, padding: '0.65rem', border: 'none', borderRadius: '8px', backgroundColor: '#003366', fontWeight: 700, color: '#ffffff', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Register & Create Link
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div style={{ padding: '1.5rem 1.5rem', textAlign: 'center' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#e7f5e8', color: '#138808', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.85rem' }}>
                  <CheckCircle size={28} />
                </div>

                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                  Customer Registered!
                </h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Application ID: <strong style={{ color: '#003366', fontSize: '0.98rem' }}>{createdAppId}</strong>
                </p>

                {formData.email ? (
                  <div style={{ backgroundColor: '#f0fdf4', padding: '0.75rem 0.85rem', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '1rem', textAlign: 'left', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <Mail size={16} color="#16a34a" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                    <div style={{ fontSize: '0.75rem', color: '#166534', lineHeight: 1.4 }}>
                      <strong>📧 Real-Time Email Dispatched via Brevo!</strong>
                      <div>Official registration letter and document upload link delivered to <strong>{formData.email}</strong>.</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ backgroundColor: '#fffbeb', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #fde68a', marginBottom: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#92400e' }}>
                    💡 Tip: Provide customer email on registration to dispatch automatic instant Brevo confirmation!
                  </div>
                )}

                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Customer Upload Link:
                  </label>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <input 
                      type="text" 
                      readOnly 
                      value={`${window.location.origin}/customer-upload/${createdAppId}`} 
                      style={{ flex: 1, padding: '0.55rem 0.75rem', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem', color: '#1e293b' }}
                    />
                    <button 
                      onClick={() => copyLink(createdAppId)}
                      style={{ padding: '0.55rem 0.85rem', backgroundColor: '#003366', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Copy size={14} /> {copiedId === createdAppId ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <a 
                    href={`https://wa.me/${formData.mobile}?text=${encodeURIComponent(`Hello ${formData.applicantName}, please upload your building approval documents for application ${createdAppId} here: ${window.location.origin}/customer-upload/${createdAppId}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      backgroundColor: '#25D366',
                      color: '#ffffff',
                      padding: '0.7rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Send size={15} /> Send Link via WhatsApp
                  </a>

                  <button 
                    onClick={() => setShowModal(false)}
                    style={{ padding: '0.6rem', backgroundColor: 'transparent', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, color: '#475569', cursor: 'pointer', fontSize: '0.825rem' }}
                  >
                    Close & Return
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

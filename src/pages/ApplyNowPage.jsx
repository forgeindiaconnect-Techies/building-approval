import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  UploadCloud, 
  CheckCircle2, 
  FileText, 
  ArrowLeft, 
  Copy, 
  Check, 
  Phone, 
  ShieldCheck, 
  AlertCircle,
  ArrowRight,
  AlertTriangle,
  FileCheck,
  X,
  HelpCircle,
  Mail
} from 'lucide-react';

export default function ApplyNowPage() {
  const navigate = useNavigate();
  const { addCustomerApplication, pushLiveToast, sendBrevoRegistrationEmail } = useApp();

  const [submittedAppId, setSubmittedAppId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [emailDelivery, setEmailDelivery] = useState({
    sent: false,
    loading: false,
    error: null,
    message: ''
  });

  // 29.2 & 29.3 Applicant & Building Details State
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    aadhaarNumber: '',
    address: '',
    district: 'Chennai',
    taluk: '',
    village: '',
    buildingType: 'Residential',
    surveyNumber: '',
    plotArea: '1200',
    proposedBuildingArea: '2100',
    numberOfFloors: 'G+2 Floors',
    purposeOfBuilding: 'Residential'
  });

  // 29.4 Required Documents List
  const requiredDocList = [
    { id: 'saleDeed', name: 'Sale Deed', label: 'Property ownership document', mandatory: true },
    { id: 'patta', name: 'Patta', label: 'Land title deed extract', mandatory: true },
    { id: 'ec', name: 'Encumbrance Certificate', label: '13-year EC certificate', mandatory: true },
    { id: 'buildingPlan', name: 'Building Plan', label: 'Approved CAD architectural plan', mandatory: true },
    { id: 'taxReceipt', name: 'Property Tax Receipt', label: 'Recent municipal tax receipt', mandatory: false },
    { id: 'idProof', name: 'ID Proof', label: 'Aadhaar / Government Photo ID', mandatory: true }
  ];

  const [uploadedDocs, setUploadedDocs] = useState({});

  // Calculate Mandatory Upload Progress (29.5)
  const mandatoryDocsList = requiredDocList.filter(d => d.mandatory);
  const uploadedMandatoryCount = mandatoryDocsList.filter(d => !!uploadedDocs[d.name]).length;
  const totalMandatoryCount = mandatoryDocsList.length;
  const isAllMandatoryUploaded = uploadedMandatoryCount === totalMandatoryCount;
  const remainingCount = totalMandatoryCount - uploadedMandatoryCount;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileUpload = (docId, docName, file) => {
    if (!file) return;
    
    // File size validation (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert(`File size exceeds 10MB limit. Please upload a smaller file.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setUploadedDocs(prev => ({
        ...prev,
        [docName]: {
          file: uploadEvent.target.result,
          fileName: file.name
        }
      }));
      if (errors.documents) {
        setErrors(prev => ({ ...prev, documents: null }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Open Confirmation Modal (Step 30)
  const handleInitiateSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile Number is required';
    if (!formData.aadhaarNumber.trim()) newErrors.aadhaarNumber = 'ID Number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.district.trim()) newErrors.district = 'District is required';
    if (!formData.taluk.trim()) newErrors.taluk = 'Taluk is required';
    if (!formData.village.trim()) newErrors.village = 'Village is required';
    if (!formData.surveyNumber.trim()) newErrors.surveyNumber = 'Survey Number is required';

    if (!isAllMandatoryUploaded) {
      newErrors.documents = `Please upload all ${remainingCount} remaining mandatory document(s) before submitting.`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    // Show Confirmation Modal
    setShowConfirmModal(true);
  };

  // Final Confirmation & Submission (Step 30, 31, 32)
  const handleFinalConfirm = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);

    // Create document payload
    const docPayload = {};
    Object.keys(uploadedDocs).forEach(key => {
      docPayload[key] = uploadedDocs[key].file;
    });

    // Step 31: Create Customer Public Application with workerId = null
    const newId = addCustomerApplication(formData, docPayload);
    
    // Step 32: Admin Notification
    if (pushLiveToast) {
      pushLiveToast('New Application Submitted', `Application ${newId} submitted by ${formData.fullName}`, 'application');
    }

    setSubmittedAppId(newId);
    setIsSubmitting(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Step 33: Trigger Brevo Email in real-time and track actual response
    if (formData.email && formData.email.includes('@')) {
      setEmailDelivery({ sent: false, loading: true, error: null, message: 'Dispatching confirmation email via Brevo...' });
      try {
        const emailRes = await sendBrevoRegistrationEmail({
          id: newId,
          applicantName: formData.fullName,
          email: formData.email,
          location: `${formData.village || ''}, ${formData.district}`,
          buildingType: formData.buildingType,
          workerName: 'Online Portal'
        });

        if (emailRes.success) {
          setEmailDelivery({
            sent: true,
            loading: false,
            error: null,
            message: `Official confirmation email delivered to ${formData.email}`
          });
        } else {
          setEmailDelivery({
            sent: false,
            loading: false,
            error: emailRes.error || 'Failed to dispatch email via Brevo',
            message: ''
          });
        }
      } catch (err) {
        setEmailDelivery({
          sent: false,
          loading: false,
          error: err.message,
          message: ''
        });
      }
    }
  };

  const handleResendEmail = async () => {
    if (!formData.email || !submittedAppId) return;
    setEmailDelivery({ sent: false, loading: true, error: null, message: 'Retrying Brevo email delivery...' });
    try {
      const emailRes = await sendBrevoRegistrationEmail({
        id: submittedAppId,
        applicantName: formData.fullName,
        email: formData.email,
        location: `${formData.village || ''}, ${formData.district}`,
        buildingType: formData.buildingType,
        workerName: 'Online Portal'
      });

      if (emailRes.success) {
        setEmailDelivery({
          sent: true,
          loading: false,
          error: null,
          message: `Official confirmation email delivered to ${formData.email}`
        });
      } else {
        setEmailDelivery({
          sent: false,
          loading: false,
          error: emailRes.error || 'Failed to dispatch email',
          message: ''
        });
      }
    } catch (err) {
      setEmailDelivery({
        sent: false,
        loading: false,
        error: err.message,
        message: ''
      });
    }
  };

  const copyAppId = () => {
    if (submittedAppId) {
      navigator.clipboard.writeText(submittedAppId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#f4f6f9', color: '#1e293b', fontFamily: "'Inter', system-ui, sans-serif" }}>
      
      {/* Top Government Navigation Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 1000, width: '100%', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #cbd5e1', padding: '0.85rem 2.5rem' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
              <div style={{ backgroundColor: '#003366', color: 'white', padding: '0.65rem 0.75rem', borderRadius: '12px' }}>
                <Building2 size={26} />
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#003366' }}>
                  ApprovalTrack <span style={{ fontSize: '0.75rem', backgroundColor: '#e6f0fa', color: '#003366', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>PUBLIC APPLICATION</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                  Online Building Permit Clearance Portal
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                onClick={async () => {
                  const testEmail = prompt('Enter recipient email address to test real-time Brevo delivery:', formData.email || 'pooja.antigraviity@gmail.com');
                  if (!testEmail || !testEmail.includes('@')) {
                    if (testEmail) alert('Please enter a valid email address.');
                    return;
                  }
                  try {
                    const res = await fetch('http://localhost:5000/api/brevo/test-email', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        toEmail: testEmail,
                        toName: formData.fullName || 'Citizen User',
                        subject: '⚡ Real-Time Brevo Email Test - Building Approval System',
                        message: 'Congratulations! Your Brevo integration in the Building Approval System is working and delivering real-time emails successfully.'
                      })
                    });
                    const data = await res.json();
                    if (res.ok && data.success) {
                      alert(`✅ SUCCESS: Brevo email successfully dispatched to ${testEmail}!\n\nCheck your inbox now!`);
                    } else {
                      alert(`❌ Brevo delivery error:\n${data.error || JSON.stringify(data)}`);
                    }
                  } catch (err) {
                    alert(`❌ Connection error: Could not reach backend at http://localhost:5000.\n${err.message}`);
                  }
                }}
                style={{
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                📧 Test Brevo Mailer
              </button>

              <button 
                onClick={() => navigate('/')} 
                style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#003366', padding: '0.55rem 1.15rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ArrowLeft size={16} /> Back to Home
              </button>
              <button 
                onClick={() => navigate('/track')} 
                style={{ backgroundColor: '#003366', color: 'white', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Track Application
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Main Page Wrapper */}
      <div style={{ maxWidth: '1050px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
        
        {/* Step 26 — Success Page View */}
        {submittedAppId ? (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', boxShadow: '0 15px 35px rgba(0,51,102,0.12)', border: '1px solid #cbd5e1', borderTop: '6px solid #10b981', padding: '3.5rem 2.5rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 84, height: 84, backgroundColor: '#d1fae5', color: '#059669', borderRadius: '50%', marginBottom: '1.5rem' }}>
              <CheckCircle2 size={54} />
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#065f46', marginBottom: '0.5rem' }}>
              Application Submitted Successfully
            </h1>
            <p style={{ fontSize: '1.05rem', color: '#475569', maxWidth: '600px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
              Your application has been received.
            </p>

            {/* Application ID Box */}
            <div style={{ backgroundColor: '#f0fdf4', border: '2px dashed #10b981', borderRadius: '16px', padding: '1.75rem 2rem', maxWidth: '480px', margin: '0 auto 2rem auto' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Application ID
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#065f46', letterSpacing: '0.05em', margin: '0.25rem 0' }}>
                {submittedAppId}
              </div>
              <button 
                onClick={copyAppId}
                style={{ marginTop: '0.85rem', backgroundColor: '#059669', color: 'white', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied to Clipboard!' : 'Copy Application ID'}
              </button>
            </div>

            {/* Brevo Email Delivery Feedback */}
            {formData.email && (
              <div style={{
                backgroundColor: emailDelivery.error ? '#fef2f2' : emailDelivery.sent ? '#f0fdf4' : '#eff6ff',
                border: `1px solid ${emailDelivery.error ? '#fecaca' : emailDelivery.sent ? '#bbf7d0' : '#bfdbfe'}`,
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                maxWidth: '580px',
                margin: '0 auto 1.5rem auto',
                textAlign: 'left',
                display: 'flex',
                gap: '0.85rem',
                alignItems: 'flex-start'
              }}>
                <Mail size={22} color={emailDelivery.error ? '#dc2626' : emailDelivery.sent ? '#16a34a' : '#2563eb'} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    color: emailDelivery.error ? '#991b1b' : emailDelivery.sent ? '#166534' : '#1e40af',
                    marginBottom: '0.2rem'
                  }}>
                    {emailDelivery.loading ? '⏳ Dispatching Real-Time Email via Brevo...' :
                     emailDelivery.sent ? '📧 Real-Time Confirmation Email Dispatched!' :
                     emailDelivery.error ? '⚠️ Brevo Email Delivery Notification' : '📧 Real-Time Email Confirmation'}
                  </div>
                  <div style={{
                    fontSize: '0.825rem',
                    color: emailDelivery.error ? '#b91c1c' : emailDelivery.sent ? '#15803d' : '#1e3a8a',
                    lineHeight: 1.5
                  }}>
                    {emailDelivery.loading && `Connecting to Brevo mailer to deliver official acknowledgement to ${formData.email}...`}
                    {emailDelivery.sent && `An official acknowledgement letter, application summary, and direct tracking link have been delivered to ${formData.email} via Brevo.`}
                    {emailDelivery.error && (
                      <div>
                        <div>Email service status: <strong>{emailDelivery.error}</strong></div>
                        <div style={{ marginTop: '0.35rem', fontSize: '0.78rem', color: '#7f1d1d' }}>
                          Note: Ensure your Brevo sender email is verified or configured with an active Brevo API key in <code>.env</code>.
                        </div>
                      </div>
                    )}
                  </div>
                  {emailDelivery.error && (
                    <button
                      onClick={handleResendEmail}
                      disabled={emailDelivery.loading}
                      style={{
                        marginTop: '0.6rem',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        padding: '0.35rem 0.85rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {emailDelivery.loading ? 'Retrying...' : '🔄 Retry Sending Email'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Notice */}
            <div style={{ backgroundColor: '#fffbebfb', border: '1px solid #fde68a', borderLeft: '4px solid #f59e0b', borderRadius: '10px', padding: '1.15rem 1.35rem', maxWidth: '580px', margin: '0 auto 2.5rem auto', textAlign: 'left', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <AlertCircle size={24} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.9rem', color: '#92400e', lineHeight: 1.5, fontWeight: 600 }}>
                Please save this Application ID to track your application status.
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem' }}>
              <button 
                onClick={() => navigate(`/track-status?id=${submittedAppId}`)}
                style={{ backgroundColor: '#003366', color: 'white', border: 'none', padding: '0.85rem 2rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(0,51,102,0.3)' }}
              >
                Track Application <ArrowRight size={18} />
              </button>
              <button 
                onClick={() => navigate('/')}
                style={{ backgroundColor: '#ffffff', border: '2px solid #003366', color: '#003366', padding: '0.85rem 1.75rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer' }}
              >
                Back to Home
              </button>
            </div>
          </div>

        ) : (

          <div>
            
            {/* 29.1 Page Header Banner & 4-Step Progress Bar */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #cbd5e1', padding: '2rem 2.5rem', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#003366', margin: '0 0 0.4rem 0' }}>
                Building Approval Application
              </h1>
              <p style={{ fontSize: '0.95rem', color: '#64748b', margin: '0 0 1.75rem 0', fontWeight: 500 }}>
                Submit your building approval application by providing the required information and documents.
              </p>

              {/* 29.1 4-Step Progress Indicator */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#003366', fontWeight: 800, fontSize: '0.875rem' }}>
                  <span style={{ backgroundColor: '#003366', color: 'white', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>1</span>
                  <span>Applicant Details</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#003366', fontWeight: 800, fontSize: '0.875rem' }}>
                  <span style={{ backgroundColor: '#003366', color: 'white', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>2</span>
                  <span>Building Details</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: isAllMandatoryUploaded ? '#10b981' : '#003366', fontWeight: 800, fontSize: '0.875rem' }}>
                  <span style={{ backgroundColor: isAllMandatoryUploaded ? '#10b981' : '#003366', color: 'white', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>3</span>
                  <span>Documents</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: isAllMandatoryUploaded ? '#003366' : '#94a3b8', fontWeight: 800, fontSize: '0.875rem' }}>
                  <span style={{ backgroundColor: isAllMandatoryUploaded ? '#003366' : '#cbd5e1', color: 'white', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>4</span>
                  <span>Submit</span>
                </div>
              </div>
            </div>

            {/* Validation Banner if documents missing */}
            {errors.documents && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderLeft: '5px solid #dc2626', color: '#991b1b', padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '2rem', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} color="#dc2626" /> {errors.documents}
              </div>
            )}

            <form onSubmit={handleInitiateSubmit} noValidate>
              
              {/* 29.2 Section 1 — Applicant Details Card */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #cbd5e1', padding: '2.25rem', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#003366', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.75rem' }}>
                  1. Applicant Details
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.35rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                      Full Name *
                    </label>
                    <input 
                      type="text" 
                      name="fullName"
                      placeholder="Enter applicant full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.925rem', border: errors.fullName ? '2px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                    />
                    {errors.fullName && <span style={{ color: '#dc2626', fontSize: '0.78rem', fontWeight: 700, marginTop: '0.25rem', display: 'block' }}>⚠️ {errors.fullName}</span>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                      Mobile Number *
                    </label>
                    <input 
                      type="tel" 
                      name="mobile"
                      placeholder="10-digit mobile number"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.925rem', border: errors.mobile ? '2px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                    />
                    {errors.mobile && <span style={{ color: '#dc2626', fontSize: '0.78rem', fontWeight: 700, marginTop: '0.25rem', display: 'block' }}>⚠️ {errors.mobile}</span>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      name="email"
                      placeholder="Email address (optional)"
                      value={formData.email}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.925rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                      ID Number * (Aadhaar / Voter ID / Passport)
                    </label>
                    <input 
                      type="text" 
                      name="aadhaarNumber"
                      placeholder="e.g. 1234 5678 9012"
                      value={formData.aadhaarNumber}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.925rem', border: errors.aadhaarNumber ? '2px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                    />
                    {errors.aadhaarNumber && <span style={{ color: '#dc2626', fontSize: '0.78rem', fontWeight: 700, marginTop: '0.25rem', display: 'block' }}>⚠️ {errors.aadhaarNumber}</span>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                      District *
                    </label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.925rem', border: errors.district ? '2px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', backgroundColor: '#ffffff' }}
                    >
                      <option value="Chennai">Chennai</option>
                      <option value="Chengalpattu">Chengalpattu</option>
                      <option value="Coimbatore">Coimbatore</option>
                      <option value="Kanchipuram">Kanchipuram</option>
                      <option value="Madurai">Madurai</option>
                      <option value="Salem">Salem</option>
                      <option value="Tiruchirappalli">Tiruchirappalli</option>
                      <option value="Tiruppur">Tiruppur</option>
                      <option value="Vellore">Vellore</option>
                    </select>
                    {errors.district && <span style={{ color: '#dc2626', fontSize: '0.78rem', fontWeight: 700, marginTop: '0.25rem', display: 'block' }}>⚠️ {errors.district}</span>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                      Taluk *
                    </label>
                    <input 
                      type="text" 
                      name="taluk"
                      placeholder="Taluk name (e.g. Tambaram)"
                      value={formData.taluk}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.925rem', border: errors.taluk ? '2px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                    />
                    {errors.taluk && <span style={{ color: '#dc2626', fontSize: '0.78rem', fontWeight: 700, marginTop: '0.25rem', display: 'block' }}>⚠️ {errors.taluk}</span>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                      Village *
                    </label>
                    <input 
                      type="text" 
                      name="village"
                      placeholder="Village / Ward name"
                      value={formData.village}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.925rem', border: errors.village ? '2px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                    />
                    {errors.village && <span style={{ color: '#dc2626', fontSize: '0.78rem', fontWeight: 700, marginTop: '0.25rem', display: 'block' }}>⚠️ {errors.village}</span>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                      Address * (Textarea)
                    </label>
                    <textarea 
                      name="address"
                      rows={3}
                      placeholder="Enter complete door no, street name & location address"
                      value={formData.address}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.925rem', border: errors.address ? '2px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', resize: 'vertical' }}
                    />
                    {errors.address && <span style={{ color: '#dc2626', fontSize: '0.78rem', fontWeight: 700, marginTop: '0.25rem', display: 'block' }}>⚠️ {errors.address}</span>}
                  </div>
                </div>
              </div>

              {/* 29.3 Section 2 — Building Details Card */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #cbd5e1', padding: '2.25rem', marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#003366', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.75rem' }}>
                  2. Building Details
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.35rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                      Building Type *
                    </label>
                    <select 
                      name="buildingType" 
                      value={formData.buildingType} 
                      onChange={handleInputChange} 
                      style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.925rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#ffffff' }}
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                      Survey Number *
                    </label>
                    <input 
                      type="text" 
                      name="surveyNumber"
                      placeholder="Survey Number / Plot No"
                      value={formData.surveyNumber}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.925rem', border: errors.surveyNumber ? '2px solid #dc2626' : '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                    />
                    {errors.surveyNumber && <span style={{ color: '#dc2626', fontSize: '0.78rem', fontWeight: 700, marginTop: '0.25rem', display: 'block' }}>⚠️ {errors.surveyNumber}</span>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                      Plot Area (sq.ft)
                    </label>
                    <input 
                      type="text" 
                      name="plotArea" 
                      placeholder="e.g. 1200 sq.ft"
                      value={formData.plotArea} 
                      onChange={handleInputChange} 
                      style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.925rem', border: '1px solid #cbd5e1', borderRadius: '8px' }} 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                      Proposed Building Area (sq.ft)
                    </label>
                    <input 
                      type="text" 
                      name="proposedBuildingArea" 
                      placeholder="e.g. 2100 sq.ft"
                      value={formData.proposedBuildingArea} 
                      onChange={handleInputChange} 
                      style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.925rem', border: '1px solid #cbd5e1', borderRadius: '8px' }} 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                      Number of Floors
                    </label>
                    <select 
                      name="numberOfFloors" 
                      value={formData.numberOfFloors} 
                      onChange={handleInputChange} 
                      style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.925rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#ffffff' }}
                    >
                      <option value="1 Floor (Ground)">1 Floor (Ground)</option>
                      <option value="G+1 Floor">G+1 Floor</option>
                      <option value="G+2 Floors">G+2 Floors</option>
                      <option value="Stilt + 3 Floors">Stilt + 3 Floors</option>
                      <option value="Multi-Storied Building">Multi-Storied Building</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                      Building Purpose
                    </label>
                    <select 
                      name="purposeOfBuilding" 
                      value={formData.purposeOfBuilding} 
                      onChange={handleInputChange} 
                      style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.925rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#ffffff' }}
                    >
                      <option value="Residential">Residential Housing</option>
                      <option value="Commercial Business">Commercial Business / Office</option>
                      <option value="Retail / Shop">Retail / Shop Premises</option>
                      <option value="Industrial Warehouse">Industrial Warehouse</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 29.4 Section 3 — Required Documents Card & 29.5 Upload Lock */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #cbd5e1', padding: '2.25rem', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.75rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#003366', margin: 0 }}>
                    3. Required Documents
                  </h2>

                  {/* 29.5 Mandatory Document Counter Banner */}
                  <div style={{
                    backgroundColor: isAllMandatoryUploaded ? '#d1fae5' : '#fff7ed',
                    color: isAllMandatoryUploaded ? '#047857' : '#c2410c',
                    border: `1px solid ${isAllMandatoryUploaded ? '#6ee7b7' : '#ffedd5'}`,
                    padding: '0.4rem 0.95rem',
                    borderRadius: '30px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}>
                    {isAllMandatoryUploaded ? (
                      <>
                        <CheckCircle2 size={16} color="#10b981" /> {uploadedMandatoryCount} / {totalMandatoryCount} Required Documents Uploaded
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={16} color="#c2410c" /> {uploadedMandatoryCount} / {totalMandatoryCount} Documents Uploaded — ⚠ Please upload {remainingCount} remaining document(s)
                      </>
                    )}
                  </div>
                </div>

                {/* Document Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  {requiredDocList.map((doc) => {
                    const uploadInfo = uploadedDocs[doc.name];
                    const isUploaded = !!uploadInfo;

                    return (
                      <div 
                        key={doc.id}
                        style={{
                          backgroundColor: isUploaded ? '#f0fdf4' : '#ffffff',
                          border: isUploaded ? '2px solid #10b981' : (doc.mandatory ? '1px solid #cbd5e1' : '1px dashed #cbd5e1'),
                          borderRadius: '12px',
                          padding: '1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justify: 'space-between',
                          gap: '1rem',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                              {doc.name}
                            </span>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              padding: '0.15rem 0.55rem',
                              borderRadius: '12px',
                              backgroundColor: isUploaded ? '#d1fae5' : (doc.mandatory ? '#fee2e2' : '#f1f5f9'),
                              color: isUploaded ? '#047857' : (doc.mandatory ? '#b91c1c' : '#64748b')
                            }}>
                              {isUploaded ? '✓ Uploaded' : (doc.mandatory ? 'Required' : 'Optional')}
                            </span>
                          </div>
                          
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {doc.label}
                          </div>

                          {/* 29.4 After Uploaded UI View */}
                          {isUploaded && (
                            <div style={{ marginTop: '0.6rem', backgroundColor: '#ffffff', border: '1px solid #86efac', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', color: '#047857', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Check size={14} color="#10b981" /> {uploadInfo.fileName || `${doc.name}.pdf`} — Uploaded successfully
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                          <label style={{
                            backgroundColor: isUploaded ? '#ffffff' : '#003366',
                            color: isUploaded ? '#003366' : '#ffffff',
                            border: isUploaded ? '2px solid #003366' : 'none',
                            padding: '0.55rem 1.1rem',
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                          }}>
                            <UploadCloud size={16} />
                            {isUploaded ? 'Replace' : 'Choose File'}
                            <input 
                              type="file" 
                              accept=".pdf,image/*" 
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const selectedFile = e.target.files && e.target.files[0];
                                if (selectedFile) {
                                  handleFileUpload(doc.id, doc.name, selectedFile);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 29.5 Submit Action Button & Upload Lock */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #cbd5e1', padding: '1.75rem 2.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                    {uploadedMandatoryCount} / {totalMandatoryCount} Required Documents Uploaded
                  </div>
                  {!isAllMandatoryUploaded && (
                    <div style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 600, marginTop: '0.2rem' }}>
                      ⚠ Please upload {remainingCount} remaining document(s) to enable submission.
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    type="button"
                    onClick={() => navigate('/')}
                    style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', padding: '0.85rem 1.75rem', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!isAllMandatoryUploaded || isSubmitting}
                    style={{
                      backgroundColor: isAllMandatoryUploaded ? '#003366' : '#cbd5e1',
                      color: isAllMandatoryUploaded ? '#ffffff' : '#64748b',
                      border: 'none',
                      padding: '0.9rem 2.75rem',
                      borderRadius: '10px',
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      cursor: isAllMandatoryUploaded ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      boxShadow: isAllMandatoryUploaded ? '0 4px 15px rgba(0,51,102,0.35)' : 'none',
                      opacity: isSubmitting ? 0.75 : 1
                    }}
                  >
                    Submit Application <ArrowRight size={19} />
                  </button>
                </div>
              </div>

            </form>

          </div>

        )}

      </div>

      {/* Step 30 — Confirmation Modal Before Submit */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(5px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #cbd5e1',
            overflow: 'hidden',
            animation: 'loginCardAppear 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{ backgroundColor: '#003366', color: 'white', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Confirm Application
              </h3>
              <button 
                onClick={() => setShowConfirmModal(false)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '2rem' }}>
              <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
                Please verify that the information and documents you provided are correct. Once submitted, your application will be sent to the Building Approval Administration team for review.
              </p>

              {/* Application Summary Box */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Applicant:</span>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>{formData.fullName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Building Type / Survey:</span>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>{formData.buildingType} • {formData.surveyNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Attached Documents:</span>
                  <span style={{ fontWeight: 800, color: '#059669' }}>{Object.keys(uploadedDocs).length} Statutory Files</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button 
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleFinalConfirm}
                  style={{ backgroundColor: '#003366', color: '#ffffff', border: 'none', padding: '0.75rem 1.75rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,51,102,0.3)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  Confirm & Submit <Check size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

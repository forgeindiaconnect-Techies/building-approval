import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Upload, CheckCircle, AlertTriangle, Clock, Download, Phone, Send } from 'lucide-react';

export default function CustomerUpload() {
  const { id } = useParams();
  const { applications = [], addDocument, sendBrevoCustomEmail } = useApp();
  const cleanId = (id || '').trim();
  const app = applications.find(a => 
    a && a.id && (a.id === cleanId || a.id.toLowerCase() === cleanId.toLowerCase())
  );
  
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  if (!app) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--background)' }}>
        <div className="card" style={{ maxWidth: '420px', textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>Invalid Link</h2>
          <p style={{ color: 'var(--text-muted)' }}>This application link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  const defaultRequiredDocs = [
    "Land / Sale Deed",
    "Patta / Chitta",
    "Encumbrance Certificate (EC)",
    "Approved / Proposed Building Plan",
    "Site Plan",
    "Applicant ID Proof",
    "Property Tax Receipt",
    "Ownership Proof"
  ];

  const docsList = (app.requiredDocs && app.requiredDocs.length > 0) ? app.requiredDocs : defaultRequiredDocs;
  
  const getDocStatus = (docName) => {
    if (!app.documents) return { status: 'pending' };
    const uploadedDoc = app.documents.find(d => d.name === docName || (d.name && d.name.toLowerCase() === docName.toLowerCase()));
    if (!uploadedDoc) return { status: 'pending' };
    return uploadedDoc;
  };

  const verifiedCount = docsList.filter(d => getDocStatus(d).status === 'verified').length;
  const totalDocs = docsList.length;
  const uploadedCount = docsList.filter(d => getDocStatus(d).status !== 'pending' || getDocStatus(d).uploadDate).length;

  const pendingCount = docsList.filter(d => {
    const s = getDocStatus(d).status;
    return s === 'pending' && !getDocStatus(d).uploadDate;
  }).length;
  const rejectedCount = docsList.filter(d => getDocStatus(d).status === 'reupload_required').length;
  const isDocumentsComplete = verifiedCount === totalDocs;

  const compressImage = (dataUrl, maxWidth = 1200, quality = 0.75) => {
    return new Promise((resolve) => {
      if (!dataUrl || !dataUrl.startsWith('data:image/')) {
        return resolve(dataUrl);
      }
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(dataUrl);
    });
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file.");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const originalDataUrl = event.target.result;
      const compressedDataUrl = await compressImage(originalDataUrl);
      addDocument(id, uploadingDoc, compressedDataUrl);
      setFile(null);
      setUploadingDoc(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (uploadedCount === 0) {
      alert("Please upload at least one document before submitting.");
      return;
    }
    setSubmitted(true);

    if (app && app.email && app.email.includes('@')) {
      sendBrevoCustomEmail({
        toEmail: app.email,
        toName: app.applicantName,
        subject: `📄 Documents Received: ${app.id} — DTCP Clearance Portal`,
        message: `Dear ${app.applicantName},\n\nYour uploaded documents for application ${app.id} have been successfully received and submitted for technical scrutiny.\n\nTrack your live progress at: ${window.location.origin}/track`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; color: #1e293b;">
            <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
              <h2 style="color: #0F2A4A; margin-top: 0;">📄 Documents Received Successfully</h2>
              <p>Dear <strong>${app.applicantName}</strong>,</p>
              <p>We have successfully received your uploaded documentation for Application ID: <strong style="color: #2563eb; font-family: monospace;">${app.id}</strong>.</p>
              <p>Our town planning officers have begun technical scrutiny and verification of your uploaded files.</p>
              <div style="text-align: center; margin: 25px 0;">
                <a href="${window.location.origin}/track" style="background-color: #0F2A4A; color: #ffffff; padding: 12px 26px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">🔍 Track Application Status</a>
              </div>
              <p style="font-size: 12px; color: #64748b; margin-top: 20px;">Directorate of Town and Country Planning (DTCP) • Government of Tamil Nadu</p>
            </div>
          </div>
        `
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Top Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid var(--border)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontSize: '1.75rem' }}>🏛️</div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F2A4A', margin: 0 }}>Tamil Nadu Building Approval Portal</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Single Window Clearance System • DTCP</p>
          </div>
        </div>
        <a href="tel:+919876543210" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
          <Phone size={16} /> Support
        </a>
      </header>

      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        
        {/* Success Modal/Banner on Submit */}
        {submitted && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="card" style={{ maxWidth: '450px', width: '100%', textAlign: 'center', padding: '2.5rem 1.5rem', backgroundColor: 'white' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <CheckCircle size={40} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Documents Submitted!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem' }}>
                Thank you! Your documents for Application <strong>{app.id}</strong> have been submitted successfully. Our verification team will review them shortly.
              </p>
              <button className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} onClick={() => setSubmitted(false)}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* Application Info */}
        <div className="card" style={{ marginBottom: '2rem', borderTop: '4px solid var(--primary)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Application Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Application ID</p>
              <p style={{ fontWeight: 600, color: 'var(--primary)' }}>{app.id}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Customer</p>
              <p style={{ fontWeight: 600 }}>{app.applicantName}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Location</p>
              <p style={{ fontWeight: 600 }}>{app.location || 'N/A'}</p>
            </div>
          </div>

          {/* Document Stepper */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem' }}>Document Upload Progress</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', marginBottom: '1rem' }}>
              <div style={{ position: 'absolute', top: '24px', left: '40px', right: '40px', height: '4px', backgroundColor: 'var(--border)', zIndex: 0 }}>
                 <div style={{ height: '100%', backgroundColor: 'var(--success)', width: isDocumentsComplete ? '100%' : uploadedCount > 0 ? '50%' : '15%', transition: 'width 0.3s ease' }}></div>
              </div>
              
              {[ 
                { label: 'Upload Documents', active: true, current: uploadedCount < totalDocs },
                { 
                   label: rejectedCount > 0 ? 'Re-upload Needed' : 'Under Review', 
                   active: uploadedCount > 0, 
                   current: uploadedCount > 0 && !isDocumentsComplete,
                   warning: rejectedCount > 0
                },
                { label: 'Verification Complete', active: isDocumentsComplete }
              ].map((step, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', zIndex: 1, backgroundColor: 'white', padding: '0 0.5rem' }}>
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '50%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: step.warning ? 'var(--danger)' : step.active ? 'var(--success)' : step.current ? 'var(--primary)' : 'var(--surface-hover)',
                    color: step.active || step.current || step.warning ? 'white' : 'var(--text-muted)',
                    border: step.current ? '4px solid var(--primary-light)' : 'none'
                  }}>
                    {step.active && !step.warning ? <CheckCircle size={24} /> : step.warning ? <span style={{ fontSize: '1.25rem' }}>⚠</span> : <span style={{ fontWeight: 600 }}>{idx + 1}</span>}
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: step.active || step.current ? 600 : 400, color: step.active || step.current ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upload Modal */}
        {uploadingDoc && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ width: '400px', backgroundColor: 'var(--background)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Upload Document</h3>
              <p style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '1.5rem' }}>{uploadingDoc}</p>
              
              <form onSubmit={handleUpload}>
                <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', backgroundColor: 'white', marginBottom: '1.5rem' }}>
                  <input 
                    type="file" 
                    id="file-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <Upload size={32} color="var(--primary)" />
                    <span style={{ fontWeight: 500, color: 'var(--primary)' }}>Choose File</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Accepted: PDF, JPG, PNG (Max 10MB)</span>
                  </label>
                  {file && <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--success)', fontWeight: 600 }}>{file.name}</p>}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => {setUploadingDoc(null); setFile(null);}}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Upload</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Document Cards */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>Required Documents</h2>
          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.875rem', fontWeight: 500, padding: '0.5rem 1rem', backgroundColor: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
             <span><strong style={{color: 'var(--text-main)'}}>{totalDocs}</strong> Total</span> <span style={{color: 'var(--border)'}}>|</span>
             <span style={{ color: 'var(--success)' }}>{verifiedCount} Verified</span> <span style={{color: 'var(--border)'}}>|</span>
             <span style={{ color: 'var(--warning)' }}>{docsList.filter(d => getDocStatus(d).status === 'pending' && getDocStatus(d).uploadDate).length} Under Review</span> <span style={{color: 'var(--border)'}}>|</span>
             <span style={{ color: 'var(--danger)' }}>{rejectedCount} Re-upload</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {docsList.map(docName => {
            const docInfo = getDocStatus(docName);
            const isVerified = docInfo.status === 'verified';
            const isRejected = docInfo.status === 'reupload_required';
            const isPending = docInfo.status === 'pending' && !docInfo.uploadDate;
            const isUnderReview = docInfo.status === 'pending' && !!docInfo.uploadDate;

            return (
              <div key={docName} className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderLeft: isVerified ? '4px solid var(--success)' : isRejected ? '4px solid var(--danger)' : isUnderReview ? '4px solid var(--warning)' : '4px solid var(--border)' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{docName}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Required Document</p>

                  {isVerified && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: 600, fontSize: '0.875rem' }}>
                      <CheckCircle size={16} />
                      <span>Verified by Admin</span>
                    </div>
                  )}

                  {isUnderReview && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', fontWeight: 600, fontSize: '0.875rem' }}>
                      <Clock size={16} />
                      <span>Under Review</span>
                    </div>
                  )}

                  {isPending && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.875rem' }}>
                      <span>Pending Upload</span>
                    </div>
                  )}

                  {isRejected && (
                    <div style={{ color: 'var(--danger)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        <AlertTriangle size={16} />
                        <span>Re-upload Required</span>
                      </div>
                      <div style={{ fontSize: '0.875rem', backgroundColor: 'var(--danger-bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Reason:</span>
                        {docInfo.rejectedReason}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                  {(isPending || isRejected) && (
                    <button 
                      className="btn"
                      onClick={() => setUploadingDoc(docName)}
                      style={{ padding: '0.5rem 1rem', backgroundColor: isRejected ? 'var(--danger)' : 'var(--primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Upload size={14} /> {isRejected ? 'Upload Again' : 'Upload Document'}
                    </button>
                  )}

                  {(isVerified || isUnderReview) && docInfo.file && (
                    <a 
                      href={docInfo.file} 
                      download={docInfo.name} 
                      className="btn btn-outline"
                      style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                    >
                      <Download size={14} /> View Document
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Button Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginTop: '2rem', padding: '1.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div>
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)' }}>Ready to Submit?</p>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Click submit once you have uploaded your required documents.</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={handleSubmit}
            style={{ padding: '0.875rem 2.5rem', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Send size={18} /> Submit Documents
          </button>
        </div>

      </div>
    </div>
  );
}


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Search, 
  ArrowRight, 
  MapPin, 
  UploadCloud, 
  FileText, 
  Award,
  Check,
  Bell,
  Calendar,
  ShieldCheck,
  ClipboardList,
  Phone,
  Mail,
  Clock,
  Users,
  Zap,
  Layers,
  Lock,
  CheckCircle2
} from 'lucide-react';

const heroBuildingImage = 'https://bidandbuild.in/uploads/articles/fe101965-a74a-437e-ae9f-fc04bef842c9/c8d313f8-87dc-445c-8678-5cde2e172c47.jpg';

export default function LandingPage() {
  const navigate = useNavigate();
  const { currentUser, applications = [] } = useApp();

  const [trackQuery, setTrackQuery] = useState('BA-2026-00125');
  const [activeTrackingData, setActiveTrackingData] = useState({
    id: 'BA-2026-00125',
    applicant: 'Ravi Kumar',
    location: 'Zone 4, Anna Nagar, Chennai',
    buildingType: 'Residential (G+2)',
    currentStage: 'Site Inspection',
    estimatedClearance: '3 Business Days',
    status: 'In Progress',
    stages: [
      { name: 'Application Submitted', status: 'completed', date: '18 Sep 2026' },
      { name: 'Documents Verified', status: 'completed', date: '21 Sep 2026' },
      { name: 'Site Inspection', status: 'current', date: 'In Progress' },
      { name: 'Final Approval', status: 'pending', date: 'Estimated 27 Sep 2026' },
    ]
  });

  const handleTrackSubmit = (e) => {
    if (e) e.preventDefault();
    const query = trackQuery.trim().toUpperCase() || 'BA-2026-00125';
    
    const clean = query.replace(/^BA-/, '').replace(/^APP-/, '');
    const found = applications.find(a => 
      a && a.id && (
        a.id.toUpperCase() === query || 
        a.id.toUpperCase().replace(/^APP-/, '').replace(/^BA-/, '') === clean ||
        (a.applicantName && a.applicantName.toUpperCase().includes(query))
      )
    );

    if (found) {
      setActiveTrackingData({
        id: found.id || query,
        applicant: found.applicantName || 'Applicant',
        location: found.location || found.address || 'Chennai District',
        buildingType: `${found.buildingType || 'Residential'} (${found.buildingDetails?.noOfFloors || 'G+2'})`,
        currentStage: found.status === 'approved' ? 'Final Approval' : found.status === 'documents_verified' ? 'Site Inspection' : 'Documents Scrutiny',
        estimatedClearance: '3 Days',
        status: found.status === 'approved' ? 'Approved' : 'In Progress',
        stages: [
          { name: 'Application Submitted', status: 'completed', date: '18 Sep 2026' },
          { name: 'Documents Verified', status: found.status !== 'pending' ? 'completed' : 'current', date: '21 Sep 2026' },
          { name: 'Site Inspection', status: found.status === 'documents_verified' ? 'current' : found.status === 'approved' ? 'completed' : 'pending', date: 'In Progress' },
          { name: 'Final Approval', status: found.status === 'approved' ? 'completed' : 'pending', date: found.status === 'approved' ? 'Cleared' : 'Pending' },
        ]
      });
    } else {
      setActiveTrackingData({
        id: query,
        applicant: 'Ravi Kumar',
        location: 'Zone 4, Anna Nagar, Chennai',
        buildingType: 'Residential (G+2)',
        currentStage: 'Site Inspection',
        estimatedClearance: '3 Business Days',
        status: 'In Progress',
        stages: [
          { name: 'Application Submitted', status: 'completed', date: '18 Sep 2026' },
          { name: 'Documents Verified', status: 'completed', date: '21 Sep 2026' },
          { name: 'Site Inspection', status: 'current', date: 'Scheduled for Tomorrow' },
          { name: 'Final Approval', status: 'pending', date: 'Pending Clearance' },
        ]
      });
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#FFFFFF', color: '#0F172A', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* ----------------- 1. NAVBAR (Clean Minimal White Glass) ----------------- */}
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        width: '100%', 
        padding: '0.85rem 2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}>
              <Building2 size={20} />
            </div>
            <div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F2A4A', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.1 }}>
                BuildPermit
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Building Approval System</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <a href="#hero" style={{ textDecoration: 'none', color: '#0F2A4A', fontWeight: 600, fontSize: '0.88rem' }}>Home</a>
            <a href="#how-it-works" style={{ textDecoration: 'none', color: '#475569', fontWeight: 500, fontSize: '0.88rem', transition: 'color 0.2s' }}>How It Works</a>
            <a href="#services" style={{ textDecoration: 'none', color: '#475569', fontWeight: 500, fontSize: '0.88rem', transition: 'color 0.2s' }}>Services</a>
            <a href="#track-preview" style={{ textDecoration: 'none', color: '#475569', fontWeight: 500, fontSize: '0.88rem', transition: 'color 0.2s' }}>Track Application</a>
            <a href="#why-us" style={{ textDecoration: 'none', color: '#475569', fontWeight: 500, fontSize: '0.88rem', transition: 'color 0.2s' }}>Why BuildPermit</a>
            <a href="#contact" style={{ textDecoration: 'none', color: '#475569', fontWeight: 500, fontSize: '0.88rem', transition: 'color 0.2s' }}>Contact</a>
          </nav>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {currentUser ? (
              <button 
                onClick={() => navigate(currentUser === 'Admin' ? '/admin' : '/worker')}
                style={{ 
                  borderRadius: '10px', 
                  padding: '0.55rem 1.15rem', 
                  fontWeight: 600, 
                  fontSize: '0.85rem', 
                  color: '#0F2A4A',
                  backgroundColor: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  cursor: 'pointer'
                }}
              >
                Go to Dashboard
              </button>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                style={{ 
                  borderRadius: '10px', 
                  padding: '0.55rem 1.15rem', 
                  fontWeight: 600, 
                  fontSize: '0.85rem', 
                  color: '#0F2A4A',
                  backgroundColor: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  cursor: 'pointer'
                }}
              >
                Login
              </button>
            )}

            <button 
              onClick={() => navigate('/apply')}
              style={{
                borderRadius: '10px',
                padding: '0.58rem 1.3rem',
                fontWeight: 600,
                fontSize: '0.85rem',
                backgroundColor: '#2563EB',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
              }}
            >
              Apply Now
            </button>
          </div>
        </div>
      </header>


      {/* ----------------- 2. PREMIUM HERO SECTION (Clean Light Architectural) ----------------- */}
      <section id="hero" style={{ 
        position: 'relative', 
        width: '100%', 
        minHeight: '86vh', 
        display: 'flex', 
        alignItems: 'center', 
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0'
      }}>
        
        {/* Subtle Architectural Photograph Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${heroBuildingImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(4px) brightness(1.02) saturate(0.5)',
          opacity: 0.18,
          transform: 'scale(1.04)',
          zIndex: 1
        }} />

        {/* Soft White-to-Transparent Architectural Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.94) 0%, rgba(248, 250, 252, 0.88) 55%, rgba(241, 245, 249, 0.96) 100%)',
          zIndex: 2
        }} />

        <div style={{ maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '4.5rem 2rem', position: 'relative', zIndex: 3 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '3.5rem', alignItems: 'center' }}>
            
            {/* Left Hero Content Card with Subtle Light Glassmorphism */}
            <div style={{ 
              padding: '3rem 2.5rem', 
              borderRadius: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              boxShadow: '0 20px 45px rgba(15, 42, 74, 0.06)'
            }}>
              
              {/* Trust/Status Indicator */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                padding: '0.35rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#1D4ED8',
                marginBottom: '1.5rem'
              }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#2563EB', display: 'inline-block' }} />
                Digital Building Approval Management
              </div>

              <h1 style={{
                fontSize: '3.2rem',
                fontWeight: 800,
                color: '#0F2A4A',
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                marginBottom: '1.25rem'
              }}>
                Building Approvals, <br />
                <span style={{ color: '#2563EB' }}>Simplified.</span>
              </h1>

              <p style={{
                fontSize: '1.05rem',
                color: '#475569',
                lineHeight: 1.7,
                marginBottom: '2.25rem',
                fontWeight: 400
              }}>
                Submit applications, manage documents, schedule inspections, and track approval progress — all in one secure platform.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => navigate('/apply')}
                  style={{
                    padding: '0.85rem 2rem',
                    borderRadius: '12px',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Apply Now
                  <ArrowRight size={16} />
                </button>

                <a 
                  href="#track-preview"
                  style={{
                    padding: '0.85rem 1.85rem',
                    borderRadius: '12px',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    border: '1px solid #CBD5E1',
                    color: '#0F2A4A',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(15, 42, 74, 0.04)'
                  }}
                >
                  <Search size={16} />
                  Track Application
                </a>
              </div>
            </div>

            {/* Right Hero: Floating Application-Status Card */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '100%',
                maxWidth: '420px',
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                padding: '2rem',
                boxShadow: '0 20px 45px rgba(15, 42, 74, 0.08), 0 2px 10px rgba(15, 42, 74, 0.04)',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.85rem', borderBottom: '1px solid #F1F5F9' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Permit Application</span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F2A4A', margin: '0.1rem 0 0 0' }}>#BA-2026-00125</h3>
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.28rem 0.75rem',
                    borderRadius: '9999px',
                    backgroundColor: '#FEF3C7',
                    color: '#B45309',
                    border: '1px solid #FDE68A'
                  }}>
                    In Progress
                  </span>
                </div>

                {/* Status Timeline Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  
                  {/* Step 1 Completed */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 1rem', borderRadius: '12px', backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#16A34A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803D', display: 'block' }}>Documents Verified</span>
                      <span style={{ fontSize: '0.72rem', color: '#166534' }}>All architectural drawings cleared</span>
                    </div>
                  </div>

                  {/* Step 2 In Progress */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 1rem', borderRadius: '12px', backgroundColor: '#FFFBEB', border: '1px solid #FEF3C7' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#D97706', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                      ●
                    </div>
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#B45309', display: 'block' }}>Site Inspection</span>
                      <span style={{ fontSize: '0.72rem', color: '#92400E' }}>Field engineer visit in progress</span>
                    </div>
                  </div>

                  {/* Step 3 Upcoming */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 1rem', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block' }}>Final Approval</span>
                      <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Digital certificate issuance</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid #F1F5F9', fontSize: '0.78rem', color: '#64748B' }}>
                  <span>Est. Clearance: <strong style={{ color: '#0F2A4A' }}>3 Business Days</strong></span>
                  <span 
                    style={{ color: '#2563EB', fontWeight: 700, cursor: 'pointer' }}
                    onClick={() => {
                      const trackElem = document.getElementById('track-preview');
                      if (trackElem) trackElem.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    View Timeline →
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ----------------- 3. PLATFORM STATISTICS ----------------- */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '4.5rem 2rem', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Trusted Infrastructure</span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F2A4A', margin: '0.35rem 0 2.5rem 0', letterSpacing: '-0.02em' }}>
            Trusted Digital Approval Platform
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            
            <div style={{ padding: '2rem 1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(15, 42, 74, 0.04)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F2A4A', lineHeight: 1 }}>1,250+</div>
              <div style={{ fontSize: '0.88rem', color: '#64748B', fontWeight: 600, marginTop: '0.6rem' }}>Applications Processed</div>
            </div>

            <div style={{ padding: '2rem 1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(15, 42, 74, 0.04)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#16A34A', lineHeight: 1 }}>980+</div>
              <div style={{ fontSize: '0.88rem', color: '#64748B', fontWeight: 600, marginTop: '0.6rem' }}>Approvals Completed</div>
            </div>

            <div style={{ padding: '2rem 1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(15, 42, 74, 0.04)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#2563EB', lineHeight: 1 }}>45+</div>
              <div style={{ fontSize: '0.88rem', color: '#64748B', fontWeight: 600, marginTop: '0.6rem' }}>Active Field Officers</div>
            </div>

            <div style={{ padding: '2rem 1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(15, 42, 74, 0.04)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F2A4A', lineHeight: 1 }}>12+</div>
              <div style={{ fontSize: '0.88rem', color: '#64748B', fontWeight: 600, marginTop: '0.6rem' }}>Locations Covered</div>
            </div>

          </div>
        </div>
      </section>


      {/* ----------------- 4. HOW IT WORKS ----------------- */}
      <section id="how-it-works" style={{ padding: '5.5rem 2rem', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Simple Process
            </span>
            <h2 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#0F2A4A', marginTop: '0.35rem', letterSpacing: '-0.02em' }}>
              How It Works
            </h2>
            <p style={{ fontSize: '0.98rem', color: '#64748B', marginTop: '0.5rem', maxWidth: '640px', margin: '0.5rem auto 0 auto' }}>
              A 4-step streamlined digital pathway from initial application to final construction sanction letter.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.75rem' }}>
            
            {/* Step 1 */}
            <div style={{
              padding: '2.25rem 1.75rem',
              backgroundColor: '#F8FAFC',
              borderRadius: '16px',
              border: '1px solid #E2E8F0'
            }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Step 01
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F2A4A', margin: '0.35rem 0 0.65rem 0' }}>
                Apply Online
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                Submit project details, plot dimensions, zone location, and building type via our structured digital form.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{
              padding: '2.25rem 1.75rem',
              backgroundColor: '#F8FAFC',
              borderRadius: '16px',
              border: '1px solid #E2E8F0'
            }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Step 02
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F2A4A', margin: '0.35rem 0 0.65rem 0' }}>
                Upload Documents
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                Securely upload architectural CAD blueprints, title deeds, Patta, EC, and required NOC clearances to the cloud vault.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{
              padding: '2.25rem 1.75rem',
              backgroundColor: '#F8FAFC',
              borderRadius: '16px',
              border: '1px solid #E2E8F0'
            }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Step 03
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F2A4A', margin: '0.35rem 0 0.65rem 0' }}>
                Verification & Site Visit
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                Automated DCR byelaw scrutiny followed by GPS-verified physical on-site inspection by licensed field officers.
              </p>
            </div>

            {/* Step 4 */}
            <div style={{
              padding: '2.25rem 1.75rem',
              backgroundColor: '#F0FDF4',
              borderRadius: '16px',
              border: '1px solid #DCFCE7'
            }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Step 04
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803D', margin: '0.35rem 0 0.65rem 0' }}>
                Final Approval
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#166534', lineHeight: 1.6, margin: 0 }}>
                Instant issuance of tamper-evident digital sanction letter and permit certificate with QR code clearance.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* ----------------- 5. KEY FEATURES ----------------- */}
      <section id="services" style={{ padding: '5.5rem 2rem', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Services & Capabilities</span>
            <h2 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#0F2A4A', marginTop: '0.35rem', letterSpacing: '-0.02em' }}>Key Platform Features</h2>
            <p style={{ fontSize: '0.98rem', color: '#64748B', marginTop: '0.5rem' }}>Built for transparent public administration and swift construction clearances.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.75rem' }}>
            
            {/* Feature 1 */}
            <div style={{ padding: '2rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(15, 42, 74, 0.04)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <ClipboardList size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F2A4A', margin: '0 0 0.45rem 0' }}>Online Application</h3>
              <p style={{ fontSize: '0.86rem', color: '#64748B', margin: 0, lineHeight: 1.55 }}>
                Streamlined multi-step digital forms with automated DCR setback and coverage rule checks.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{ padding: '2rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(15, 42, 74, 0.04)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <UploadCloud size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F2A4A', margin: '0 0 0.45rem 0' }}>Secure Document Upload</h3>
              <p style={{ fontSize: '0.86rem', color: '#64748B', margin: 0, lineHeight: 1.55 }}>
                Bank-grade encrypted repository for architectural drawings, Patta, EC, and title deeds.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{ padding: '2rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(15, 42, 74, 0.04)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Search size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F2A4A', margin: '0 0 0.45rem 0' }}>Application Tracking</h3>
              <p style={{ fontSize: '0.86rem', color: '#64748B', margin: 0, lineHeight: 1.55 }}>
                Instant public progress lookup showing exact stage clearance, officer notes, and deadlines.
              </p>
            </div>

            {/* Feature 4 */}
            <div style={{ padding: '2rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(15, 42, 74, 0.04)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <MapPin size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F2A4A', margin: '0 0 0.45rem 0' }}>Site Visit Management</h3>
              <p style={{ fontSize: '0.86rem', color: '#64748B', margin: 0, lineHeight: 1.55 }}>
                Field inspection scheduling with GPS photo uploads and mobile attendance verification.
              </p>
            </div>

            {/* Feature 5 */}
            <div style={{ padding: '2rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(15, 42, 74, 0.04)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Users size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F2A4A', margin: '0 0 0.45rem 0' }}>Worker Assignment</h3>
              <p style={{ fontSize: '0.86rem', color: '#64748B', margin: 0, lineHeight: 1.55 }}>
                Intelligent zone-based allocation of town planning officers and licensed site inspectors.
              </p>
            </div>

            {/* Feature 6 */}
            <div style={{ padding: '2rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(15, 42, 74, 0.04)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Bell size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F2A4A', margin: '0 0 0.45rem 0' }}>Real-Time Status Updates</h3>
              <p style={{ fontSize: '0.86rem', color: '#64748B', margin: 0, lineHeight: 1.55 }}>
                Automated SMS & portal notifications whenever files move to inspection, scrutiny, or sanction.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* ----------------- 6. APPLICATION TRACKING PREVIEW (Clean Light Console) ----------------- */}
      <section id="track-preview" style={{ padding: '5.5rem 2rem', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live Verification</span>
            <h2 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#0F2A4A', marginTop: '0.35rem', letterSpacing: '-0.02em' }}>Application Tracking Preview</h2>
            <p style={{ fontSize: '0.98rem', color: '#64748B', marginTop: '0.5rem' }}>
              Enter any application number to test the real-time milestone tracking pipeline.
            </p>
          </div>

          {/* Interactive Input Form */}
          <form onSubmit={handleTrackSubmit} style={{ maxWidth: '560px', margin: '0 auto 2.5rem auto', display: 'flex', gap: '0.75rem' }}>
            <input 
              type="text" 
              value={trackQuery}
              onChange={(e) => setTrackQuery(e.target.value)}
              placeholder="e.g. BA-2026-00125"
              style={{
                flex: 1,
                padding: '0.85rem 1.25rem',
                fontSize: '0.92rem',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                outline: 'none',
                boxShadow: '0 2px 6px rgba(15, 42, 74, 0.04)'
              }}
            />
            <button 
              type="submit"
              style={{
                borderRadius: '12px',
                padding: '0 1.85rem',
                backgroundColor: '#2563EB',
                fontWeight: 600,
                fontSize: '0.92rem',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
              }}
            >
              Track
            </button>
          </form>

          {/* Dashboard-Style Tracking Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            color: '#0F172A',
            padding: '2.5rem',
            boxShadow: '0 20px 45px rgba(15, 42, 74, 0.06)',
            border: '1px solid #E2E8F0'
          }}>
            
            {/* Header Details */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #F1F5F9' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F2A4A', margin: 0 }}>
                    #{activeTrackingData.id}
                  </h3>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.28rem 0.75rem',
                    borderRadius: '9999px',
                    backgroundColor: activeTrackingData.status === 'Approved' ? '#DCFCE7' : '#FEF3C7',
                    color: activeTrackingData.status === 'Approved' ? '#15803D' : '#B45309'
                  }}>
                    {activeTrackingData.status}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.65rem', fontSize: '0.85rem', color: '#64748B', flexWrap: 'wrap' }}>
                  <span>Applicant: <strong style={{ color: '#0F2A4A' }}>{activeTrackingData.applicant}</strong></span>
                  <span>Type: <strong style={{ color: '#0F2A4A' }}>{activeTrackingData.buildingType}</strong></span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Location</span>
                <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F2A4A', margin: '0.2rem 0 0 0' }}>
                  <MapPin size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle', color: '#2563EB' }} />
                  {activeTrackingData.location}
                </p>
              </div>
            </div>

            {/* Horizontal Timeline */}
            <div style={{ marginTop: '2rem', padding: '0.5rem 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', position: 'relative' }}>
                
                {activeTrackingData.stages.map((stage, idx) => {
                  const isDone = stage.status === 'completed';
                  const isCurrent = stage.status === 'current';

                  return (
                    <div key={idx} style={{ textAlign: 'center', position: 'relative', padding: '0 0.5rem' }}>
                      
                      {/* Step Circle */}
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: isDone ? '#16A34A' : isCurrent ? '#D97706' : '#F1F5F9',
                        color: isDone || isCurrent ? '#FFFFFF' : '#94A3B8',
                        border: isCurrent ? '3px solid #FEF3C7' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 0.65rem auto',
                        fontWeight: 800,
                        fontSize: '0.82rem'
                      }}>
                        {isDone ? <Check size={16} strokeWidth={3} /> : idx + 1}
                      </div>

                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: isDone || isCurrent ? '#0F2A4A' : '#94A3B8', margin: '0 0 0.2rem 0' }}>
                        {stage.name}
                      </h4>
                      <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        {stage.date}
                      </span>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* Footer Summary */}
            <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
              <span style={{ color: '#64748B' }}>
                Current Stage: <strong style={{ color: '#2563EB' }}>{activeTrackingData.currentStage}</strong>
              </span>
              <button 
                onClick={() => navigate(`/track-status?id=${encodeURIComponent(activeTrackingData.id)}`)}
                style={{
                  padding: '0.45rem 1.15rem',
                  borderRadius: '8px',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  color: '#1D4ED8',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Full Inspection Details →
              </button>
            </div>

          </div>

        </div>
      </section>


      {/* ----------------- 7. WHY USE THE PLATFORM ----------------- */}
      <section id="why-us" style={{ padding: '5.5rem 2rem', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Core Values</span>
            <h2 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#0F2A4A', marginTop: '0.35rem', letterSpacing: '-0.02em' }}>Why Use BuildPermit</h2>
            <p style={{ fontSize: '0.98rem', color: '#64748B', marginTop: '0.5rem' }}>Engineered for absolute integrity, speed, and regulatory compliance.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.5rem' }}>
            
            {/* Value 1 */}
            <div style={{ padding: '1.75rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 2px 8px rgba(15, 42, 74, 0.04)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.15rem auto' }}>
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0F2A4A', margin: '0 0 0.4rem 0' }}>Transparency</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                Complete open scrutiny audit logs with zero opaque delays.
              </p>
            </div>

            {/* Value 2 */}
            <div style={{ padding: '1.75rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 2px 8px rgba(15, 42, 74, 0.04)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.15rem auto' }}>
                <Zap size={22} />
              </div>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0F2A4A', margin: '0 0 0.4rem 0' }}>Faster Processing</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                Average clearance time cut from 60 days down to 15 business days.
              </p>
            </div>

            {/* Value 3 */}
            <div style={{ padding: '1.75rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 2px 8px rgba(15, 42, 74, 0.04)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.15rem auto' }}>
                <Layers size={22} />
              </div>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0F2A4A', margin: '0 0 0.4rem 0' }}>Centralized Documents</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                CAD blueprints, title deeds, and NOCs stored in a unified vault.
              </p>
            </div>

            {/* Value 4 */}
            <div style={{ padding: '1.75rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 2px 8px rgba(15, 42, 74, 0.04)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.15rem auto' }}>
                <Search size={22} />
              </div>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0F2A4A', margin: '0 0 0.4rem 0' }}>Real-Time Tracking</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                Instant public progress lookup showing exact stage clearance.
              </p>
            </div>

            {/* Value 5 */}
            <div style={{ padding: '1.75rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 2px 8px rgba(15, 42, 74, 0.04)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.15rem auto' }}>
                <Lock size={22} />
              </div>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0F2A4A', margin: '0 0 0.4rem 0' }}>Secure Access</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                Role-based access control with tamper-evident digital seals.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* ----------------- 8. FINAL CTA (Clean Light Accent) ----------------- */}
      <section style={{ 
        padding: '6rem 2rem', 
        textAlign: 'center',
        backgroundColor: '#FFFFFF',
        color: '#0F2A4A'
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F2A4A', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Ready to submit your building application?
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#64748B', lineHeight: 1.6, marginBottom: '2.25rem' }}>
            Submit your building approval application and track every stage digitally.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/apply')}
              style={{
                borderRadius: '12px',
                padding: '0.85rem 2.25rem',
                fontSize: '0.92rem',
                fontWeight: 600,
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              Apply Now
              <ArrowRight size={16} />
            </button>

            <button 
              onClick={() => {
                const trackElem = document.getElementById('track-preview');
                if (trackElem) trackElem.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                borderRadius: '12px',
                padding: '0.85rem 2rem',
                fontSize: '0.92rem',
                fontWeight: 600,
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#0F2A4A',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 6px rgba(15, 42, 74, 0.04)'
              }}
            >
              <Search size={16} />
              Track Application
            </button>
          </div>
        </div>
      </section>


      {/* ----------------- 9. MINIMAL PROFESSIONAL FOOTER ----------------- */}
      <footer id="contact" style={{ backgroundColor: '#0A1E36', color: '#94A3B8', padding: '4rem 2rem 2.5rem 2rem', borderTop: '1px solid #1E293B' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '3rem', paddingBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            
            {/* Column 1: Brand */}
            <div style={{ maxWidth: '320px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
                  <Building2 size={20} />
                </div>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>BuildPermit</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.6, margin: 0 }}>
                A digital governance and permission management platform for municipal building permits and inspection workflows.
              </p>
            </div>

            {/* Column 2: Navigation */}
            <div>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Navigation</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <a href="#hero" style={{ color: '#94A3B8', textDecoration: 'none' }}>Home</a>
                <a href="#how-it-works" style={{ color: '#94A3B8', textDecoration: 'none' }}>How It Works</a>
                <a href="#services" style={{ color: '#94A3B8', textDecoration: 'none' }}>Services</a>
                <a href="#track-preview" style={{ color: '#94A3B8', textDecoration: 'none' }}>Track Application</a>
              </div>
            </div>

            {/* Column 3: Contact & Support */}
            <div>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Helpdesk</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#94A3B8' }}>
                  <Phone size={14} color="#60A5FA" /> 1800-425-2026 (Toll-Free)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#94A3B8' }}>
                  <Mail size={14} color="#60A5FA" /> support@buildpermit.gov.in
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#94A3B8' }}>
                  <Clock size={14} color="#60A5FA" /> Mon – Sat: 9:30 AM – 6:00 PM
                </span>
              </div>
            </div>

            {/* Column 4: Department Access */}
            <div>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Official Portals</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <a href="/login" style={{ color: '#93C5FD', fontWeight: 600, textDecoration: 'none' }}>Admin Login →</a>
                <a href="/login" style={{ color: '#93C5FD', fontWeight: 600, textDecoration: 'none' }}>Field Worker Portal →</a>
                <a href="/apply" style={{ color: '#93C5FD', fontWeight: 600, textDecoration: 'none' }}>Citizen Online Filing →</a>
              </div>
            </div>

          </div>

          <div style={{ paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748B', flexWrap: 'wrap', gap: '1rem' }}>
            <span>© 2026 BuildPermit Building Approval Management System. All rights reserved.</span>
            <span>Government-Tech & Municipal Compliance Platform</span>
          </div>

        </div>
      </footer>

    </div>
  );
}

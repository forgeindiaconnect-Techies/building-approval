import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Search, 
  ArrowRight, 
  Play,
  Pause,
  MapPin, 
  UploadCloud, 
  FileText, 
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
  CheckCircle2,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  Sparkles,
  ShieldAlert,
  Leaf,
  User,
  ExternalLink,
  HelpCircle
} from 'lucide-react';

const approvalWorkflowSteps = [
  {
    step: 1,
    title: 'Customer & Property Registration',
    shortTitle: '1. Register Customer',
    badge: 'Customer Intake',
    badgeColor: '#2563EB',
    tagline: 'Fast & Secure Citizen & Builder Onboarding',
    description: 'Register the customer profile with verified contact details, Aadhaar/ID credentials, property survey number, and project details in under two minutes.',
    keyPoints: [
      'Quick registration with applicant identity verification',
      'Assigns unique permanent Building Application ID (BA-ID)',
      'Instant SMS and Email acknowledgment with real-time tracking link'
    ],
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=80',
    stat: '2 Mins',
    statLabel: 'Registration Time'
  },
  {
    step: 2,
    title: 'Customer Document Upload',
    shortTitle: '2. Upload Documents',
    badge: '100% Digital Upload',
    badgeColor: '#7C3AED',
    tagline: 'Seamless Cloud Upload for CAD Plans & Property Deeds',
    description: 'Customer securely uploads required documents including registered land title deeds, architectural CAD drawings (DWG/PDF), structural stability certificates, and tax receipts.',
    keyPoints: [
      'Drag-and-drop support for PDF deeds and CAD architectural plans',
      'Pre-flight document format and completeness check',
      'Encrypted cloud storage with automatic version control'
    ],
    image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1600&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1600&q=80',
    stat: '100%',
    statLabel: 'Paperless Upload'
  },
  {
    step: 3,
    title: 'Document & Plan Verification',
    shortTitle: '3. Verifying Documents',
    badge: 'Approve or Reject Scrutiny',
    badgeColor: '#2563EB',
    tagline: 'Technical Scrutiny, Bylaw Audit & Decision Workflow',
    description: 'Municipal engineers and verification officers audit uploaded title deeds and architectural CAD drawings. Using digital scrutiny tools, officers verify setback compliance and mark documents as Approved or Rejected with real-time feedback.',
    keyPoints: [
      'Instant decision workflow: One-click Approve or Reject with remarks',
      'Automated rule checking for Floor Area Ratio (FAR) and setbacks',
      'Instant customer SMS & Email alert on verification status'
    ],
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=85',
    fallbackImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=85',
    stat: '99.8%',
    statLabel: 'Verification Accuracy'
  },
  {
    step: 4,
    title: 'Site Visit & Field Inspection',
    shortTitle: '4. Site Visit Completed',
    badge: 'Field GPS Inspection',
    badgeColor: '#059669',
    tagline: 'On-Site Ground Verification & Geo-Tagged Inspection',
    description: 'Field inspection officers conduct the physical site visit, verify physical plot boundaries with GPS tracking, capture live geo-tagged photos, and submit the site visit completion report.',
    keyPoints: [
      'Inspector check-in with GPS geo-fencing verification',
      'High-resolution geo-tagged site photo capture and upload',
      'On-site verification of access road width, trees, and ground status'
    ],
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80',
    stat: '100%',
    statLabel: 'Geo-Tagged Visits'
  },
  {
    step: 5,
    title: 'Final Approval & Sanction Certificate',
    shortTitle: '5. Final Approval',
    badge: 'Official Sanction',
    badgeColor: '#10B981',
    tagline: 'Cryptographically Signed Sanction Order & QR Certificate',
    description: 'Competent authority grants final approval upon completion of verification and site visit. The official building permit and QR-coded digital approval certificate are instantly issued.',
    keyPoints: [
      'Digital signature by Municipal Commissioner / Authority',
      'Verifiable QR-coded official Building Sanction Certificate',
      'Instant download for applicant and instant update to government registry'
    ],
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1600&q=85',
    fallbackImage: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1600&q=85',
    stat: 'Instant',
    statLabel: 'Permit Issuance'
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { currentUser, applications = [] } = useApp();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');

  // 5-Step Workflow Carousel State
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-slide workflow steps every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveStepIndex(prev => (prev + 1) % approvalWorkflowSteps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Live Tracking Search State
  const [trackInput, setTrackInput] = useState('BA-2026-00125');
  const [trackedApp, setTrackedApp] = useState({
    id: 'BA-2026-00125',
    applicant: 'Ravi Kumar',
    buildingType: 'Residential (G+2)',
    location: 'Zone 4, Anna Nagar, Chennai',
    currentStage: 'Site Inspection',
    statusText: 'In Progress',
    stages: [
      { name: 'Application Submitted', date: '18 Sep 2026', status: 'completed' },
      { name: 'Documents Verified', date: '21 Sep 2026', status: 'completed' },
      { name: 'Site Inspection', date: 'In Progress', status: 'current' },
      { name: 'Final Approval', date: 'Estimated 27 Sep 2026', status: 'pending' },
    ]
  });

  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const sampleApps = {
    'BA-2026-00125': {
      id: 'BA-2026-00125',
      applicant: 'Ravi Kumar',
      buildingType: 'Residential (G+2)',
      location: 'Zone 4, Anna Nagar, Chennai',
      currentStage: 'Site Inspection',
      statusText: 'In Progress',
      stages: [
        { name: 'Application Submitted', date: '18 Sep 2026', status: 'completed' },
        { name: 'Documents Verified', date: '21 Sep 2026', status: 'completed' },
        { name: 'Site Inspection', date: 'In Progress', status: 'current' },
        { name: 'Final Approval', date: 'Estimated 27 Sep 2026', status: 'pending' },
      ]
    },
    'BA-2026-00142': {
      id: 'BA-2026-00142',
      applicant: 'Priya Sundaram',
      buildingType: 'Commercial Complex (G+4)',
      location: 'Zone 2, T. Nagar, Chennai',
      currentStage: 'Final Approval',
      statusText: 'Approved',
      stages: [
        { name: 'Application Submitted', date: '10 Sep 2026', status: 'completed' },
        { name: 'Documents Verified', date: '14 Sep 2026', status: 'completed' },
        { name: 'Site Inspection', date: '19 Sep 2026', status: 'completed' },
        { name: 'Final Approval', date: 'Approved & Issued', status: 'completed' },
      ]
    },
    'BA-2026-00088': {
      id: 'BA-2026-00088',
      applicant: 'Arun Varma Builders',
      buildingType: 'Residential Apartment (G+5)',
      location: 'Zone 7, Velachery, Chennai',
      currentStage: 'Documents Scrutiny',
      statusText: 'Under Review',
      stages: [
        { name: 'Application Submitted', date: '22 Sep 2026', status: 'completed' },
        { name: 'Documents Verified', date: 'In Review', status: 'current' },
        { name: 'Site Inspection', date: 'Pending Scrutiny', status: 'pending' },
        { name: 'Final Approval', date: 'Estimated 30 Sep 2026', status: 'pending' },
      ]
    }
  };

  const handleSelectSample = (sampleId) => {
    setTrackInput(sampleId);
    if (sampleApps[sampleId]) {
      setTrackedApp(sampleApps[sampleId]);
    }
  };

  const handleTrackSubmit = (e) => {
    if (e) e.preventDefault();
    const query = trackInput.trim().toUpperCase() || 'BA-2026-00125';
    if (sampleApps[query]) {
      setTrackedApp(sampleApps[query]);
      return;
    }
    const clean = query.replace(/^BA-/, '').replace(/^APP-/, '');
    const found = applications.find(a => 
      a && a.id && (
        a.id.toUpperCase() === query || 
        a.id.toUpperCase().replace(/^APP-/, '').replace(/^BA-/, '') === clean ||
        (a.applicantName && a.applicantName.toUpperCase().includes(query))
      )
    );

    if (found) {
      setTrackedApp({
        id: found.id || query,
        applicant: found.applicantName || 'Applicant',
        buildingType: `${found.buildingType || 'Residential'} (${found.buildingDetails?.noOfFloors || 'G+2'})`,
        location: found.location || found.address || 'Chennai District',
        currentStage: found.status === 'approved' ? 'Final Approval' : found.status === 'documents_verified' ? 'Site Inspection' : 'Documents Scrutiny',
        statusText: found.status === 'approved' ? 'Approved' : 'In Progress',
        stages: [
          { name: 'Application Submitted', date: '18 Sep 2026', status: 'completed' },
          { name: 'Documents Verified', date: '21 Sep 2026', status: found.status !== 'pending' ? 'completed' : 'current' },
          { name: 'Site Inspection', date: found.status === 'documents_verified' ? 'In Progress' : 'Pending', status: found.status === 'documents_verified' ? 'current' : found.status === 'approved' ? 'completed' : 'pending' },
          { name: 'Final Approval', date: found.status === 'approved' ? 'Approved' : 'Estimated 27 Sep 2026', status: found.status === 'approved' ? 'completed' : 'pending' },
        ]
      });
    } else {
      setTrackedApp({
        id: query,
        applicant: 'Ravi Kumar',
        buildingType: 'Residential (G+2)',
        location: 'Zone 4, Anna Nagar, Chennai',
        currentStage: 'Site Inspection',
        statusText: 'In Progress',
        stages: [
          { name: 'Application Submitted', date: '18 Sep 2026', status: 'completed' },
          { name: 'Documents Verified', date: '21 Sep 2026', status: 'completed' },
          { name: 'Site Inspection', date: 'In Progress', status: 'current' },
          { name: 'Final Approval', date: 'Estimated 27 Sep 2026', status: 'pending' },
        ]
      });
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0F172A', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* ----------------- 1. PREMIUM MODERN HERO HEADER SECTION ----------------- */}
      <section id="hero" className="hero-section" style={{ 
        position: 'relative', 
        width: '100%', 
        minHeight: '740px',
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        backgroundImage: `linear-gradient(to right, rgba(7, 18, 36, 0.94) 0%, rgba(8, 22, 44, 0.85) 45%, rgba(10, 28, 54, 0.35) 75%, rgba(7, 18, 36, 0.65) 100%), url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2600&q=85')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 38%',
        backgroundRepeat: 'no-repeat',
        color: '#FFFFFF'
      }}>

        {/* --- FLOATING TRANSPARENT PREMIUM NAVBAR --- */}
        <header className="hero-header" style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 100, 
          width: '100%', 
          padding: '1.1rem 2.5rem',
          backgroundColor: 'rgba(7, 18, 36, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 25px rgba(0, 0, 0, 0.25)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            
            {/* Logo + Subtitle on the Left */}
            <div 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer', flexShrink: 0 }}
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
                boxShadow: '0 0 16px rgba(37, 99, 235, 0.55)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                flexShrink: 0
              }}>
                <Building2 size={20} />
              </div>
              <div>
                <span className="brand-title" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.1 }}>
                  BuildApprove
                </span>
                <span className="brand-subtitle" style={{ fontSize: '0.72rem', fontWeight: 500, color: '#94A3B8', letterSpacing: '0.02em' }}>
                  Building Approval Platform
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '2.25rem' }}>
              {[
                { id: 'home', label: 'Home', href: '#hero' },
                { id: 'how-it-works', label: 'How It Works', href: '#how-it-works' },
                { id: 'services', label: 'Services', href: '#why-us' },
                { id: 'documents', label: 'Documents', href: '#track-section' },
                { id: 'contact', label: 'Contact', href: '#contact' }
              ].map(item => {
                const isActive = activeNav === item.id;
                return (
                  <a 
                    key={item.id}
                    href={item.href} 
                    onClick={() => setActiveNav(item.id)}
                    style={{ 
                      textDecoration: 'none', 
                      color: isActive ? '#60A5FA' : '#E2E8F0', 
                      fontWeight: isActive ? 700 : 500, 
                      fontSize: '0.92rem', 
                      position: 'relative',
                      padding: '0.35rem 0',
                      transition: 'color 0.2s ease, transform 0.2s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'}
                    onMouseLeave={e => e.currentTarget.style.color = isActive ? '#60A5FA' : '#E2E8F0'}
                  >
                    {item.label}
                    {isActive && (
                      <span style={{
                        position: 'absolute',
                        bottom: '-4px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '20px',
                        height: '2.5px',
                        backgroundColor: '#3B82F6',
                        borderRadius: '4px',
                        boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)'
                      }} />
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Right Action Buttons */}
            <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <button 
                className="header-btn-login"
                onClick={() => navigate('/login')}
                style={{ 
                  borderRadius: '9999px', 
                  padding: '0.55rem 1.4rem', 
                  fontWeight: 600, 
                  fontSize: '0.88rem', 
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Login
              </button>

              <button 
                className="header-btn-start"
                onClick={() => navigate('/apply')}
                style={{
                  borderRadius: '9999px',
                  padding: '0.62rem 1.6rem',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  backgroundColor: '#2563EB',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(37, 99, 235, 0.55)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#1D4ED8';
                  e.currentTarget.style.boxShadow = '0 6px 25px rgba(37, 99, 235, 0.75)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#2563EB';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(37, 99, 235, 0.55)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Get Started
              </button>

              {/* Mobile Hamburger Toggle Button */}
              <button
                className="mobile-nav-toggle"
                onClick={() => setMobileNavOpen(prev => !prev)}
                aria-label="Toggle Menu"
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  marginLeft: '0.25rem'
                }}
              >
                {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileNavOpen && (
            <div style={{
              marginTop: '0.75rem',
              padding: '1.25rem',
              backgroundColor: '#071224',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <a href="#hero" onClick={() => setMobileNavOpen(false)} style={{ textDecoration: 'none', color: '#FFFFFF', fontWeight: 600, padding: '0.4rem 0' }}>Home</a>
              <a href="#how-it-works" onClick={() => setMobileNavOpen(false)} style={{ textDecoration: 'none', color: '#CBD5E1', fontWeight: 500, padding: '0.4rem 0' }}>How It Works</a>
              <a href="#why-us" onClick={() => setMobileNavOpen(false)} style={{ textDecoration: 'none', color: '#CBD5E1', fontWeight: 500, padding: '0.4rem 0' }}>Services</a>
              <a href="#track-section" onClick={() => setMobileNavOpen(false)} style={{ textDecoration: 'none', color: '#CBD5E1', fontWeight: 500, padding: '0.4rem 0' }}>Documents</a>
              <a href="#contact" onClick={() => setMobileNavOpen(false)} style={{ textDecoration: 'none', color: '#CBD5E1', fontWeight: 500, padding: '0.4rem 0' }}>Contact</a>
              <button 
                onClick={() => { setMobileNavOpen(false); navigate('/apply'); }}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Get Started →
              </button>
            </div>
          )}
        </header>

        {/* --- MAIN HERO CONTENT & FLOATING INFORMATION STATUS CARD --- */}
        <div className="hero-content-wrapper" style={{ 
          maxWidth: '1280px', 
          width: '100%', 
          margin: '0 auto', 
          padding: '4rem 2.5rem 3rem 2.5rem', 
          position: 'relative', 
          zIndex: 10, 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2.5rem',
          flexWrap: 'wrap'
        }}>
          
          {/* Centered-Left Hero Content Area with Subtle Backdrop Blur */}
          <div className="hero-text-card" style={{ 
            maxWidth: '680px',
            backgroundColor: 'rgba(7, 18, 36, 0.45)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: '24px',
            padding: '2.5rem 2rem 2.5rem 0',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)'
          }}>
            
            {/* Small Badge */}
            <div className="hero-badge" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              fontSize: '0.78rem',
              fontWeight: 800,
              color: '#93C5FD',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '1.4rem',
              backgroundColor: 'rgba(37, 99, 235, 0.25)',
              padding: '0.45rem 1.2rem',
              borderRadius: '9999px',
              border: '1px solid rgba(96, 165, 250, 0.45)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 15px rgba(37, 99, 235, 0.2)'
            }}>
              <Sparkles size={14} color="#60A5FA" /> SMART BUILDING APPROVAL PLATFORM
            </div>

            {/* Main Heading */}
            <h1 className="hero-title" style={{
              fontSize: '3.8rem',
              fontWeight: 900,
              color: '#FFFFFF',
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              marginBottom: '1.35rem',
              textShadow: '0 4px 25px rgba(0, 0, 0, 0.6)'
            }}>
              Build With Confidence. <br />
              Get <span style={{ 
                background: 'linear-gradient(135deg, #60A5FA 0%, #38BDF8 50%, #93C5FD 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 14px rgba(59, 130, 246, 0.45))'
              }}>
                Approved Faster.
              </span>
            </h1>

            {/* Description */}
            <p className="hero-desc" style={{
              fontSize: '1.15rem',
              color: '#E2E8F0',
              lineHeight: 1.65,
              marginBottom: '2.25rem',
              fontWeight: 400,
              maxWidth: '580px',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
            }}>
              Streamline building approval, document submission, verification and application tracking — all from one simple platform.
            </p>

            {/* Action Buttons */}
            <div className="hero-cta-group" style={{ display: 'flex', alignItems: 'center', gap: '1.15rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
              <button 
                className="hero-btn-primary"
                onClick={() => navigate('/apply')}
                style={{
                  padding: '0.95rem 2.4rem',
                  borderRadius: '9999px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  cursor: 'pointer',
                  boxShadow: '0 6px 25px rgba(37, 99, 235, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#1D4ED8';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(37, 99, 235, 0.8)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#2563EB';
                  e.currentTarget.style.boxShadow = '0 6px 25px rgba(37, 99, 235, 0.6)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Start Your Application
                <ArrowRight size={18} />
              </button>

              <a 
                className="hero-btn-secondary"
                href="#how-it-works"
                style={{
                  padding: '0.95rem 2.1rem',
                  borderRadius: '9999px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.22)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Play size={16} fill="#FFFFFF" />
                Explore How It Works
              </a>
            </div>

            {/* Small Trust Line */}
            <div className="hero-trust-line" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94A3B8', fontSize: '0.88rem', fontWeight: 600, letterSpacing: '0.04em' }}>
              Simple • Secure • Transparent • Trackable
            </div>

          </div>

          {/* Floating Glassmorphism Information Card near Bottom-Right */}
          <div className="hero-status-card" style={{ 
            minWidth: '320px',
            backgroundColor: 'rgba(7, 20, 42, 0.78)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            padding: '1.8rem',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.12)', paddingBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                Application Status
              </div>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: '#10B981',
                boxShadow: '0 0 10px #10B981'
              }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#E2E8F0', fontSize: '0.9rem', fontWeight: 600 }}>
                <span style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(16, 185, 129, 0.2)', 
                  border: '1px solid #10B981',
                  color: '#34D399', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  flexShrink: 0
                }}>✓</span>
                <span>Documents Verified</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#E2E8F0', fontSize: '0.9rem', fontWeight: 600 }}>
                <span style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(16, 185, 129, 0.2)', 
                  border: '1px solid #10B981',
                  color: '#34D399', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  flexShrink: 0
                }}>✓</span>
                <span>Application Submitted</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#60A5FA', fontSize: '0.9rem', fontWeight: 700 }}>
                <span style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(37, 99, 235, 0.25)', 
                  border: '1px solid #3B82F6',
                  color: '#60A5FA', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  flexShrink: 0
                }}>→</span>
                <span>Approval In Progress</span>
              </div>
            </div>
          </div>

        </div>

      </section>


      {/* ----------------- 2. INTERACTIVE 5-STEP VISUAL WORKFLOW & IMAGE SCROLLING SHOWCASE ----------------- */}
      <section id="how-it-works" className="section-pad" style={{ 
        backgroundColor: '#F8FAFC', 
        color: '#0F2A4A',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid #E2E8F0'
      }}>

        {/* Ambient subtle background lighting */}
        <div style={{
          position: 'absolute',
          top: '-150px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              fontSize: '0.8rem', 
              fontWeight: 800, 
              color: '#2563EB', 
              textTransform: 'uppercase', 
              letterSpacing: '0.14em',
              marginBottom: '0.85rem',
              backgroundColor: '#EFF6FF',
              padding: '0.4rem 1.1rem',
              borderRadius: '9999px',
              border: '1px solid #BFDBFE'
            }}>
              <Sparkles size={14} />
              5-STEP APPROVAL PIPELINE
            </div>
            
            <h2 className="section-title" style={{ 
              fontWeight: 800, 
              color: '#0F2A4A', 
              margin: '0.25rem 0 1rem 0', 
              letterSpacing: '-0.025em' 
            }}>
              How BuildFlow Simplifies & Accelerates Approvals
            </h2>
            
            <p style={{ 
              fontSize: '1.05rem', 
              color: '#64748B', 
              maxWidth: '720px', 
              margin: '0 auto', 
              lineHeight: 1.6 
            }}>
              A transparent, 100% digital journey from customer registration and document upload to technical verification, site visit inspection, and final approval.
            </p>
          </div>

          {/* Interactive Stepper Navigation Tabs */}
          <div className="workflow-tabs-container">
            {approvalWorkflowSteps.map((stepItem, index) => {
              const isActive = activeStepIndex === index;
              return (
                <button
                  key={stepItem.step}
                  className="workflow-tab-btn"
                  onClick={() => {
                    setActiveStepIndex(index);
                    setIsAutoPlaying(false);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: isActive ? '#2563EB' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#475569',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.25s ease',
                    boxShadow: isActive ? '0 4px 14px rgba(37, 99, 235, 0.35)' : 'none'
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#F1F5F9';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: isActive ? '#BFDBFE' : '#94A3B8',
                    marginBottom: '0.2rem'
                  }}>
                    Step 0{stepItem.step}
                  </div>
                  <div style={{
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%',
                    color: isActive ? '#FFFFFF' : '#0F2A4A'
                  }}>
                    {stepItem.shortTitle}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Active Step Showcase Card (2-Column Split / Stack on Mobile) */}
          {(() => {
            const current = approvalWorkflowSteps[activeStepIndex];
            return (
              <div className="workflow-card-grid">

                {/* Left Side: Step Details & Value Proposition */}
                <div>
                  
                  {/* Step Category Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <span style={{
                      backgroundColor: current.badgeColor,
                      color: '#FFFFFF',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '0.35rem 0.9rem',
                      borderRadius: '9999px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      boxShadow: `0 4px 12px ${current.badgeColor}40`
                    }}>
                      {current.badge}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
                      Step {current.step} of 5
                    </span>
                  </div>

                  {/* Main Step Headline */}
                  <h3 style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: '#0F2A4A',
                    lineHeight: 1.2,
                    marginBottom: '0.75rem',
                    letterSpacing: '-0.02em'
                  }}>
                    {current.title}
                  </h3>

                  {/* Tagline Subtext */}
                  <div style={{
                    fontSize: '0.98rem',
                    color: '#2563EB',
                    fontWeight: 600,
                    marginBottom: '1.25rem'
                  }}>
                    {current.tagline}
                  </div>

                  {/* Description */}
                  <p style={{
                    fontSize: '0.95rem',
                    color: '#475569',
                    lineHeight: 1.7,
                    marginBottom: '1.75rem'
                  }}>
                    {current.description}
                  </p>

                  {/* Key Feature Checkpoints */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.25rem' }}>
                    {current.keyPoints.map((point, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          color: '#2563EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          flexShrink: 0
                        }}>
                          ✓
                        </div>
                        <span style={{ fontSize: '0.88rem', color: '#334155', fontWeight: 500 }}>
                          {point}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Metric Highlight & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      padding: '0.6rem 1.25rem',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0'
                    }}>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#2563EB' }}>
                        {current.stat}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                        {current.statLabel}
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate('/apply')}
                      style={{
                        padding: '0.75rem 1.65rem',
                        borderRadius: '9999px',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        backgroundColor: '#2563EB',
                        color: '#FFFFFF',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                        transition: 'transform 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      Start Application
                      <ArrowRight size={16} />
                    </button>
                  </div>

                </div>

                {/* Right Side: High-Impact Visual Image Display with Overlaid Badges & Controls */}
                <div style={{ position: 'relative' }}>
                  
                  {/* Image Container with Frame */}
                  <div className="workflow-image-frame">
                    <img 
                      src={current.image}
                      alt={current.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.5s ease'
                      }}
                      onError={(e) => {
                        e.currentTarget.src = current.fallbackImage;
                      }}
                    />

                    {/* Gradient Overlay for badge contrast */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, transparent 40%, rgba(15, 23, 42, 0.7) 100%)'
                    }} />

                    {/* Overlaid Glowing APPROVE & REJECT Decision Hologram for Step 3 */}
                    {current.step === 3 && (
                      <div style={{
                        position: 'absolute',
                        top: '48%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        borderRadius: '16px',
                        padding: '1.1rem 1.4rem',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6), 0 0 25px rgba(37, 99, 235, 0.35)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.85rem',
                        zIndex: 4
                      }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#93C5FD', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                          ● SCRUTINY DECISION ENGINE
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div style={{
                            padding: '0.55rem 1.35rem',
                            borderRadius: '10px',
                            backgroundColor: '#10B981',
                            color: '#FFFFFF',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            boxShadow: '0 0 18px rgba(16, 185, 129, 0.55)',
                            cursor: 'pointer'
                          }}>
                            ✓ APPROVE
                          </div>
                          <div style={{
                            padding: '0.55rem 1.35rem',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(239, 68, 68, 0.22)',
                            border: '1px solid #EF4444',
                            color: '#FCA5A5',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            cursor: 'pointer'
                          }}>
                            ✕ REJECT
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Overlaid Certificate Issued Badge for Step 5 */}
                    {current.step === 5 && (
                      <div style={{
                        position: 'absolute',
                        top: '48%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'rgba(15, 23, 42, 0.92)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        borderRadius: '16px',
                        padding: '1.1rem 1.4rem',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6), 0 0 25px rgba(16, 185, 129, 0.35)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.6rem',
                        zIndex: 4,
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#34D399', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                          ● OFFICIAL SANCTION ORDER
                        </div>
                        <div style={{
                          padding: '0.55rem 1.35rem',
                          borderRadius: '10px',
                          backgroundColor: '#10B981',
                          color: '#FFFFFF',
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          boxShadow: '0 0 18px rgba(16, 185, 129, 0.55)'
                        }}>
                          🏆 CERTIFICATE ISSUED
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#E2E8F0', fontWeight: 600 }}>
                          QR Code & Digital Signature Verified
                        </div>
                      </div>
                    )}

                    {/* Floating Top-Left Status Tag */}
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      left: '1rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.82)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      borderRadius: '10px',
                      padding: '0.45rem 0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      color: '#FFFFFF',
                      fontSize: '0.78rem',
                      fontWeight: 700
                    }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: current.badgeColor, boxShadow: `0 0 8px ${current.badgeColor}` }} />
                      {current.badge} Active
                    </div>

                    {/* Bottom Image Caption Bar */}
                    <div style={{
                      position: 'absolute',
                      bottom: '1rem',
                      left: '1rem',
                      right: '1rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(14px)',
                      borderRadius: '12px',
                      padding: '0.65rem 1rem',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#FFFFFF' }}>
                        {current.title}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38BDF8' }}>
                        Live Workflow
                      </span>
                    </div>

                  </div>

                  {/* Carousel Controls (Previous / Play-Pause / Next) */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '1.25rem'
                  }}>
                    
                    {/* Step Dots Indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {approvalWorkflowSteps.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setActiveStepIndex(i);
                            setIsAutoPlaying(false);
                          }}
                          style={{
                            width: activeStepIndex === i ? '28px' : '8px',
                            height: '8px',
                            borderRadius: '9999px',
                            backgroundColor: activeStepIndex === i ? '#2563EB' : '#CBD5E1',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            padding: 0
                          }}
                          aria-label={`Go to step ${i + 1}`}
                        />
                      ))}
                    </div>

                    {/* Interactive Arrow Buttons & Autoplay Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      
                      <button
                        onClick={() => setIsAutoPlaying(prev => !prev)}
                        style={{
                          backgroundColor: '#F1F5F9',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          width: '34px',
                          height: '34px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#0F2A4A',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                        title={isAutoPlaying ? 'Pause Auto-Play' : 'Resume Auto-Play'}
                      >
                        {isAutoPlaying ? <Pause size={14} /> : <Play size={14} fill="#0F2A4A" />}
                      </button>

                      <button
                        onClick={() => {
                          setActiveStepIndex(prev => (prev - 1 + approvalWorkflowSteps.length) % approvalWorkflowSteps.length);
                          setIsAutoPlaying(false);
                        }}
                        style={{
                          backgroundColor: '#F1F5F9',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          width: '34px',
                          height: '34px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#0F2A4A',
                          cursor: 'pointer'
                        }}
                        aria-label="Previous Step"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      <button
                        onClick={() => {
                          setActiveStepIndex(prev => (prev + 1) % approvalWorkflowSteps.length);
                          setIsAutoPlaying(false);
                        }}
                        style={{
                          backgroundColor: '#2563EB',
                          border: 'none',
                          borderRadius: '8px',
                          width: '34px',
                          height: '34px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          cursor: 'pointer'
                        }}
                        aria-label="Next Step"
                      >
                        <ChevronRight size={16} />
                      </button>

                    </div>

                  </div>

                </div>

              </div>
            );
          })()}

          {/* Interactive 5-Thumbnail Image Scrolling Bar */}
          <div style={{ marginTop: '2.5rem' }}>
            <div className="workflow-thumbs-grid">
              {approvalWorkflowSteps.map((step, idx) => {
                const isActive = activeStepIndex === idx;
                return (
                  <div
                    key={step.step}
                    className="workflow-thumb-item"
                    onClick={() => {
                      setActiveStepIndex(idx);
                      setIsAutoPlaying(false);
                    }}
                    style={{
                      borderRadius: '14px',
                      overflow: 'hidden',
                      position: 'relative',
                      height: '90px',
                      cursor: 'pointer',
                      border: isActive ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      boxShadow: isActive ? '0 0 14px rgba(37, 99, 235, 0.3)' : 'none',
                      transform: isActive ? 'translateY(-4px)' : 'none',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    <img 
                      src={step.image} 
                      alt={step.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                      onError={(e) => {
                        e.currentTarget.src = step.fallbackImage;
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: isActive ? 'rgba(37, 99, 235, 0.3)' : 'rgba(15, 23, 42, 0.55)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '0.5rem',
                      transition: 'background 0.2s'
                    }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#BFDBFE' }}>
                        Step {step.step}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {step.shortTitle}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>



      {/* ----------------- 3. "WHY BUILDFLOW" BANNER CARD SECTION (MATCHING MOCKUP) ----------------- */}
      <section id="why-us" className="section-pad" style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          
          {/* Large Architectural Desk Banner Card (Clean White 2-Column Card) */}
          <div className="why-us-grid">
            
            {/* Left Content Column */}
            <div>
              
              <span style={{ 
                fontSize: '0.78rem', 
                fontWeight: 800, 
                color: '#2563EB', 
                textTransform: 'uppercase', 
                letterSpacing: '0.12em', 
                display: 'block', 
                marginBottom: '0.75rem' 
              }}>
                WHY BUILDFLOW
              </span>

              <h2 style={{ 
                fontSize: '2.5rem', 
                fontWeight: 800, 
                color: '#0F2A4A', 
                lineHeight: 1.15, 
                letterSpacing: '-0.02em', 
                marginBottom: '1rem' 
              }}>
                Faster Approvals. <br />
                Stronger Communities.
              </h2>

              <p style={{ 
                fontSize: '0.95rem', 
                color: '#64748B', 
                lineHeight: 1.65, 
                marginBottom: '2.5rem' 
              }}>
                Built for a smarter, faster and more transparent building approval process. Save time, reduce paperwork and keep everything in one place.
              </p>

              {/* 3 Value Pillars */}
              <div className="why-us-pillars">
                
                {/* Pillar 1 */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2563EB', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                    <ShieldCheck size={18} /> More Transparent
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Real-time tracking</div>
                </div>

                {/* Pillar 2 */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2563EB', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                    <Users size={18} /> Better Collaboration
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>All in one place</div>
                </div>

                {/* Pillar 3 */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2563EB', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                    <Leaf size={18} /> Sustainable Future
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Smarter cities</div>
                </div>

              </div>

            </div>

            {/* Right Blueprint Hardhat Desk Image Column */}
            <div style={{ position: 'relative', width: '100%', height: '320px', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}>
              <img 
                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80" 
                alt="Architectural Blueprint Desk" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>

          </div>

        </div>
      </section>


      {/* ----------------- 4. "TRACK EVERY APPROVAL. STAY IN CONTROL." SECTION (USER FRIENDLY 2-COL) ----------------- */}
      <section id="track-section" className="section-pad" style={{ 
        position: 'relative', 
        backgroundColor: '#FFFFFF', 
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          
          {/* 2-Column Balanced Header & Trust Indicators */}
          <div className="track-header-grid">
            
            {/* Left: Headline, Search & Demo Pills */}
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#2563EB',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '0.85rem',
                backgroundColor: '#EFF6FF',
                padding: '0.35rem 0.9rem',
                borderRadius: '9999px',
                border: '1px solid #BFDBFE'
              }}>
                <Sparkles size={14} /> LIVE MILESTONE TRACKER
              </div>

              <h2 style={{ 
                fontSize: '2.85rem', 
                fontWeight: 800, 
                color: '#0F2A4A', 
                lineHeight: 1.15, 
                letterSpacing: '-0.025em', 
                margin: 0 
              }}>
                Track Every Approval. <br />
                <span style={{ color: '#2563EB' }}>Stay in Control.</span>
              </h2>

              <p style={{ 
                fontSize: '0.98rem', 
                color: '#64748B', 
                lineHeight: 1.65, 
                marginTop: '1rem', 
                marginBottom: '1.75rem' 
              }}>
                Enter your application number to inspect live technical scrutiny, ground GPS inspection reports, and official clearance sanction orders.
              </p>

              {/* Pill Search Input Bar */}
              <form onSubmit={handleTrackSubmit} className="track-search-form" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                backgroundColor: '#FFFFFF', 
                borderRadius: '9999px', 
                border: '1.5px solid #CBD5E1', 
                padding: '0.35rem 0.35rem 0.35rem 1.4rem', 
                maxWidth: '560px', 
                boxShadow: '0 6px 20px rgba(15, 42, 74, 0.05)', 
                position: 'relative' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, width: '100%' }}>
                  <FileText size={18} color="#64748B" style={{ marginRight: '0.75rem', flexShrink: 0 }} />
                  <input 
                    type="text" 
                    value={trackInput}
                    onChange={(e) => setTrackInput(e.target.value)}
                    placeholder="Enter application number (e.g. BA-2026-00125)"
                    style={{ 
                      flex: 1, 
                      width: '100%',
                      border: 'none', 
                      outline: 'none', 
                      fontSize: '0.92rem', 
                      color: '#0F2A4A', 
                      backgroundColor: 'transparent' 
                    }}
                  />
                </div>
                <button 
                  type="submit"
                  className="track-search-btn"
                  style={{ 
                    borderRadius: '9999px', 
                    padding: '0.72rem 1.65rem', 
                    backgroundColor: '#2563EB', 
                    color: '#FFFFFF', 
                    border: 'none', 
                    fontWeight: 600, 
                    fontSize: '0.88rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    cursor: 'pointer', 
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)', 
                    transition: 'all 0.2s ease' 
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1D4ED8'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2563EB'}
                >
                  <Search size={15} />
                  Track
                </button>
              </form>

              {/* Quick Sample Click Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>Try Demo IDs:</span>
                {Object.keys(sampleApps).map(id => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSelectSample(id)}
                    style={{
                      padding: '0.28rem 0.75rem',
                      borderRadius: '9999px',
                      border: trackInput === id ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                      backgroundColor: trackInput === id ? '#EFF6FF' : '#F8FAFC',
                      color: trackInput === id ? '#1D4ED8' : '#64748B',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    #{id}
                  </button>
                ))}
              </div>

            </div>

            {/* Right: 3 Quick Service Trust Cards */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '20px',
              padding: '2rem',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', flexShrink: 0 }}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F2A4A', margin: '0 0 0.2rem 0' }}>Bylaw & FAR Scrutiny</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>Automated technical audit checking setbacks, height limits, and floor area ratios.</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', flexShrink: 0 }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F2A4A', margin: '0 0 0.2rem 0' }}>GPS Geo-Tagged Inspections</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>On-site ground verification with live photo uploads and digital coordinate validation.</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FAF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED', flexShrink: 0 }}>
                  <FileCheck2 size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F2A4A', margin: '0 0 0.2rem 0' }}>Instant Digital Sanction</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>QR-coded digitally signed approval order generated as soon as final clearance is granted.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Floating White Status Card */}
          <div className="track-status-card">
            
            {/* Top 3-Column Info Header */}
            <div className="track-info-header">
              
              {/* Col 1: Application ID */}
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  APPLICATION ID
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.3rem' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F2A4A', margin: 0 }}>
                    #{trackedApp.id}
                  </h3>
                  <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.3rem', 
                    fontSize: '0.72rem', 
                    fontWeight: 700, 
                    backgroundColor: trackedApp.statusText === 'Approved' ? '#DCFCE7' : '#FEF3C7', 
                    color: trackedApp.statusText === 'Approved' ? '#15803D' : '#B45309', 
                    padding: '0.22rem 0.7rem', 
                    borderRadius: '9999px' 
                  }}>
                    • {trackedApp.statusText}
                  </span>
                </div>
              </div>

              {/* Col 2: Applicant */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  backgroundColor: '#EFF6FF', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#2563EB',
                  flexShrink: 0
                }}>
                  <User size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    APPLICANT
                  </span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F2A4A', marginTop: '0.15rem' }}>
                    {trackedApp.applicant}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    {trackedApp.buildingType}
                  </div>
                </div>
              </div>

              {/* Col 3: Location */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  backgroundColor: '#EFF6FF', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#2563EB',
                  flexShrink: 0
                }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    LOCATION
                  </span>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0F2A4A', marginTop: '0.15rem' }}>
                    {trackedApp.location}
                  </div>
                </div>
              </div>

            </div>

            {/* Middle Stepper Pipeline */}
            <div style={{ position: 'relative', marginTop: '2.25rem', padding: '0.5rem 0' }}>
              
              {/* Background Connecting Line Bar */}
              <div className="track-timeline-line" style={{
                position: 'absolute',
                top: '20px',
                left: '12%',
                right: '12%',
                height: '3px',
                backgroundColor: '#E2E8F0',
                zIndex: 1
              }}>
                {/* Active Colored Progress Bar Segment */}
                <div style={{
                  width: trackedApp.statusText === 'Approved' ? '100%' : '66%',
                  height: '100%',
                  background: 'linear-gradient(to right, #16A34A 0%, #16A34A 50%, #2563EB 100%)',
                  transition: 'width 0.4s ease'
                }} />
              </div>

              {/* 4 Stepper Nodes */}
              <div className="track-timeline-grid">
                
                {trackedApp.stages.map((stage, idx) => {
                  const isDone = stage.status === 'completed';
                  const isCurrent = stage.status === 'current';

                  return (
                    <div key={idx} style={{ textAlign: 'center', padding: '0 0.25rem' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: isDone ? '#16A34A' : isCurrent ? '#2563EB' : '#F8FAFC',
                        color: isDone || isCurrent ? '#FFFFFF' : '#94A3B8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 0.75rem auto',
                        boxShadow: isDone ? '0 4px 10px rgba(22, 163, 74, 0.25)' : isCurrent ? '0 4px 14px rgba(37, 99, 235, 0.35)' : 'none',
                        border: isCurrent ? '3px solid #BFDBFE' : !isDone ? '2px solid #CBD5E1' : 'none'
                      }}>
                        {isDone ? <Check size={18} strokeWidth={3} /> : isCurrent ? <Building2 size={18} /> : <Clock size={18} />}
                      </div>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: isCurrent ? '#2563EB' : isDone ? '#0F2A4A' : '#94A3B8', margin: '0 0 0.2rem 0' }}>
                        {stage.name}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: isCurrent ? '#2563EB' : '#64748B', fontWeight: isCurrent ? 600 : 400 }}>
                        {stage.date}
                      </span>
                    </div>
                  );
                })}

              </div>

            </div>

            {/* Bottom Status Strip Bar */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              padding: '0.85rem 1.4rem',
              marginTop: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid #E2E8F0',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563EB'
                }}>
                  <FileText size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>
                    Current Stage
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#2563EB' }}>
                    {trackedApp.currentStage}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/track-status?id=${encodeURIComponent(trackedApp.id)}`)}
                style={{
                  borderRadius: '9999px',
                  border: '1px solid #BFDBFE',
                  backgroundColor: '#FFFFFF',
                  color: '#1D4ED8',
                  padding: '0.45rem 1.25rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.08)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                  e.currentTarget.style.borderColor = '#93C5FD';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#BFDBFE';
                }}
              >
                <ExternalLink size={13} />
                View full application details &gt;
              </button>

            </div>

          </div>

        </div>
      </section>


      {/* ----------------- 5. FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION) ----------------- */}
      <section style={{ padding: '5.5rem 2.5rem', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.5rem' }}>
              HELP & FAQS
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F2A4A', letterSpacing: '-0.02em', margin: 0 }}>
              Frequently Asked Questions
            </h2>
            <p style={{ fontSize: '0.98rem', color: '#64748B', marginTop: '0.65rem' }}>
              Everything you need to know about the building permission approval pipeline.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              {
                q: 'What documents are required to apply for building approval?',
                a: 'You will need: Registered Land Title Deed, Certified Architectural CAD/PDF Plans, Structural Stability Certificate, Soil Test Report, and Municipal Property Tax Receipts.'
              },
              {
                q: 'How long does the complete approval process take?',
                a: 'Standard residential proposals (G+2) are audited and cleared within 7 to 10 business days upon completing digital document upload and physical site inspection.'
              },
              {
                q: 'How do I download my approved Sanction Plan Certificate?',
                a: 'Once your application reaches the Final Approval milestone, you can instantly download your QR-coded, digitally signed Sanction Order directly from your tracking status page.'
              },
              {
                q: 'What happens if an objection is raised during document scrutiny?',
                a: 'You will immediately receive an SMS & Email notification outlining the officer remarks. You can re-upload corrected drawings or missing deeds without paying new filing fees.'
              }
            ].map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: isOpen ? '1.5px solid #BFDBFE' : '1px solid #E2E8F0',
                    overflow: 'hidden',
                    boxShadow: isOpen ? '0 8px 25px rgba(37, 99, 235, 0.08)' : '0 2px 6px rgba(15, 42, 74, 0.03)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    style={{
                      width: '100%',
                      padding: '1.25rem 1.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: isOpen ? '#2563EB' : '#0F2A4A' }}>
                      {faq.q}
                    </span>
                    <ChevronDown 
                      size={18} 
                      color={isOpen ? '#2563EB' : '#64748B'} 
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0, marginLeft: '1rem' }} 
                    />
                  </button>

                  {isOpen && (
                    <div style={{ padding: '0 1.75rem 1.5rem 1.75rem', fontSize: '0.92rem', color: '#475569', lineHeight: 1.65, borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>


      {/* ----------------- 6. FINAL CTA (Clean Light Accent) ----------------- */}
      <section style={{ 
        padding: '6rem 2rem', 
        textAlign: 'center',
        backgroundColor: '#FFFFFF',
        color: '#0F2A4A',
        borderBottom: '1px solid #E2E8F0'
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
              onClick={() => navigate('/track-status')}
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


      {/* ----------------- 5. MINIMAL PROFESSIONAL FOOTER ----------------- */}
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
                <a href="#why-us" style={{ color: '#94A3B8', textDecoration: 'none' }}>Why BuildFlow</a>
                <a href="#track-section" style={{ color: '#94A3B8', textDecoration: 'none' }}>Track Application</a>
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

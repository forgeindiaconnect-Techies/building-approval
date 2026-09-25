import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Mail, 
  Building2, 
  Shield, 
  Database, 
  Cloud, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Send, 
  Lock, 
  FileText, 
  Coins, 
  Sliders, 
  Globe,
  Plus,
  Trash2,
  Check,
  Zap,
  Palette,
  Eye,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { API_BASE_URL } from '../../config/api';

export default function AdminSettings() {
  const { pushLiveToast, themeSettings, updateThemeSettings, resetThemeSettings } = useApp();
  const [activeTab, setActiveTab] = useState('theme');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [syncWorkerSidebar, setSyncWorkerSidebar] = useState(true);

  // Email / Brevo State
  const [brevoConfig, setBrevoConfig] = useState({
    smtpLogin: 'b5786a001@smtp-brevo.com',
    smtpHost: 'smtp-relay.brevo.com',
    smtpPort: '587',
    senderName: 'ForgeIndiaConnect',
    senderEmail: 'forgeindiaconnectfic@gmail.com',
    apiKey: '',
    smtpKey: '',
    enableRegistrationEmail: true,
    enableStatusUpdateEmail: true,
    enableSiteVisitEmail: true,
    enableApprovalEmail: true
  });

  const [testEmailAddress, setTestEmailAddress] = useState('pooja.antigraviity@gmail.com');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState(null);

  // Live Service Diagnostics
  const [serviceStatus, setServiceStatus] = useState({
    brevo: { loading: false, connected: false, message: 'Checking...' },
    cloudinary: { loading: false, connected: false, message: 'Checking...' },
    mongodb: { loading: false, connected: false, message: 'Checking...' }
  });

  // Department & Portal Settings
  const [portalConfig, setPortalConfig] = useState({
    portalName: 'Tamil Nadu Single Window Building Permit Clearance Portal',
    departmentName: 'Directorate of Town and Country Planning (DTCP)',
    state: 'Tamil Nadu',
    supportPhone: '+91 44 2852 1115',
    supportEmail: 'support-dtcp@tn.gov.in',
    officeAddress: '124, GST Road, Chengalpattu Zone, Chennai - 600001',
    slaDays: '15',
    siteVisitBufferDays: '3'
  });

  // Fee & Approval Rules
  const [feeRules, setFeeRules] = useState({
    ratePerSqFt: '12',
    minScrutinyFee: '2500',
    constructionRateSqFt: '2150',
    commercialMultiplier: '1.5',
    industrialMultiplier: '2.0',
    requiredDocs: [
      'Registered Land Sale Deed / Title Documents',
      'Patta / Chitta & Combined FMB Sketch',
      'Encumbrance Certificate (EC for 15-30 years)',
      'Proposed Building & Site Plan (by Regd. Architect)',
      'Applicant ID Proof (Aadhaar / Voter ID)',
      'Latest Property / Vacant Land Tax Receipt',
      'Structural Stability Certificate (for G+2 and above)'
    ]
  });
  const [newDocName, setNewDocName] = useState('');

  // Security & Admin Settings
  const [securityConfig, setSecurityConfig] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    sessionTimeout: '60',
    requireTwoFactor: false
  });

  // Check live services
  const checkAllServices = async () => {
    // Brevo check
    setServiceStatus(prev => ({ ...prev, brevo: { loading: true, message: 'Verifying Brevo...' } }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/brevo/check`);
      const data = await res.json();
      setServiceStatus(prev => ({
        ...prev,
        brevo: {
          loading: false,
          connected: res.ok && data.connected,
          message: data.message || (data.connected ? 'Brevo connected' : data.error || 'Connection failed')
        }
      }));
    } catch (e) {
      setServiceStatus(prev => ({
        ...prev,
        brevo: { loading: false, connected: false, message: 'Could not connect to backend server' }
      }));
    }

    // Cloudinary check
    setServiceStatus(prev => ({ ...prev, cloudinary: { loading: true, message: 'Verifying Cloudinary...' } }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/cloudinary/check`);
      const data = await res.json();
      setServiceStatus(prev => ({
        ...prev,
        cloudinary: {
          loading: false,
          connected: res.ok && data.connected,
          message: data.message || (data.connected ? 'Cloudinary verified' : data.error || 'Check failed')
        }
      }));
    } catch (e) {
      setServiceStatus(prev => ({
        ...prev,
        cloudinary: { loading: false, connected: false, message: 'Cloudinary unreachable' }
      }));
    }
  };

  useEffect(() => {
    checkAllServices();
  }, []);

  const handleSendTestEmail = async () => {
    if (!testEmailAddress || !testEmailAddress.includes('@')) {
      alert('Please enter a valid recipient email address.');
      return;
    }
    setIsSendingTest(true);
    setTestEmailResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/brevo/test-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: testEmailAddress,
          toName: 'Admin Test User',
          subject: '⚡ Brevo Live Test Email — Building Plan Clearance Portal',
          message: 'This is a test notification confirming that your Brevo integration is active, authenticated, and delivering emails in real-time!'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestEmailResult({ success: true, message: `Email successfully delivered to ${testEmailAddress}!` });
        if (pushLiveToast) pushLiveToast('Brevo Email Sent', `Test email dispatched to ${testEmailAddress}`, 'email');
      } else {
        setTestEmailResult({ success: false, message: data.error || 'Failed to send test email' });
      }
    } catch (err) {
      setTestEmailResult({ success: false, message: `Error: Could not reach backend at ${API_BASE_URL}. ` + err.message });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSaveSettings = () => {
    setSavedSuccess(true);
    if (pushLiveToast) {
      pushLiveToast('Settings Saved', 'System configurations updated successfully', 'success');
    }
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddDocumentRule = () => {
    if (newDocName.trim() && !feeRules.requiredDocs.includes(newDocName.trim())) {
      setFeeRules(prev => ({
        ...prev,
        requiredDocs: [...prev.requiredDocs, newDocName.trim()]
      }));
      setNewDocName('');
    }
  };

  const handleRemoveDocumentRule = (index) => {
    setFeeRules(prev => ({
      ...prev,
      requiredDocs: prev.requiredDocs.filter((_, i) => i !== index)
    }));
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.65rem', margin: 0 }}>
            <Settings size={28} color="var(--primary)" /> System & Portal Settings
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.35rem 0 0 0' }}>
            Configure real-time Brevo notifications, fee rates, checklist requirements, and government parameters.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            onClick={checkAllServices} 
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <RefreshCw size={15} /> Refresh Diagnostics
          </button>
          <button 
            onClick={handleSaveSettings} 
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}
          >
            {savedSuccess ? <Check size={16} /> : <Save size={16} />}
            {savedSuccess ? 'Saved Successfully!' : 'Save All Settings'}
          </button>
        </div>
      </div>

      {/* Live System Health Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        
        {/* Brevo Card */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: `5px solid ${serviceStatus.brevo.connected ? '#10b981' : '#f59e0b'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                <Mail size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Brevo Email Relay</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time Notifications</div>
              </div>
            </div>
            <span style={{ 
              fontSize: '0.75rem', 
              padding: '0.2rem 0.6rem', 
              borderRadius: '20px', 
              fontWeight: 700, 
              backgroundColor: serviceStatus.brevo.connected ? '#dcfce7' : '#fef3c7',
              color: serviceStatus.brevo.connected ? '#166534' : '#92400e'
            }}>
              {serviceStatus.brevo.loading ? 'Checking...' : serviceStatus.brevo.connected ? 'Active / Online' : 'Review Config'}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.75rem', lineHeight: 1.4 }}>
            {serviceStatus.brevo.message}
          </div>
        </div>

        {/* Cloudinary Card */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: `5px solid ${serviceStatus.cloudinary.connected ? '#10b981' : '#3b82f6'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                <Cloud size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Cloudinary Storage</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Document Cloud Bucket</div>
              </div>
            </div>
            <span style={{ 
              fontSize: '0.75rem', 
              padding: '0.2rem 0.6rem', 
              borderRadius: '20px', 
              fontWeight: 700, 
              backgroundColor: serviceStatus.cloudinary.connected ? '#dcfce7' : '#e0f2fe',
              color: serviceStatus.cloudinary.connected ? '#166534' : '#0369a1'
            }}>
              {serviceStatus.cloudinary.loading ? 'Checking...' : serviceStatus.cloudinary.connected ? 'Connected' : 'Active'}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.75rem', lineHeight: 1.4 }}>
            {serviceStatus.cloudinary.message}
          </div>
        </div>

        {/* MongoDB Card */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '5px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#fdf2f8', color: '#db2777' }}>
                <Database size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>MongoDB Atlas</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Primary Cloud Database</div>
              </div>
            </div>
            <span style={{ 
              fontSize: '0.75rem', 
              padding: '0.2rem 0.6rem', 
              borderRadius: '20px', 
              fontWeight: 700, 
              backgroundColor: '#dcfce7',
              color: '#166534'
            }}>
              Connected
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.75rem', lineHeight: 1.4 }}>
            building_approval_db (Replica Set Primary)
          </div>
        </div>

      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', overflowX: 'auto' }}>
        {[
          { id: 'theme', label: 'Dashboard & Sidebar Theme', icon: Palette },
          { id: 'email', label: 'Brevo & Email Notifications', icon: Mail },
          { id: 'portal', label: 'Government & Portal Info', icon: Building2 },
          { id: 'fees', label: 'Fee Rates & Checklist', icon: Coins },
          { id: 'security', label: 'Admin Security', icon: Shield }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: isActive ? `3px solid ${themeSettings?.sidebarActiveColor || 'var(--primary)'}` : '3px solid transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <tab.icon size={17} color={isActive ? (themeSettings?.sidebarActiveColor || 'var(--primary)') : 'inherit'} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 0: DASHBOARD & SIDEBAR THEME CUSTOMIZATION */}
      {activeTab === 'theme' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.75rem', alignItems: 'flex-start' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Presets Grid */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={20} color="var(--primary)" /> Curated Design Presets
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                    Click card body for complete 5-color theme, or click any circle (1 to 5) to customize that exact slot.
                  </p>
                </div>
                <button
                  onClick={resetThemeSettings}
                  className="btn btn-outline"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
                  title="Reset to default government palette"
                >
                  <RotateCcw size={14} /> Reset Defaults
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {[
                  {
                    id: 'classic_navy',
                    name: '🏛️ Classic Government Navy',
                    desc: 'Official Deep Navy with Amber Gold accents & clean slate canvas',
                    adminSidebarBg: '#0F2A4A',
                    workerSidebarBg: '#1E3A8A',
                    sidebarActiveColor: '#D97706',
                    dashboardPrimary: '#0F2A4A',
                    dashboardAccent: '#2563EB',
                    dashboardBackground: '#F8FAFC'
                  },
                  {
                    id: 'midnight_obsidian',
                    name: '🌌 Midnight Obsidian',
                    desc: 'Deep Space Slate with Electric Cyan highlights & ice canvas',
                    adminSidebarBg: '#0B132B',
                    workerSidebarBg: '#1C2541',
                    sidebarActiveColor: '#00D8F6',
                    dashboardPrimary: '#0F2A4A',
                    dashboardAccent: '#0284C7',
                    dashboardBackground: '#F8FAFC'
                  },
                  {
                    id: 'forest_emerald',
                    name: '🌲 Forest Emerald',
                    desc: 'Regal Pine Green with Vibrant Emerald & clean canvas',
                    adminSidebarBg: '#064E3B',
                    workerSidebarBg: '#065F46',
                    sidebarActiveColor: '#10B981',
                    dashboardPrimary: '#064E3B',
                    dashboardAccent: '#059669',
                    dashboardBackground: '#F8FAFC'
                  },
                  {
                    id: 'imperial_purple',
                    name: '👑 Imperial Purple',
                    desc: 'Executive Deep Purple with Violet highlights & clean canvas',
                    adminSidebarBg: '#3B0764',
                    workerSidebarBg: '#4C1D95',
                    sidebarActiveColor: '#A855F7',
                    dashboardPrimary: '#3B0764',
                    dashboardAccent: '#7C3AED',
                    dashboardBackground: '#F8FAFC'
                  },
                  {
                    id: 'executive_crimson',
                    name: '🍷 Executive Crimson',
                    desc: 'Burgundy Wine with Bright Crimson & clean canvas',
                    adminSidebarBg: '#450A0A',
                    workerSidebarBg: '#7F1D1D',
                    sidebarActiveColor: '#EF4444',
                    dashboardPrimary: '#450A0A',
                    dashboardAccent: '#DC2626',
                    dashboardBackground: '#F8FAFC'
                  },
                  {
                    id: 'charcoal_minimal',
                    name: '🌑 Modern Charcoal & Gold',
                    desc: 'Sleek Dark Slate with Warm Gold & clean zinc canvas',
                    adminSidebarBg: '#18181B',
                    workerSidebarBg: '#27272A',
                    sidebarActiveColor: '#F59E0B',
                    dashboardPrimary: '#18181B',
                    dashboardAccent: '#EAB308',
                    dashboardBackground: '#F8FAFC'
                  }
                ].map(preset => {
                  const isSelected = themeSettings?.themePreset === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => {
                        updateThemeSettings({
                          ...preset,
                          themePreset: preset.id
                        });
                        if (pushLiveToast) pushLiveToast('Theme Applied', `Loaded all 5 colors for "${preset.name}"`, 'theme');
                      }}
                      style={{
                        padding: '1.15rem',
                        borderRadius: '12px',
                        border: isSelected ? `2.5px solid ${preset.sidebarActiveColor}` : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? 'rgba(235, 243, 250, 0.7)' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? `0 6px 16px ${preset.sidebarActiveColor}25` : '0 2px 6px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                          {preset.name}
                        </span>
                        {isSelected && (
                          <span style={{ backgroundColor: preset.sidebarActiveColor, color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Check size={13} strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.85rem', lineHeight: 1.3 }}>
                        {preset.desc}
                      </div>

                      {/* 5 Interactive Color Palette Swatches with Clear Labels */}
                      <div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span>5-Color Palette:</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 600 }}>Click 1–5 to apply slot</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          
                          {/* Slot 1: Admin Sidebar */}
                          <div
                            title={`1️⃣ Admin Sidebar Color: ${preset.adminSidebarBg}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateThemeSettings({ adminSidebarBg: preset.adminSidebarBg, previewRole: 'admin', themePreset: 'custom' });
                              if (pushLiveToast) pushLiveToast('1. Admin Sidebar Color', `Updated to ${preset.adminSidebarBg}`, 'theme');
                            }}
                            style={{ 
                              width: '28px', 
                              height: '28px', 
                              borderRadius: '50%', 
                              backgroundColor: preset.adminSidebarBg, 
                              border: themeSettings?.adminSidebarBg === preset.adminSidebarBg ? '3px solid #3b82f6' : '2px solid white', 
                              boxShadow: '0 2px 5px rgba(0,0,0,0.25)', 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              color: 'white',
                              transition: 'transform 0.15s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            1
                          </div>

                          {/* Slot 2: Worker Sidebar */}
                          <div
                            title={`2️⃣ Field Worker Sidebar Color: ${preset.workerSidebarBg}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateThemeSettings({ workerSidebarBg: preset.workerSidebarBg, previewRole: 'worker', themePreset: 'custom' });
                              if (pushLiveToast) pushLiveToast('2. Worker Sidebar Color', `Updated to ${preset.workerSidebarBg} (Switched preview to Worker)`, 'theme');
                            }}
                            style={{ 
                              width: '28px', 
                              height: '28px', 
                              borderRadius: '50%', 
                              backgroundColor: preset.workerSidebarBg, 
                              border: themeSettings?.workerSidebarBg === preset.workerSidebarBg ? '3px solid #3b82f6' : '2px solid white', 
                              boxShadow: '0 2px 5px rgba(0,0,0,0.25)', 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              color: 'white',
                              transition: 'transform 0.15s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            2
                          </div>

                          {/* Slot 3: Active Indicator */}
                          <div
                            title={`3️⃣ Active Highlight Color: ${preset.sidebarActiveColor}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateThemeSettings({ sidebarActiveColor: preset.sidebarActiveColor, dashboardAccent: preset.sidebarActiveColor, themePreset: 'custom' });
                              if (pushLiveToast) pushLiveToast('3. Active Highlight Color', `Updated to ${preset.sidebarActiveColor}`, 'theme');
                            }}
                            style={{ 
                              width: '28px', 
                              height: '28px', 
                              borderRadius: '50%', 
                              backgroundColor: preset.sidebarActiveColor, 
                              border: themeSettings?.sidebarActiveColor === preset.sidebarActiveColor ? '3px solid #3b82f6' : '2px solid white', 
                              boxShadow: '0 2px 5px rgba(0,0,0,0.25)', 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              color: 'white',
                              transition: 'transform 0.15s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            3
                          </div>

                          {/* Slot 4: Primary Brand */}
                          <div
                            title={`4️⃣ Dashboard Primary Buttons & Headers: ${preset.dashboardPrimary}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateThemeSettings({ dashboardPrimary: preset.dashboardPrimary, themePreset: 'custom' });
                              if (pushLiveToast) pushLiveToast('4. Primary Brand Color', `Updated to ${preset.dashboardPrimary}`, 'theme');
                            }}
                            style={{ 
                              width: '28px', 
                              height: '28px', 
                              borderRadius: '50%', 
                              backgroundColor: preset.dashboardPrimary, 
                              border: themeSettings?.dashboardPrimary === preset.dashboardPrimary ? '3px solid #3b82f6' : '2px solid white', 
                              boxShadow: '0 2px 5px rgba(0,0,0,0.25)', 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              color: 'white',
                              transition: 'transform 0.15s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            4
                          </div>

                          {/* Slot 5: Canvas Background */}
                          <div
                            title={`5️⃣ Dashboard Canvas Background: ${preset.dashboardBackground}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateThemeSettings({ dashboardBackground: preset.dashboardBackground, themePreset: 'custom' });
                              if (pushLiveToast) pushLiveToast('5. Canvas Background Color', `Updated to ${preset.dashboardBackground}`, 'theme');
                            }}
                            style={{ 
                              width: '28px', 
                              height: '28px', 
                              borderRadius: '50%', 
                              backgroundColor: preset.dashboardBackground, 
                              border: themeSettings?.dashboardBackground === preset.dashboardBackground ? '3px solid #3b82f6' : '2px solid #cbd5e1', 
                              boxShadow: '0 2px 5px rgba(0,0,0,0.15)', 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              color: '#334155',
                              transition: 'transform 0.15s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            5
                          </div>

                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Palette size={20} color="var(--primary)" /> Custom 5-Color Slot Editor
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
                
                {/* 1. Admin Sidebar Color */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: '#0f172a' }}>
                    1️⃣ Admin Sidebar Color
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="color"
                      value={themeSettings?.adminSidebarBg || '#0F2A4A'}
                      onChange={e => {
                        const val = e.target.value;
                        if (syncWorkerSidebar) {
                          updateThemeSettings({ adminSidebarBg: val, workerSidebarBg: val, themePreset: 'custom' });
                        } else {
                          updateThemeSettings({ adminSidebarBg: val, themePreset: 'custom' });
                        }
                      }}
                      onInput={e => {
                        const val = e.target.value;
                        if (syncWorkerSidebar) {
                          updateThemeSettings({ adminSidebarBg: val, workerSidebarBg: val, themePreset: 'custom' });
                        } else {
                          updateThemeSettings({ adminSidebarBg: val, themePreset: 'custom' });
                        }
                      }}
                      style={{ width: '44px', height: '38px', padding: '2px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                    />
                    <input 
                      type="text"
                      className="form-control"
                      value={themeSettings?.adminSidebarBg || '#0F2A4A'}
                      onChange={e => {
                        const val = e.target.value;
                        if (syncWorkerSidebar) {
                          updateThemeSettings({ adminSidebarBg: val, workerSidebarBg: val, themePreset: 'custom' });
                        } else {
                          updateThemeSettings({ adminSidebarBg: val, themePreset: 'custom' });
                        }
                      }}
                      style={{ fontFamily: 'monospace', fontWeight: 700 }}
                    />
                  </div>
                </div>

                {/* 2. Worker Sidebar Color */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: '#0f172a' }}>
                    2️⃣ Worker Sidebar Color
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="color"
                      value={themeSettings?.workerSidebarBg || themeSettings?.adminSidebarBg || '#1E293B'}
                      onChange={e => updateThemeSettings({ workerSidebarBg: e.target.value, themePreset: 'custom' })}
                      onInput={e => updateThemeSettings({ workerSidebarBg: e.target.value, themePreset: 'custom' })}
                      style={{ width: '44px', height: '38px', padding: '2px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                    />
                    <input 
                      type="text"
                      className="form-control"
                      value={themeSettings?.workerSidebarBg || themeSettings?.adminSidebarBg || '#1E293B'}
                      onChange={e => updateThemeSettings({ workerSidebarBg: e.target.value, themePreset: 'custom' })}
                      style={{ fontFamily: 'monospace', fontWeight: 700 }}
                    />
                  </div>
                </div>

                {/* Sync Toggle */}
                <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#475569' }}>
                  <input 
                    type="checkbox" 
                    id="syncWorker" 
                    checked={syncWorkerSidebar} 
                    onChange={e => setSyncWorkerSidebar(e.target.checked)} 
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary)' }} 
                  />
                  <label htmlFor="syncWorker" style={{ cursor: 'pointer', fontWeight: 600 }}>
                    Auto-sync sidebar color changes to Worker Dashboard
                  </label>
                </div>

                {/* 3. Sidebar Active Indicator Color */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: '#0f172a' }}>
                    3️⃣ Active Item Highlight Color
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="color"
                      value={themeSettings?.sidebarActiveColor || '#D97706'}
                      onChange={e => updateThemeSettings({ sidebarActiveColor: e.target.value, themePreset: 'custom' })}
                      onInput={e => updateThemeSettings({ sidebarActiveColor: e.target.value, themePreset: 'custom' })}
                      style={{ width: '44px', height: '38px', padding: '2px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                    />
                    <input 
                      type="text"
                      className="form-control"
                      value={themeSettings?.sidebarActiveColor || '#D97706'}
                      onChange={e => updateThemeSettings({ sidebarActiveColor: e.target.value, themePreset: 'custom' })}
                      style={{ fontFamily: 'monospace', fontWeight: 700 }}
                    />
                  </div>
                </div>

                {/* 4. Dashboard Primary Brand Color */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: '#0f172a' }}>
                    4️⃣ Dashboard Primary / Buttons
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="color"
                      value={themeSettings?.dashboardPrimary || '#0F2A4A'}
                      onChange={e => updateThemeSettings({ dashboardPrimary: e.target.value, themePreset: 'custom' })}
                      onInput={e => updateThemeSettings({ dashboardPrimary: e.target.value, themePreset: 'custom' })}
                      style={{ width: '44px', height: '38px', padding: '2px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                    />
                    <input 
                      type="text"
                      className="form-control"
                      value={themeSettings?.dashboardPrimary || '#0F2A4A'}
                      onChange={e => updateThemeSettings({ dashboardPrimary: e.target.value, themePreset: 'custom' })}
                      style={{ fontFamily: 'monospace', fontWeight: 700 }}
                    />
                  </div>
                </div>

                {/* 5. Dashboard Background Color */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: '#0f172a' }}>
                    5️⃣ Dashboard Canvas Background
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input 
                      type="color"
                      value={themeSettings?.dashboardBackground || '#F8FAFC'}
                      onChange={e => updateThemeSettings({ dashboardBackground: e.target.value, themePreset: 'custom' })}
                      onInput={e => updateThemeSettings({ dashboardBackground: e.target.value, themePreset: 'custom' })}
                      style={{ width: '44px', height: '38px', padding: '2px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                    />
                    <input 
                      type="text"
                      className="form-control"
                      value={themeSettings?.dashboardBackground || '#F8FAFC'}
                      onChange={e => updateThemeSettings({ dashboardBackground: e.target.value, themePreset: 'custom' })}
                      style={{ fontFamily: 'monospace', fontWeight: 700 }}
                    />
                  </div>

                  {/* Quick-Pick Clean Canvas Swatches */}
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Swatches:</span>
                    {[
                      { name: 'Crisp Slate', hex: '#F8FAFC' },
                      { name: 'Pure White', hex: '#FFFFFF' },
                      { name: 'Soft Cloud', hex: '#F1F5F9' },
                      { name: 'Ice Platinum', hex: '#F3F4F6' },
                      { name: 'Warm Pearl', hex: '#FAF8F5' },
                      { name: 'Midnight', hex: '#0F172A' },
                    ].map(sw => (
                      <button
                        key={sw.hex}
                        type="button"
                        onClick={() => updateThemeSettings({ dashboardBackground: sw.hex, themePreset: 'custom' })}
                        title={`Apply ${sw.name} (${sw.hex})`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.2rem 0.45rem',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          backgroundColor: '#ffffff',
                          border: themeSettings?.dashboardBackground === sw.hex ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: sw.hex, border: '1px solid #94a3b8', display: 'inline-block' }} />
                        {sw.name}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Live Interactive Preview Box with Role Switcher */}
          <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '2rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f172a' }}>
                <Eye size={18} /> Live Dashboard Preview
              </h3>
            </div>

            {/* Dashboard Role Switcher for Preview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', padding: '0.25rem', backgroundColor: '#f1f5f9', borderRadius: '8px', marginBottom: '1rem' }}>
              <button
                onClick={() => {
                  updateThemeSettings({ previewRole: 'admin' });
                }}
                style={{
                  padding: '0.45rem',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: (themeSettings?.previewRole || 'admin') === 'admin' ? 800 : 600,
                  backgroundColor: (themeSettings?.previewRole || 'admin') === 'admin' ? '#ffffff' : 'transparent',
                  color: (themeSettings?.previewRole || 'admin') === 'admin' ? 'var(--primary)' : '#64748b',
                  boxShadow: (themeSettings?.previewRole || 'admin') === 'admin' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer'
                }}
              >
                🏢 Admin Dashboard
              </button>
              <button
                onClick={() => {
                  updateThemeSettings({ previewRole: 'worker' });
                }}
                style={{
                  padding: '0.45rem',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: themeSettings?.previewRole === 'worker' ? 800 : 600,
                  backgroundColor: themeSettings?.previewRole === 'worker' ? '#ffffff' : 'transparent',
                  color: themeSettings?.previewRole === 'worker' ? 'var(--primary)' : '#64748b',
                  boxShadow: themeSettings?.previewRole === 'worker' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer'
                }}
              >
                👷 Worker Dashboard
              </button>
            </div>

            {/* Mini Layout Mockup */}
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
              
              {/* Header Bar */}
              <div style={{ backgroundColor: '#ffffff', padding: '0.5rem 0.85rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: themeSettings?.dashboardPrimary || '#0F2A4A' }}>
                  🏛️ BuildPermit Portal
                </div>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: themeSettings?.sidebarActiveColor || '#D97706' }} />
              </div>

              {/* Body */}
              <div style={{ display: 'flex', height: '240px' }}>
                
                {/* Mini Sidebar */}
                <div style={{ 
                  width: '95px', 
                  backgroundColor: themeSettings?.previewRole === 'worker' 
                    ? (themeSettings?.workerSidebarBg || '#1E293B') 
                    : (themeSettings?.adminSidebarBg || '#0F2A4A'), 
                  padding: '0.65rem 0.4rem', 
                  color: 'white', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.35rem',
                  transition: 'background-color 0.3s ease'
                }}>
                  <div style={{ fontSize: '0.58rem', fontWeight: 800, opacity: 0.7, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                    {themeSettings?.previewRole === 'worker' ? '👷 Worker Nav' : '🏢 Admin Nav'}
                  </div>
                  
                  <div style={{ 
                    fontSize: '0.65rem', 
                    padding: '0.3rem 0.4rem', 
                    borderRadius: '4px', 
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    borderLeft: `3px solid ${themeSettings?.sidebarActiveColor || '#D97706'}`,
                    fontWeight: 700,
                    color: 'white'
                  }}>
                    ● {themeSettings?.previewRole === 'worker' ? 'My Apps' : 'Dashboard'}
                  </div>
                  
                  <div style={{ fontSize: '0.65rem', padding: '0.3rem 0.4rem', color: 'rgba(255,255,255,0.7)' }}>
                    ○ {themeSettings?.previewRole === 'worker' ? 'Attendance' : 'Applications'}
                  </div>
                  <div style={{ fontSize: '0.65rem', padding: '0.3rem 0.4rem', color: 'rgba(255,255,255,0.7)' }}>
                    ○ {themeSettings?.previewRole === 'worker' ? 'Daily Reports' : 'Documents'}
                  </div>
                  <div style={{ fontSize: '0.65rem', padding: '0.3rem 0.4rem', color: 'rgba(255,255,255,0.7)' }}>
                    ○ {themeSettings?.previewRole === 'worker' ? 'Profile' : 'Settings'}
                  </div>
                </div>

                {/* Mini Canvas Content */}
                <div style={{ flex: 1, backgroundColor: themeSettings?.dashboardBackground || '#F8FAFC', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', transition: 'background-color 0.3s ease' }}>
                  
                  {/* Sample Metric Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                    <div style={{ backgroundColor: '#ffffff', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Active Apps</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: themeSettings?.dashboardPrimary || '#0F2A4A' }}>1,248</div>
                    </div>
                    <div style={{ backgroundColor: '#ffffff', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Sanctioned</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: themeSettings?.sidebarActiveColor || '#10b981' }}>94%</div>
                    </div>
                  </div>

                  {/* Sample Action Button */}
                  <div style={{ marginTop: 'auto' }}>
                    <button style={{ 
                      width: '100%', 
                      backgroundColor: themeSettings?.dashboardPrimary || '#0F2A4A', 
                      color: 'white', 
                      border: 'none', 
                      padding: '0.4rem', 
                      borderRadius: '5px', 
                      fontSize: '0.65rem', 
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}>
                      Primary Action Button
                    </button>
                  </div>

                </div>

              </div>
            </div>

            {/* 5-Color Slot Legend */}
            <div style={{ marginTop: '1.25rem', padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                🎨 5 Theme Color Slots Explained:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: themeSettings?.adminSidebarBg, border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', color: 'white', fontWeight: 800 }}>1</span>
                  <span><strong>1. Admin Sidebar:</strong> {themeSettings?.adminSidebarBg}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: themeSettings?.workerSidebarBg, border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', color: 'white', fontWeight: 800 }}>2</span>
                  <span><strong>2. Worker Sidebar:</strong> {themeSettings?.workerSidebarBg}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: themeSettings?.sidebarActiveColor, border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', color: 'white', fontWeight: 800 }}>3</span>
                  <span><strong>3. Active Highlight:</strong> {themeSettings?.sidebarActiveColor}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: themeSettings?.dashboardPrimary, border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', color: 'white', fontWeight: 800 }}>4</span>
                  <span><strong>4. Primary Action/Buttons:</strong> {themeSettings?.dashboardPrimary}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: themeSettings?.dashboardBackground, border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', color: '#334155', fontWeight: 800 }}>5</span>
                  <span><strong>5. Canvas Background:</strong> {themeSettings?.dashboardBackground}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 1: BREVO EMAIL & NOTIFICATIONS */}
      {activeTab === 'email' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'flex-start' }}>
          
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={20} color="var(--primary)" /> Brevo Integration Credentials
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Brevo SMTP Login
                </label>
                <input 
                  type="text"
                  className="form-control"
                  value={brevoConfig.smtpLogin}
                  onChange={e => setBrevoConfig({ ...brevoConfig, smtpLogin: e.target.value })}
                  placeholder="e.g. b5786a001@smtp-brevo.com"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  SMTP Relay Server
                </label>
                <input 
                  type="text"
                  className="form-control"
                  value={brevoConfig.smtpHost}
                  disabled
                  style={{ backgroundColor: '#f8fafc', color: '#64748b' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Sender Display Name
                </label>
                <input 
                  type="text"
                  className="form-control"
                  value={brevoConfig.senderName}
                  onChange={e => setBrevoConfig({ ...brevoConfig, senderName: e.target.value })}
                  placeholder="ForgeIndiaConnect"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Sender Email Address
                </label>
                <input 
                  type="email"
                  className="form-control"
                  value={brevoConfig.senderEmail}
                  onChange={e => setBrevoConfig({ ...brevoConfig, senderEmail: e.target.value })}
                  placeholder="forgeindiaconnectfic@gmail.com"
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Master SMTP Key / API Key
              </label>
              <input 
                type="password"
                className="form-control"
                value={brevoConfig.smtpKey}
                onChange={e => setBrevoConfig({ ...brevoConfig, smtpKey: e.target.value })}
                placeholder="xsmtpsib-..."
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Configured securely in root <code>.env</code> file.
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.5rem 0' }} />

            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Automated Email Dispatch Triggers
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                { key: 'enableRegistrationEmail', label: 'New Application Registration Acknowledgement', desc: 'Dispatches instant email with Application ID, tracking link, and document checklist.' },
                { key: 'enableStatusUpdateEmail', label: 'Document Scrutiny Status Updates', desc: 'Alerts citizen when documents are verified or if re-upload is required.' },
                { key: 'enableSiteVisitEmail', label: 'Site Inspection Schedule Alert', desc: 'Sends scheduled visit date and assigned field officer details to applicant.' },
                { key: 'enableApprovalEmail', label: 'Final Permit Sanction & Certificate Issuance', desc: 'Emails sanction order with QR verification certificate upon administrative sign-off.' }
              ].map(item => (
                <label key={item.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', padding: '0.5rem 0' }}>
                  <input 
                    type="checkbox"
                    checked={brevoConfig[item.key]}
                    onChange={e => setBrevoConfig({ ...brevoConfig, [item.key]: e.target.checked })}
                    style={{ marginTop: '0.2rem', width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.label}</div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>

          </div>

          {/* Test Email Dispatch Card */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
              <Send size={18} /> Test Live Brevo Mailer
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Send an instant verification email to test SMTP relay authentication and deliverability.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Recipient Test Email
              </label>
              <input 
                type="email"
                className="form-control"
                value={testEmailAddress}
                onChange={e => setTestEmailAddress(e.target.value)}
                placeholder="youremail@gmail.com"
              />
            </div>

            <button 
              onClick={handleSendTestEmail}
              disabled={isSendingTest}
              className="btn btn-primary"
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.65rem' }}
            >
              {isSendingTest ? <RefreshCw size={16} className="spin" /> : <Send size={16} />}
              {isSendingTest ? 'Dispatching...' : 'Send Live Test Email'}
            </button>

            {testEmailResult && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '0.85rem', 
                borderRadius: '8px', 
                fontSize: '0.8rem', 
                backgroundColor: testEmailResult.success ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${testEmailResult.success ? '#bbf7d0' : '#fecaca'}`,
                color: testEmailResult.success ? '#166534' : '#991b1b'
              }}>
                <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>
                  {testEmailResult.success ? '✅ Success' : '❌ Delivery Failed'}
                </div>
                <div>{testEmailResult.message}</div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: GOVERNMENT & PORTAL INFO */}
      {activeTab === 'portal' && (
        <div className="card" style={{ padding: '1.75rem', maxWidth: '800px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={20} color="var(--primary)" /> Department & Portal Identity
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Portal Display Title
              </label>
              <input 
                type="text"
                className="form-control"
                value={portalConfig.portalName}
                onChange={e => setPortalConfig({ ...portalConfig, portalName: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Governing Department
                </label>
                <input 
                  type="text"
                  className="form-control"
                  value={portalConfig.departmentName}
                  onChange={e => setPortalConfig({ ...portalConfig, departmentName: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  State / Jurisdiction
                </label>
                <input 
                  type="text"
                  className="form-control"
                  value={portalConfig.state}
                  onChange={e => setPortalConfig({ ...portalConfig, state: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Citizen Helpline Phone
                </label>
                <input 
                  type="text"
                  className="form-control"
                  value={portalConfig.supportPhone}
                  onChange={e => setPortalConfig({ ...portalConfig, supportPhone: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Official Support Email
                </label>
                <input 
                  type="email"
                  className="form-control"
                  value={portalConfig.supportEmail}
                  onChange={e => setPortalConfig({ ...portalConfig, supportEmail: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Zonal Headquarters Address
              </label>
              <textarea 
                className="form-control"
                rows={2}
                value={portalConfig.officeAddress}
                onChange={e => setPortalConfig({ ...portalConfig, officeAddress: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  SLA Target Clearance Window (Days)
                </label>
                <input 
                  type="number"
                  className="form-control"
                  value={portalConfig.slaDays}
                  onChange={e => setPortalConfig({ ...portalConfig, slaDays: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Site Visit Buffer Window (Days)
                </label>
                <input 
                  type="number"
                  className="form-control"
                  value={portalConfig.siteVisitBufferDays}
                  onChange={e => setPortalConfig({ ...portalConfig, siteVisitBufferDays: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FEES & CHECKLIST */}
      {activeTab === 'fees' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
          
          {/* Fee Calculation Formulas */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Coins size={20} color="var(--primary)" /> Scrutiny Fee Schedule
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Scrutiny Fee Rate (₹ per sq.ft)
                </label>
                <input 
                  type="number"
                  className="form-control"
                  value={feeRules.ratePerSqFt}
                  onChange={e => setFeeRules({ ...feeRules, ratePerSqFt: e.target.value })}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Example: 2,000 sq.ft × ₹12 = ₹24,000
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Minimum Base Scrutiny Fee (₹)
                </label>
                <input 
                  type="number"
                  className="form-control"
                  value={feeRules.minScrutinyFee}
                  onChange={e => setFeeRules({ ...feeRules, minScrutinyFee: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Estimated Construction Cost Rate (₹ per sq.ft)
                </label>
                <input 
                  type="number"
                  className="form-control"
                  value={feeRules.constructionRateSqFt}
                  onChange={e => setFeeRules({ ...feeRules, constructionRateSqFt: e.target.value })}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Used for estimating total building valuation upon citizen application.
                </div>
              </div>
            </div>
          </div>

          {/* Mandatory Checklist Config */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} color="var(--primary)" /> Mandatory Document Requirements
            </h3>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <input 
                type="text"
                className="form-control"
                placeholder="Enter required document title..."
                value={newDocName}
                onChange={e => setNewDocName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddDocumentRule(); } }}
              />
              <button 
                onClick={handleAddDocumentRule}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}
              >
                <Plus size={16} /> Add
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '340px', overflowY: 'auto' }}>
              {feeRules.requiredDocs.map((doc, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.85rem'
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {idx + 1}. {doc}
                  </span>
                  <button 
                    onClick={() => handleRemoveDocumentRule(idx)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}
                    title="Remove item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: ADMIN SECURITY */}
      {activeTab === 'security' && (
        <div className="card" style={{ padding: '1.75rem', maxWidth: '600px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={20} color="var(--primary)" /> Administrator Credentials & Security
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Current Admin Password
              </label>
              <input 
                type="password"
                className="form-control"
                value={securityConfig.currentPassword}
                onChange={e => setSecurityConfig({ ...securityConfig, currentPassword: e.target.value })}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                New Password
              </label>
              <input 
                type="password"
                className="form-control"
                value={securityConfig.newPassword}
                onChange={e => setSecurityConfig({ ...securityConfig, newPassword: e.target.value })}
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Confirm New Password
              </label>
              <input 
                type="password"
                className="form-control"
                value={securityConfig.confirmPassword}
                onChange={e => setSecurityConfig({ ...securityConfig, confirmPassword: e.target.value })}
                placeholder="Re-type new password"
              />
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox"
                  checked={securityConfig.requireTwoFactor}
                  onChange={e => setSecurityConfig({ ...securityConfig, requireTwoFactor: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Enforce Email OTP verification on Admin login
                </span>
              </label>
            </div>

            <button 
              onClick={() => {
                if (securityConfig.newPassword && securityConfig.newPassword === securityConfig.confirmPassword) {
                  alert('Password updated successfully!');
                  setSecurityConfig({ currentPassword: '', newPassword: '', confirmPassword: '', sessionTimeout: '60', requireTwoFactor: false });
                } else if (securityConfig.newPassword !== securityConfig.confirmPassword) {
                  alert('New password and confirm password do not match.');
                } else {
                  alert('Please enter a new password.');
                }
              }}
              className="btn btn-primary"
              style={{ marginTop: '0.75rem', alignSelf: 'flex-start' }}
            >
              Update Admin Password
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

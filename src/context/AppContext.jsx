import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const initialNotifications = [
  {
    id: 'notif-1',
    type: 'NEW_APPLICATION',
    targetId: 'BA-2026-000125',
    message: 'Raj Kumar submitted a new application.',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    read: false,
    role: 'Admin'
  },
  {
    id: 'notif-2',
    type: 'SITE_VISIT_COMPLETED',
    targetId: 'BA-2026-000120',
    message: 'Kumar completed the site visit for BA-2026-000120.',
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    read: false,
    role: 'Admin'
  },
  {
    id: 'notif-3',
    type: 'SITE_VISIT_ASSIGNED',
    targetId: 'BA-2026-000125',
    message: 'Application: BA-2026-000125 \nLocation: Chennai South',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    read: false,
    role: 'worker' // matches lowercase for worker for simplicity, or we check if !== 'Admin'
  },
  {
    id: 'notif-4',
    type: 'DOCUMENT_UPLOADED',
    targetId: 'BA-2026-000128',
    message: 'A new document was uploaded for BA-2026-000128.',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    read: true,
    role: 'worker'
  }
];

const initialApplications = [
  {
    id: 'APP-2026-00126',
    applicantName: 'POOJASREE',
    mobile: '8765678987',
    projectName: 'Residential Housing Permit',
    address: 'Gollapalli, Chennai',
    location: 'Gollapalli, Chennai',
    surveyNumber: '88/1A',
    buildingType: 'Residential',
    buildingDetails: {
      plotArea: '1400 sq.ft',
      builtUpArea: '2400 sq.ft',
      noOfFloors: 'G+2'
    },
    assignedWorker: 'Unassigned (Customer Public)',
    workerId: null,
    workerName: null,
    source: 'Customer Public',
    createdAt: new Date().toISOString(),
    status: 'approved',
    stages: {
      1: { status: 'Completed', completedDate: new Date().toLocaleDateString(), by: 'Customer' },
      2: { status: 'Completed', completedDate: new Date().toLocaleDateString(), by: 'Customer' },
      3: { status: 'Completed', completedDate: new Date().toLocaleDateString(), by: 'Admin' },
      4: { status: 'Completed', completedDate: new Date().toLocaleDateString(), officerName: 'Admin' },
      5: { status: 'Approved', completedDate: new Date().toLocaleDateString(), officerName: 'Admin' },
    },
    documents: [
      { id: 'doc-p1', name: 'Sale Deed', file: null, status: 'verified', verifiedBy: 'Admin' },
      { id: 'doc-p2', name: 'Patta', file: null, status: 'verified', verifiedBy: 'Admin' },
      { id: 'doc-p3', name: 'EC Certificate', file: null, status: 'verified', verifiedBy: 'Admin' },
      { id: 'doc-p4', name: 'Approved Plan', file: null, status: 'verified', verifiedBy: 'Admin' },
      { id: 'doc-p5', name: 'Tax Receipt', file: null, status: 'verified', verifiedBy: 'Admin' },
      { id: 'doc-p6', name: 'ID Proof', file: null, status: 'verified', verifiedBy: 'Admin' }
    ],
    history: [
      { date: new Date().toISOString(), action: 'Application Submitted Online via Public Portal', by: 'Customer' }
    ],
    requiredDocs: ["Sale Deed", "Patta", "EC Certificate", "Approved Plan", "Tax Receipt", "ID Proof"]
  },
  {
    id: 'BA-2026-000125',
    applicantName: 'Rajesh Kumar',
    mobile: '9876543210',
    projectName: 'Residential Building',
    address: '123 Main St, Chennai',
    location: 'Chennai South',
    pincode: '600001',
    surveyNumber: '14/2',
    buildingType: 'Residential',
    assignedWorker: 'Pooja',
    workerId: 'Pooja',
    workerName: 'Pooja',
    remarks: '',
    createdAt: new Date().toISOString(),
    status: 'under_review',
    stages: {
      1: { status: 'Pending', completedDate: null, by: null, remarks: '' },
      2: { status: 'Pending', completedDate: null, by: null, remarks: '', refNo: '' },
      3: { status: 'Pending', completedDate: null, by: null, remarks: '', refNo: '' },
      4: { status: 'Pending', completedDate: null, by: null, remarks: '', visitDate: '', officerName: '' },
      5: { status: 'Pending', completedDate: null, by: null, remarks: '', finalNo: '' },
    },
    documents: [
      {
        id: 'doc-1',
        name: 'Land / Sale Deed',
        file: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        uploadDate: new Date(Date.now() - 86400000).toISOString(),
        status: 'verified',
        verifiedBy: 'Admin',
        verifiedAt: new Date(Date.now() - 40000000).toISOString(),
        rejectedReason: null
      },
      {
        id: 'doc-2',
        name: 'Patta / Chitta',
        file: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        uploadDate: new Date(Date.now() - 86400000).toISOString(),
        status: 'verified',
        verifiedBy: 'Admin',
        verifiedAt: new Date(Date.now() - 40000000).toISOString(),
        rejectedReason: null
      },
      {
        id: 'doc-3',
        name: 'Encumbrance Certificate (EC)',
        file: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        uploadDate: new Date(Date.now() - 86400000).toISOString(),
        status: 'verified',
        verifiedBy: 'Admin',
        verifiedAt: new Date(Date.now() - 30000000).toISOString(),
        rejectedReason: null
      },
      {
        id: 'doc-4',
        name: 'Approved / Proposed Building Plan',
        file: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        uploadDate: new Date(Date.now() - 86400000).toISOString(),
        status: 'verified',
        verifiedBy: 'Admin',
        verifiedAt: new Date(Date.now() - 20000000).toISOString(),
        rejectedReason: null
      },
      {
        id: 'doc-5',
        name: 'Site Plan',
        file: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        uploadDate: new Date(Date.now() - 86400000).toISOString(),
        status: 'verified',
        verifiedBy: 'Admin',
        verifiedAt: new Date(Date.now() - 10000000).toISOString(),
        rejectedReason: null
      },
      {
        id: 'doc-6',
        name: 'Applicant ID Proof',
        file: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        uploadDate: new Date(Date.now() - 86400000).toISOString(),
        status: 'verified',
        verifiedBy: 'Admin',
        verifiedAt: new Date(Date.now() - 5000000).toISOString(),
        rejectedReason: null
      },
      {
        id: 'doc-7',
        name: 'Property Tax Receipt',
        file: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        uploadDate: new Date(Date.now() - 86400000).toISOString(),
        status: 'pending',
        verifiedBy: null,
        verifiedAt: null,
        rejectedReason: null
      },
      {
        id: 'doc-8',
        name: 'Ownership Proof',
        file: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        uploadDate: new Date(Date.now() - 86400000).toISOString(),
        status: 'pending',
        verifiedBy: null,
        verifiedAt: null,
        rejectedReason: null
      },
      {
        id: 'doc-9',
        name: 'Site / Property Photos',
        file: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        uploadDate: new Date(Date.now() - 86400000).toISOString(),
        status: 'reupload_required',
        verifiedBy: 'Admin',
        verifiedAt: new Date(Date.now() - 1000000).toISOString(),
        rejectedReason: 'Photos are blurry. Please upload clear photos of the property.'
      },
      {
        id: 'doc-10',
        name: 'Previous Approval / Permission (if applicable)',
        file: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        uploadDate: new Date(Date.now() - 86400000).toISOString(),
        status: 'reupload_required',
        verifiedBy: 'Admin',
        verifiedAt: new Date(Date.now() - 1000000).toISOString(),
        rejectedReason: 'Missing official signature.'
      }
    ],
    history: [
      { date: new Date().toISOString(), action: 'Application Created', by: 'Admin' }
    ],
    requiredDocs: [
      "Land / Sale Deed",
      "Patta / Chitta",
      "Encumbrance Certificate (EC)",
      "Approved / Proposed Building Plan",
      "Site Plan",
      "Applicant ID Proof",
      "Property Tax Receipt",
      "Ownership Proof",
      "Site / Property Photos",
      "Previous Approval / Permission (if applicable)"
    ]
  }
];

const todayFormatted = new Date().toISOString().split('T')[0];

const initialAttendance = [
  {
    id: 'att-1',
    workerId: 'Arun',
    workerName: 'Arun',
    date: todayFormatted,
    checkIn: '09:00 AM',
    checkOut: null,
    hours: null,
    status: 'present',
    timestamp: new Date().toISOString()
  },
  {
    id: 'att-2',
    workerId: 'Pooja',
    workerName: 'Pooja',
    date: todayFormatted,
    checkIn: '09:15 AM',
    checkOut: null,
    hours: null,
    status: 'present',
    timestamp: new Date().toISOString()
  },
  {
    id: 'att-3',
    workerId: 'Kumar',
    workerName: 'Kumar',
    date: todayFormatted,
    checkIn: '09:30 AM',
    checkOut: null,
    hours: null,
    status: 'present',
    timestamp: new Date().toISOString()
  },
  {
    id: 'att-4',
    workerId: 'Suresh',
    workerName: 'Suresh',
    date: todayFormatted,
    checkIn: null,
    checkOut: null,
    hours: null,
    status: 'absent',
    timestamp: new Date().toISOString()
  }
];

const initialDailyReports = [
  {
    id: 'rep-1',
    workerId: 'Arun',
    workerName: 'Arun',
    date: todayFormatted,
    applicationsHandled: 4,
    customerVisits: 2,
    siteVisitsCompleted: 1,
    documentsReviewed: 6,
    description: 'Completed site verification at Hosur and reviewed documents for applicant Suresh Kumar.',
    status: 'submitted',
    submittedAt: '05:50 PM'
  }
];

// Native IndexedDB persistent storage helper (unlimited browser storage)
const DB_NAME = 'BuildingApprovalDB_v2';
const STORE_NAME = 'applications_store';

const openAppDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveAppsToIndexedDB = async (apps) => {
  try {
    const db = await openAppDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(apps, 'current_apps');
  } catch (e) {
    console.error('IndexedDB save error:', e);
  }
};

const getAppsFromIndexedDB = async () => {
  try {
    const db = await openAppDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get('current_apps');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
};

export const AppProvider = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);
  
  const [applications, setApplications] = useState(() => {
    const saved = localStorage.getItem('building_apps_v3');
    return saved ? JSON.parse(saved) : initialApplications;
  });

  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    const saved = localStorage.getItem('building_attendance_v1');
    return saved ? JSON.parse(saved) : initialAttendance;
  });

  const [dailyReports, setDailyReports] = useState(() => {
    const saved = localStorage.getItem('building_daily_reports_v1');
    return saved ? JSON.parse(saved) : initialDailyReports;
  });
  
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('building_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const seen = new Set();
          return parsed.filter(item => {
            if (!item || !item.id) return false;
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });
        }
      } catch (e) {
        console.error('Error parsing notifications:', e);
      }
    }
    return initialNotifications;
  });

  const [workerLogs, setWorkerLogs] = useState(() => {
    const saved = localStorage.getItem('building_worker_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('building_current_user');
    return saved ? saved : null;
  });
  
  const [workers, setWorkers] = useState(() => {
    const saved = localStorage.getItem('building_workers_v3');
    return saved ? JSON.parse(saved) : [];
  });

  // Custom Dashboard & Sidebar Theme Customization
  const defaultThemeSettings = {
    adminSidebarBg: '#0F2A4A',       // Default Deep Navy
    workerSidebarBg: '#1E293B',      // Default Slate Charcoal
    sidebarActiveColor: '#D97706',   // Default Gold Amber
    dashboardPrimary: '#0F2A4A',     // Default Primary
    dashboardAccent: '#2563EB',      // Default Accent Blue
    dashboardBackground: '#F8FAFC',  // Default Light Slate
    themePreset: 'classic_navy'
  };

  const [themeSettings, setThemeSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('building_theme_settings_v1');
      return saved ? { ...defaultThemeSettings, ...JSON.parse(saved) } : defaultThemeSettings;
    } catch {
      return defaultThemeSettings;
    }
  });

  const updateThemeSettings = (newSettings) => {
    setThemeSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('building_theme_settings_v1', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const resetThemeSettings = () => {
    setThemeSettings(defaultThemeSettings);
    try {
      localStorage.setItem('building_theme_settings_v1', JSON.stringify(defaultThemeSettings));
    } catch (e) {}
  };

  // Responsive Sidebar & Hamburger Menu State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileSidebarOpen(prev => !prev);
    } else {
      setIsSidebarOpen(prev => !prev);
    }
  };

  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  // Real-Time Live Sync & Simulation State
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  const [lastLiveSync, setLastLiveSync] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [liveToasts, setLiveToasts] = useState([]);
  const [lastUpdatedAppId, setLastUpdatedAppId] = useState(null);

  // Helper to calculate luminance for contrast guard
  const getLuminance = (hexColor) => {
    if (!hexColor || typeof hexColor !== 'string') return 1;
    let color = hexColor.replace('#', '').trim();
    if (color.length === 3) {
      color = color.split('').map(c => c + c).join('');
    }
    if (color.length !== 6) return 1;
    const r = parseInt(color.substr(0, 2), 16) / 255;
    const g = parseInt(color.substr(2, 2), 16) / 255;
    const b = parseInt(color.substr(4, 2), 16) / 255;
    
    const a = [r, g, b].map(v => {
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  // Apply Live Theme CSS Variables with High-Contrast Canvas Protection
  useEffect(() => {
    const root = document.documentElement;
    const isWorker = currentUser && currentUser !== 'Admin';
    const activeSidebar = isWorker ? (themeSettings.workerSidebarBg || themeSettings.adminSidebarBg || '#0F2A4A') : (themeSettings.adminSidebarBg || '#0F2A4A');
    const primary = themeSettings.dashboardPrimary || '#0F2A4A';
    const activeColor = themeSettings.sidebarActiveColor || '#D97706';
    const accent = themeSettings.dashboardAccent || '#2563EB';
    const background = themeSettings.dashboardBackground || '#F8FAFC';

    // Contrast calculation
    const bgLuminance = getLuminance(background);
    const isDarkCanvas = bgLuminance < 0.45;

    root.style.setProperty('--primary', primary);
    root.style.setProperty('--primary-hover', primary);
    root.style.setProperty('--primary-light', `${primary}18`);
    root.style.setProperty('--sidebar-bg', activeSidebar);
    root.style.setProperty('--sidebar-active', activeColor);
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--background', background);
    root.style.setProperty('--surface', '#FFFFFF');

    // High Contrast Canvas Typography & Header Safeguards
    if (isDarkCanvas) {
      root.style.setProperty('--canvas-title', '#FFFFFF');
      root.style.setProperty('--canvas-sub', '#E2E8F0');
      root.style.setProperty('--canvas-pill-bg', 'rgba(255, 255, 255, 0.2)');
      root.style.setProperty('--canvas-pill-border', 'rgba(255, 255, 255, 0.4)');
      root.style.setProperty('--canvas-pill-text', '#FFFFFF');
      root.style.setProperty('--canvas-btn-bg', 'rgba(255, 255, 255, 0.18)');
      root.style.setProperty('--canvas-btn-border', 'rgba(255, 255, 255, 0.45)');
      root.style.setProperty('--canvas-btn-color', '#FFFFFF');
    } else {
      root.style.setProperty('--canvas-title', '#0F172A');
      root.style.setProperty('--canvas-sub', '#475569');
      root.style.setProperty('--canvas-pill-bg', '#FFFFFF');
      root.style.setProperty('--canvas-pill-border', '#CBD5E1');
      root.style.setProperty('--canvas-pill-text', '#16A34A');
      root.style.setProperty('--canvas-btn-bg', '#FFFFFF');
      root.style.setProperty('--canvas-btn-border', '#CBD5E1');
      root.style.setProperty('--canvas-btn-color', '#0F172A');
    }
    
    if (document.body) {
      document.body.style.backgroundColor = background;
    }
  }, [themeSettings, currentUser]);

  const resetToCleanData = () => {
    try {
      localStorage.removeItem('building_apps_v3');
      localStorage.removeItem('building_notifications');
      localStorage.removeItem('building_attendance_v1');
      saveAppsToIndexedDB(initialApplications);
    } catch (e) {}
    setApplications(initialApplications);
    setNotifications(initialNotifications);
    setAttendanceRecords(initialAttendance);
    setLiveToasts([]);
  };

  const pushLiveToast = (title, message, type = 'application') => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const id = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setLiveToasts(prev => [{ id, title, message, type, time: timeStr }, ...prev.slice(0, 2)]);

    setTimeout(() => {
      setLiveToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setLiveToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleRealTime = (val) => {
    setIsRealTimeEnabled(prev => typeof val === 'boolean' ? val : !prev);
  };

  const triggerRandomLiveEvent = () => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    setLastLiveSync(timeStr);

    const types = ['worker_checkin', 'doc_verify', 'stage_progress'];
    const chosenType = types[Math.floor(Math.random() * types.length)];

    if (chosenType === 'worker_checkin') {
      const fieldWorkers = ['Arun', 'Pooja', 'Kumar', 'Suresh'];
      const worker = fieldWorkers[Math.floor(Math.random() * fieldWorkers.length)];
      const todayStr = new Date().toISOString().split('T')[0];

      setAttendanceRecords(prev => {
        const existing = prev.find(r => r.workerId === worker && r.date === todayStr);
        if (!existing || existing.status === 'absent') {
          pushLiveToast('Worker Checked In', `Field Worker ${worker} checked in for daily inspections`, 'worker');
          addNotification('WORKER_ATTENDANCE', worker, `${worker} checked in at ${timeStr}.`, 'Admin');
          if (!existing) {
            return [...prev, {
              id: `att-${Date.now()}`,
              workerId: worker,
              workerName: worker,
              date: todayStr,
              checkIn: timeStr,
              checkOut: null,
              hours: null,
              status: 'present',
              timestamp: new Date().toISOString()
            }];
          } else {
            return prev.map(r => r.workerId === worker ? { ...r, status: 'present', checkIn: timeStr } : r);
          }
        } else {
          pushLiveToast('GPS Tracking Update', `${worker} updated active field location`, 'tracking');
          return prev;
        }
      });

    } else if (chosenType === 'doc_verify') {
      if (applications.length > 0) {
        const targetApp = applications[Math.floor(Math.random() * applications.length)];
        const pendingDoc = (targetApp.documents || []).find(d => d.status === 'pending');

        if (pendingDoc) {
          verifyDocument(targetApp.id, pendingDoc.id, 'verified');
          pushLiveToast('Document Verified', `"${pendingDoc.name}" verified for ${targetApp.id}`, 'document');
          addNotification('DOCUMENT_VERIFIED', targetApp.id, `Document "${pendingDoc.name}" verified by Admin.`, 'worker');
        } else {
          pushLiveToast('Live Data Stream', `Real-time database state synchronized`, 'application');
        }
      }
    } else if (chosenType === 'stage_progress') {
      if (applications.length > 0) {
        const appToUpdate = applications.find(a => a.stages && a.stages[2] && a.stages[2].status === 'Pending');
        if (appToUpdate) {
          updateStage(appToUpdate.id, 2, { status: 'Completed', remarks: 'NOC verification cleared', refNo: `NOC-${Math.floor(1000 + Math.random() * 9000)}` });
          pushLiveToast('Stage 2 Cleared', `${appToUpdate.id} passed NOC Clearance`, 'stage');
          addNotification('STAGE_UPDATED', appToUpdate.id, `Stage 2 completed for ${appToUpdate.id}`, 'Admin');
        } else {
          pushLiveToast('Live Stream Sync', `Real-time approval stream active`, 'application');
        }
      }
    }
  };

  useEffect(() => {
    if (!isRealTimeEnabled) return;

    const interval = setInterval(() => {
      triggerRandomLiveEvent();
    }, 13000);

    return () => clearInterval(interval);
  }, [isRealTimeEnabled, applications]);

  // Restore persistent uploaded documents from IndexedDB on startup BEFORE allowing saves
  useEffect(() => {
    getAppsFromIndexedDB().then(savedDBApps => {
      if (savedDBApps && Array.isArray(savedDBApps) && savedDBApps.length > 0) {
        setApplications(savedDBApps);
        try {
          localStorage.setItem('building_apps_v3', JSON.stringify(savedDBApps));
        } catch (e) {}
      } else {
        setApplications(initialApplications);
      }
      setIsHydrated(true);
    }).catch(() => {
      setIsHydrated(true);
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('building_attendance_v1', JSON.stringify(attendanceRecords));
    } catch (e) { console.error(e); }
  }, [attendanceRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('building_daily_reports_v1', JSON.stringify(dailyReports));
    } catch (e) { console.error(e); }
  }, [dailyReports]);

  // Only save applications after initial hydration is complete
  useEffect(() => {
    if (!isHydrated) return;

    saveAppsToIndexedDB(applications);
    try {
      localStorage.setItem('building_apps_v3', JSON.stringify(applications));
    } catch (e) {
      console.warn('localStorage size limit reached; applications saved into IndexedDB');
    }
  }, [applications, isHydrated]);
  
  useEffect(() => {
    try {
      localStorage.setItem('building_notifications', JSON.stringify(notifications));
    } catch (e) { console.error(e); }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('building_worker_logs', JSON.stringify(workerLogs));
    } catch (e) { console.error(e); }
  }, [workerLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('building_workers_v3', JSON.stringify(workers));
    } catch (e) { console.error(e); }
  }, [workers]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('building_current_user', currentUser);
      } else {
        localStorage.removeItem('building_current_user');
      }
    } catch (e) { console.error(e); }
  }, [currentUser]);

  const addNewWorker = (usernameOrData, password, email, phone, zone) => {
    let newWorker = {};
    if (typeof usernameOrData === 'object' && usernameOrData !== null) {
      newWorker = { ...usernameOrData };
    } else {
      newWorker = {
        username: usernameOrData,
        password,
        email: email || '',
        phone: phone || '',
        zone: zone || 'Central Zone, Chennai'
      };
    }

    if (newWorker.username && newWorker.password) {
      let cleanUsername = newWorker.username.trim();
      let cleanEmail = (newWorker.email || '').trim();

      // If username was provided as an email address (e.g. thirsha@gmail.com), separate clean name & email
      if (cleanUsername.includes('@')) {
        if (!cleanEmail) {
          cleanEmail = cleanUsername;
        }
        cleanUsername = cleanUsername.split('@')[0];
      }

      newWorker.username = cleanUsername;
      newWorker.email = cleanEmail || `${cleanUsername.toLowerCase()}@gmail.com`;

      setWorkers(prev => {
        const filtered = prev.filter(w => {
          const wUser = (w.username || '').toLowerCase();
          const wEmail = (w.email || '').toLowerCase();
          return wUser !== cleanUsername.toLowerCase() && wUser !== cleanEmail.toLowerCase() && (!cleanEmail || wEmail !== cleanEmail.toLowerCase());
        });
        return [...filtered, newWorker];
      });
      addNotification('WORKER_CREATED', cleanUsername, `New field worker "${cleanUsername}" registered successfully.`, 'Admin');
    }
  };
  
  const login = (identifier, password) => {
    if (!identifier || !password) return false;
    const cleanId = identifier.trim().toLowerCase();

    if (cleanId === 'admin' && password === 'admin') {
      setCurrentUser('Admin');
      return true;
    }
    
    const worker = workers.find(w => {
      const matchUser = w.username && w.username.toLowerCase() === cleanId;
      const matchEmail = w.email && w.email.toLowerCase() === cleanId;
      return (matchUser || matchEmail) && w.password === password;
    });

    if (worker) {
      const displayName = worker.username || worker.name;
      setCurrentUser(displayName);
      setWorkerLogs(logs => [...logs, { user: displayName, action: 'Login', timestamp: new Date().toISOString() }]);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (currentUser && currentUser !== 'Admin') {
      setWorkerLogs(logs => [...logs, { user: currentUser, action: 'Logout', timestamp: new Date().toISOString() }]);
    }
    setCurrentUser(null);
  };

  // Real-Time Email Dispatcher using Brevo Backend
  const sendBrevoRegistrationEmail = async (appDetails) => {
    try {
      const email = appDetails.email || appDetails.toEmail;
      if (!email || !email.includes('@')) {
        console.warn('Cannot send Brevo email: Invalid or missing email address', email);
        return { success: false, error: 'Valid customer email is required' };
      }

      const appId = appDetails.id || appDetails.applicationId;
      const applicantName = appDetails.applicantName || appDetails.name || 'Valued Citizen';
      const payload = {
        email: email,
        applicantName: applicantName,
        applicationId: appId,
        location: appDetails.location || appDetails.district || 'Tamil Nadu',
        buildingType: appDetails.buildingType || 'Residential',
        workerName: appDetails.workerName || appDetails.workerId || currentUser || 'Field Officer',
        uploadUrl: `${window.location.origin}/customer-upload/${appId}`,
        trackingUrl: `${window.location.origin}/track`
      };

      const res = await fetch('http://localhost:5000/api/brevo/send-registration-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setApplications(prev => prev.map(a => {
          if (a.id === appId) {
            return {
              ...a,
              history: [
                ...(a.history || []),
                {
                  date: new Date().toISOString(),
                  action: `📧 Real-time confirmation email delivered to ${email} via Brevo`,
                  by: 'Brevo Mailer'
                }
              ]
            };
          }
          return a;
        }));

        addNotification(
          'EMAIL_SENT',
          appId,
          `Brevo confirmation email delivered to ${email} for application ${appId}`,
          currentUser || 'Worker'
        );

        return { success: true, message: `Email delivered to ${email}`, data };
      } else {
        return { success: false, error: data.error || 'Failed to dispatch email' };
      }
    } catch (err) {
      console.error('Brevo API dispatch error:', err);
      return { success: false, error: err.message };
    }
  };

  const sendBrevoCustomEmail = async ({ toEmail, toName, subject, message, htmlContent }) => {
    try {
      const res = await fetch('http://localhost:5000/api/brevo/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toEmail, toName, subject, message, htmlContent })
      });
      const data = await res.json();
      return { success: res.ok, data, error: data.error };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const addApplication = (appData) => {
    const newId = `BA-2026-${String(applications.length + 125).padStart(6, '0')}`;
    const worker = appData.workerId || currentUser || 'Pooja';
    const newApp = {
      ...appData,
      id: newId,
      workerId: worker,
      workerName: worker,
      assignedWorker: worker,
      createdAt: new Date().toISOString(),
      status: 'pending',
      stages: {
        1: { status: 'Pending', completedDate: null, by: null, remarks: '' },
        2: { status: 'Pending', completedDate: null, by: null, remarks: '', refNo: '' },
        3: { status: 'Pending', completedDate: null, by: null, remarks: '', refNo: '' },
        4: { status: 'Pending', completedDate: null, by: null, remarks: '', visitDate: '', officerName: '' },
        5: { status: 'Pending', completedDate: null, by: null, remarks: '', finalNo: '' },
      },
      documents: [],
      history: [
        { date: new Date().toISOString(), action: 'Application Created', by: currentUser }
      ],
      requiredDocs: [
        "Land / Sale Deed",
        "Patta / Chitta",
        "Encumbrance Certificate (EC)",
        "Approved / Proposed Building Plan",
        "Site Plan",
        "Applicant ID Proof",
        "Property Tax Receipt",
        "Ownership Proof",
        "Site / Property Photos",
        "Previous Approval / Permission (if applicable)"
      ]
    };
    setApplications([...applications, newApp]);

    // Automatically trigger Brevo real-time email if customer email is provided
    if (appData.email && appData.email.includes('@')) {
      sendBrevoRegistrationEmail({
        ...newApp,
        id: newId
      });
    }

    return newId;
  };

  const evaluateAppStatus = (app) => {
    if (!app) return 'submitted';
    if (app.status === 'approved' || app.status === 'rejected') return app.status;
    
    if (app.siteVisitCompleted || app.stages?.[4]?.status === 'Completed' || app.status === 'site_visit_completed') {
      return 'site_visit_completed';
    }

    const docs = app.documents || [];
    if (docs.length > 0) {
      const allVerified = docs.every(d => d.status === 'verified');
      if (allVerified) {
        return 'documents_verified';
      }
      return 'documents_under_review';
    }

    return 'submitted';
  };

  const updateAppStatus = (appId, newStatus) => {
    setApplications(apps => apps.map(app => {
      if (app.id === appId) {
        return { ...app, status: newStatus };
      }
      return app;
    }));
  };

  // Section 40.8 Security Rule 🔐 — Public Customer Status Filter (Excludes workerId, internal notes & user IDs)
  const getPublicCustomerStatus = (appId) => {
    const cleanId = (appId || '').trim().toUpperCase();
    const app = applications.find(a => a && a.id && a.id.toUpperCase() === cleanId);
    if (!app) return null;

    return {
      applicationNumber: app.id,
      applicantName: app.applicantName,
      applicationDate: app.createdAt,
      status: app.status || 'documents_under_review',
      siteVisitCompleted: app.siteVisitCompleted || false,
      rejectionReason: app.rejectionReason || null,
      documents: (app.documents || []).map(d => ({
        name: d.name,
        status: d.status,
        rejectedReason: d.rejectedReason || null
      })),
      customerMessage: app.status === 'approved' 
        ? '🎉 Your building approval application has been approved.'
        : app.status === 'rejected'
        ? `✕ Application Rejected. Reason: ${app.rejectionReason || 'Required property documents could not be verified.'}`
        : app.status === 'site_visit_completed'
        ? 'Site visit has been completed. Your application is waiting for final approval.'
        : app.status === 'documents_verified'
        ? 'All required documents have been verified. Your application is ready for the site visit.'
        : 'Your documents are currently being reviewed. Please wait for the verification process to complete.'
    };
  };

  const updateStage = (appId, stageNumber, data) => {
    setApplications(apps => apps.map(app => {
      if (app.id === appId) {
        const updatedApp = { ...app };
        updatedApp.stages[stageNumber] = { 
          ...updatedApp.stages[stageNumber], 
          ...data,
          by: currentUser 
        };
        
        // Log history
        updatedApp.history.push({
          date: new Date().toISOString(),
          action: `Stage ${stageNumber} updated to ${data.status}`,
          by: currentUser
        });

        // Special overrides for stage 5 (Final Approval)
        if (stageNumber === 5) {
           if (data.status === 'Approved') updatedApp.status = 'approved';
           else if (data.status === 'Rejected') updatedApp.status = 'rejected';
        } else {
           updatedApp.status = evaluateAppStatus(updatedApp);
        }

        return updatedApp;
      }
      return app;
    }));
  };

  const addDocument = (appId, documentName, fileBase64) => {
    setApplications(apps => apps.map(app => {
      if (app.id === appId) {
        const updatedApp = { ...app, documents: [...app.documents], history: [...app.history] };
        const existingDocIndex = updatedApp.documents.findIndex(d => d.name === documentName);
        
        const docData = {
          id: Date.now().toString(),
          name: documentName,
          file: fileBase64,
          uploadDate: new Date().toISOString(),
          status: 'pending',
          verifiedBy: null,
          verifiedAt: null,
          rejectedReason: null
        };
        
        if (existingDocIndex >= 0) {
          updatedApp.documents[existingDocIndex] = docData;
        } else {
          updatedApp.documents.push(docData);
        }
        
        updatedApp.history.push({
          date: new Date().toISOString(),
          action: `Document uploaded: ${documentName}`,
          by: 'Customer'
        });
        updatedApp.status = evaluateAppStatus(updatedApp);
        return updatedApp;
      }
      return app;
    }));
  };

  const verifyDocument = (appId, docId, status, rejectedReason = '') => {
    setApplications(apps => apps.map(app => {
      if (app.id === appId) {
        const updatedApp = { ...app };
        updatedApp.documents = updatedApp.documents.map(doc => 
          doc.id === docId ? { 
            ...doc, 
            status: status, 
            verifiedBy: currentUser,
            verifiedAt: new Date().toISOString(),
            rejectedReason: status === 'reupload_required' ? rejectedReason : null
          } : doc
        );
        
        updatedApp.history.push({
          date: new Date().toISOString(),
          action: `Document ${status}: ${updatedApp.documents.find(d => d.id === docId)?.name}`,
          by: currentUser
        });
        updatedApp.status = evaluateAppStatus(updatedApp);
        return updatedApp;
      }
      return app;
    }));
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => {
      if (currentUser === 'Admin' && n.role === 'Admin') return { ...n, read: true };
      if (currentUser !== 'Admin' && n.role !== 'Admin') return { ...n, read: true };
      return n;
    }));
  };

  const addNotification = (type, targetId, message, role) => {
    const uniqueId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setNotifications(prev => [{
      id: uniqueId,
      type,
      targetId,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      role
    }, ...prev]);
  };

  const checkInWorker = (workerUsername) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    const existingIndex = attendanceRecords.findIndex(r => (r.workerId === workerUsername || r.workerName === workerUsername) && r.date === todayStr);
    
    if (existingIndex >= 0) {
      return attendanceRecords[existingIndex];
    }
    
    const newRecord = {
      id: `att-${Date.now()}`,
      workerId: workerUsername,
      workerName: workerUsername,
      date: todayStr,
      checkIn: timeStr,
      checkOut: null,
      hours: null,
      status: 'present',
      timestamp: new Date().toISOString()
    };
    
    setAttendanceRecords(prev => [...prev, newRecord]);
    return newRecord;
  };

  const checkOutWorker = (workerUsername) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    setAttendanceRecords(prev => prev.map(rec => {
      if ((rec.workerId === workerUsername || rec.workerName === workerUsername) && rec.date === todayStr && !rec.checkOut) {
        let hoursDiffStr = '8h 50m';
        try {
          const checkInDate = rec.timestamp ? new Date(rec.timestamp) : new Date();
          const now = new Date();
          const diffMs = Math.max(0, now - checkInDate);
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          hoursDiffStr = hours > 0 || mins > 0 ? `${hours}h ${mins}m` : '8h 50m';
        } catch (e) {}

        return {
          ...rec,
          checkOut: timeStr,
          hours: hoursDiffStr,
          status: 'present'
        };
      }
      return rec;
    }));
  };

  const submitDailyReport = (reportData) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newReport = {
      id: `rep-${Date.now()}`,
      workerId: currentUser,
      workerName: currentUser,
      date: todayStr,
      applicationsHandled: Number(reportData.applicationsHandled || 0),
      customerVisits: Number(reportData.customerVisits || 0),
      siteVisitsCompleted: Number(reportData.siteVisitsCompleted || 0),
      documentsReviewed: Number(reportData.documentsReviewed || 0),
      description: reportData.description || '',
      status: 'submitted',
      submittedAt: timeStr,
      timestamp: new Date().toISOString()
    };

    setDailyReports(prev => [newReport, ...prev]);
    return newReport;
  };

  const getWorkerTodayMetrics = (workerUsername) => {
    const workerApps = applications.filter(a => (a.workerId === workerUsername || a.assignedWorker === workerUsername));
    
    let totalDocsReviewed = 0;
    workerApps.forEach(app => {
      totalDocsReviewed += (app.documents || []).filter(d => d.status === 'verified').length;
    });

    return {
      applicationsHandled: workerApps.length || 5,
      customerVisits: 3,
      siteVisitsCompleted: 2,
      documentsReviewed: totalDocsReviewed || 8
    };
  };

  const addCustomerApplication = (customerData, uploadedDocsMap = {}) => {
    const count = applications.filter(a => a.id.startsWith('APP-') || a.id.startsWith('BA-')).length + 125;
    const newId = `APP-2026-${String(count).padStart(5, '0')}`;
    
    const defaultRequiredDocs = [
      "Sale Deed",
      "Patta",
      "EC Certificate",
      "Approved Plan",
      "Property Tax Receipt",
      "Aadhaar / ID Proof",
      "Site Plan",
      "Ownership Document"
    ];

    const documentsArray = Object.keys(uploadedDocsMap).map((docName, idx) => ({
      id: `doc-cust-${Date.now()}-${idx}`,
      name: docName,
      file: uploadedDocsMap[docName],
      uploadDate: new Date().toISOString(),
      status: 'pending',
      verifiedBy: null,
      verifiedAt: null,
      rejectedReason: null
    }));

    const newApp = {
      id: newId,
      applicantName: customerData.fullName || customerData.applicantName || 'Applicant',
      mobile: customerData.mobile || '',
      email: customerData.email || '',
      address: customerData.address || '',
      district: customerData.district || 'Chennai',
      taluk: customerData.taluk || '',
      village: customerData.village || '',
      surveyNumber: customerData.surveyNumber || '',
      buildingType: customerData.buildingType || 'Residential',
      buildingDetails: {
        plotArea: customerData.plotArea || '1200 sq.ft',
        builtUpArea: customerData.builtUpArea || '2100 sq.ft',
        fsi: customerData.fsi || '1.75',
        noOfFloors: customerData.noOfFloors || 'G+2'
      },
      projectName: `${customerData.buildingType || 'Residential'} Building Permit`,
      location: `${customerData.village || customerData.taluk || 'City Zone'}, ${customerData.district || 'Chennai'}`,
      workerId: null, // CRITICAL: Customer public direct application has workerId = null (ONLY visible to Admin)
      workerName: null,
      assignedWorker: 'Unassigned (Customer Public)',
      source: 'Customer Public',
      createdAt: new Date().toISOString(),
      status: 'under_review',
      stages: {
        1: { status: 'Completed', completedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), by: 'Customer' },
        2: { status: 'Completed', completedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), by: 'Customer' },
        3: { status: 'In Progress', completedDate: null, by: null },
        4: { status: 'Pending', completedDate: null, by: null },
        5: { status: 'Pending', completedDate: null, by: null }
      },
      documents: documentsArray,
      history: [
        { date: new Date().toISOString(), action: 'Application Submitted Online via Public Portal', by: 'Customer' }
      ],
      requiredDocs: defaultRequiredDocs
    };

    setApplications(prev => [newApp, ...prev]);
    addNotification('NEW_APPLICATION', newId, `New Customer Application submitted: ${newApp.applicantName} (${newId})`, 'Admin');

    if (customerData.email && customerData.email.includes('@')) {
      sendBrevoRegistrationEmail({
        ...newApp,
        id: newId,
        email: customerData.email,
        applicantName: newApp.applicantName
      });
    }

    return newId;
  };

  const reuploadCustomerDocument = (appId, docName, fileBase64) => {
    setApplications(apps => apps.map(app => {
      if (app.id === appId) {
        const updatedDocs = (app.documents || []).map(d => {
          if (d.name === docName) {
            return {
              ...d,
              file: fileBase64,
              uploadDate: new Date().toISOString(),
              status: 'pending',
              rejectedReason: null,
              verifiedBy: null
            };
          }
          return d;
        });

        const docExists = updatedDocs.some(d => d.name === docName);
        if (!docExists) {
          updatedDocs.push({
            id: `doc-reup-${Date.now()}`,
            name: docName,
            file: fileBase64,
            uploadDate: new Date().toISOString(),
            status: 'pending',
            verifiedBy: null,
            verifiedAt: null,
            rejectedReason: null
          });
        }
        
        const updatedHistory = [
          ...app.history,
          { date: new Date().toISOString(), action: `Document re-uploaded: ${docName}`, by: 'Customer' }
        ];

        addNotification('DOCUMENT_REUPLOADED', appId, `Customer re-uploaded document "${docName}" for ${appId}`, 'Admin');
        return { ...app, documents: updatedDocs, history: updatedHistory };
      }
      return app;
    }));
  };

  return (
    <AppContext.Provider value={{ 
      applications, 
      workerLogs,
      currentUser, 
      workers,
      addNewWorker,
      login,
      logout,
      addApplication, 
      addCustomerApplication,
      sendBrevoRegistrationEmail,
      sendBrevoCustomEmail,
      reuploadCustomerDocument,
      getPublicCustomerStatus,
      evaluateAppStatus,
      updateAppStatus,
      updateStage,
      addDocument,
      verifyDocument,
      notifications,
      markAsRead,
      markAllAsRead,
      addNotification,
      attendanceRecords,
      setAttendanceRecords,
      checkInWorker,
      checkOutWorker,
      dailyReports,
      submitDailyReport,
      getWorkerTodayMetrics,
      isRealTimeEnabled,
      setIsRealTimeEnabled,
      toggleRealTime,
      lastLiveSync,
      liveToasts,
      removeToast,
      triggerRandomLiveEvent,
      lastUpdatedAppId,
      themeSettings,
      updateThemeSettings,
      resetThemeSettings,
      isSidebarOpen,
      setIsSidebarOpen,
      isMobileSidebarOpen,
      setIsMobileSidebarOpen,
      toggleSidebar,
      closeMobileSidebar,
      resetToCleanData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

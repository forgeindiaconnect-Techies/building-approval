import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  UserPlus, 
  Eye, 
  EyeOff, 
  Search, 
  CheckCircle2, 
  HardHat, 
  Briefcase, 
  FileText, 
  Shield, 
  Key, 
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Workers() {
  const { workers = [], addNewWorker, applications = [], attendanceRecords = [] } = useApp();
  const navigate = useNavigate();
  
  const [showModal, setShowModal] = useState(false);
  const [newWorkerUsername, setNewWorkerUsername] = useState('');
  const [newWorkerEmail, setNewWorkerEmail] = useState('');
  const [newWorkerPassword, setNewWorkerPassword] = useState('');
  const [newWorkerPhone, setNewWorkerPhone] = useState('');
  const [newWorkerZone, setNewWorkerZone] = useState('Central Zone, Chennai');
  const [showPassword, setShowPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const togglePasswordVisibility = (username) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [username]: !prev[username]
    }));
  };

  // Build worker profile data
  const workerList = workers.length > 0 
    ? workers 
    : [
        { username: 'Pooja', email: 'pooja@gmail.com', password: 'password123', zone: 'South Zone, Chennai', phone: '9876543210' },
        { username: 'Arun', email: 'arun@gmail.com', password: 'password123', zone: 'North Zone, Chennai', phone: '9876543211' },
        { username: 'Kumar', email: 'kumar@gmail.com', password: 'password123', zone: 'Central Zone, Chennai', phone: '9876543212' },
        { username: 'Suresh', email: 'suresh@gmail.com', password: 'password123', zone: 'West Zone, Chennai', phone: '9876543213' }
      ];

  const enrichedWorkers = workerList.map(w => {
    const rawUser = w.username || w.name || '';
    const cleanUsername = rawUser.includes('@') ? rawUser.split('@')[0] : rawUser;
    const cleanEmail = w.email || (rawUser.includes('@') ? rawUser : `${cleanUsername.toLowerCase()}@gmail.com`);

    const workerApps = applications.filter(a => a && (a.workerId === cleanUsername || a.assignedWorker === cleanUsername || a.workerId === rawUser || a.assignedWorker === rawUser));
    const isPresentToday = attendanceRecords.some(r => (r.workerId === cleanUsername || r.workerName === cleanUsername || r.workerId === rawUser || r.workerName === rawUser) && r.date === todayStr && r.status === 'present');
    
    let docsVerified = 0;
    workerApps.forEach(a => {
      docsVerified += (a.documents || []).filter(d => d.status === 'verified').length;
    });

    return {
      ...w,
      username: cleanUsername,
      email: cleanEmail,
      appsCount: workerApps.length,
      docsVerified,
      isPresentToday
    };
  });

  const filteredWorkers = enrichedWorkers.filter(w => 
    w.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.email && w.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeOnDutyCount = enrichedWorkers.filter(w => w.isPresentToday).length;
  const totalAssignedApps = enrichedWorkers.reduce((acc, curr) => acc + curr.appsCount, 0);

  const handleAddWorker = (e) => {
    e.preventDefault();
    if (newWorkerUsername.trim() && newWorkerPassword.trim()) {
      addNewWorker({
        username: newWorkerUsername.trim(),
        email: newWorkerEmail.trim() || `${newWorkerUsername.trim().toLowerCase()}@gmail.com`,
        password: newWorkerPassword.trim(),
        phone: newWorkerPhone.trim()
      });
      setNewWorkerUsername('');
      setNewWorkerEmail('');
      setNewWorkerPassword('');
      setNewWorkerPhone('');
      setShowModal(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      
      {/* Top Header Banner */}
      <div 
        style={{ 
          backgroundColor: '#ffffff', 
          border: '1px solid var(--border)', 
          padding: '1.5rem 1.75rem', 
          borderRadius: '16px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1rem' 
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ 
              padding: '0.2rem 0.6rem', 
              borderRadius: '999px', 
              fontSize: '0.72rem', 
              fontWeight: 700, 
              backgroundColor: '#f5f3ff', 
              color: '#7c3aed',
              border: '1px solid #ddd6fe'
            }}>
              FIELD FORCE DIRECTORY
            </span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--canvas-title, #0F172A)', margin: 0 }}>
            Worker Management & Access
          </h2>
          <p style={{ color: 'var(--canvas-sub, #475569)', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>
            Manage municipal field inspection officers, credentials, and geographic assignments.
          </p>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={() => setShowModal(true)}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.55rem 1.15rem', 
            fontSize: '0.85rem', 
            fontWeight: 700,
            borderRadius: '10px'
          }}
        >
          <UserPlus size={16} /> Add Field Worker
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        
        {/* Total Workers */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '14px', 
          border: '1px solid var(--border)', 
          padding: '1.15rem 1.25rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Registered
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem', lineHeight: 1 }}>
              {enrichedWorkers.length}
            </div>
          </div>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '12px', 
            backgroundColor: '#eff6ff', 
            color: 'var(--primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Users size={22} />
          </div>
        </div>

        {/* Active On Duty */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '14px', 
          border: '1px solid #bbf7d0', 
          padding: '1.15rem 1.25rem',
          boxShadow: '0 2px 8px rgba(34, 197, 94, 0.08)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div>
            <span style={{ fontSize: '0.725rem', color: '#15803d', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Active on Duty Today
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#16a34a', marginTop: '0.2rem', lineHeight: 1 }}>
              {activeOnDutyCount}
            </div>
          </div>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '12px', 
            backgroundColor: '#f0fdf4', 
            color: '#16a34a', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid #bbf7d0'
          }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Total Assigned Applications */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '14px', 
          border: '1px solid var(--border)', 
          padding: '1.15rem 1.25rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Applications Assigned
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem', lineHeight: 1 }}>
              {totalAssignedApps}
            </div>
          </div>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '12px', 
            backgroundColor: '#f8fafc', 
            color: '#475569', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Briefcase size={22} />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div 
        style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '14px', 
          border: '1px solid var(--border)', 
          padding: '0.85rem 1.25rem',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-control"
            placeholder="Search field worker by username or zone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              paddingLeft: '2.25rem', 
              fontSize: '0.85rem', 
              borderRadius: '999px',
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border)'
            }}
          />
        </div>

        <button 
          className="btn btn-outline" 
          onClick={() => navigate('/admin/worker-tracking')}
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.95rem', fontWeight: 700, borderRadius: '8px' }}
        >
          View Live Field Tracking →
        </button>
      </div>

      {/* Workers Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filteredWorkers.map(w => (
          <div 
            key={w.username}
            style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '16px', 
              border: '1px solid var(--border)',
              padding: '1.35rem',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease'
            }}
            className="doc-card-hover"
          >
            <div>
              {/* Header: Avatar + Name + Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '46px', 
                    height: '46px', 
                    borderRadius: '14px', 
                    backgroundColor: 'var(--primary)', 
                    color: '#ffffff',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '1.15rem',
                    fontWeight: 800
                  }}>
                    {w.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      {w.username}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
                      <Mail size={12} /> {w.email || `${w.username.toLowerCase()}@gmail.com`}
                    </div>
                  </div>
                </div>

                {/* Duty Status Badge */}
                <span style={{ 
                  padding: '0.2rem 0.55rem', 
                  borderRadius: '999px', 
                  fontSize: '0.7rem', 
                  fontWeight: 700, 
                  backgroundColor: w.isPresentToday ? '#ecfdf5' : '#f8fafc',
                  color: w.isPresentToday ? '#059669' : '#64748b',
                  border: w.isPresentToday ? '1px solid #a7f3d0' : '1px solid #e2e8f0'
                }}>
                  {w.isPresentToday ? '● Checked In' : '○ Off Duty'}
                </span>
              </div>

              {/* Zone / Location & Phone */}
              <div style={{ marginBottom: '1rem', padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.785rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', fontWeight: 600 }}>
                  <MapPin size={13} style={{ color: 'var(--primary)' }} />
                  <span>{w.zone || 'Central Zone, Chennai'}</span>
                </div>
                {w.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)' }}>
                    <Phone size={12} />
                    <span>{w.phone}</span>
                  </div>
                )}
              </div>

              {/* Task Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.65rem', backgroundColor: '#eff6ff', borderRadius: '10px', border: '1px solid #dbeafe', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>Assigned Apps</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a', marginTop: '0.15rem' }}>{w.appsCount}</div>
                </div>
                <div style={{ padding: '0.65rem', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #dcfce7', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Verified Docs</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#14532d', marginTop: '0.15rem' }}>{w.docsVerified}</div>
                </div>
              </div>

              {/* Login Credentials Section */}
              <div style={{ 
                padding: '0.65rem 0.85rem', 
                backgroundColor: '#ffffff', 
                borderRadius: '10px', 
                border: '1px solid #e2e8f0',
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                fontSize: '0.785rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                  <Key size={13} />
                  <span>Password:</span>
                  <strong style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '0.85rem', 
                    color: 'var(--text-main)', 
                    letterSpacing: visiblePasswords[w.username] ? 'normal' : '0.15em' 
                  }}>
                    {visiblePasswords[w.username] ? w.password : '••••••••'}
                  </strong>
                </div>

                <button 
                  onClick={() => togglePasswordVisibility(w.username)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '0.2rem', display: 'flex', alignItems: 'center' }}
                  title="Toggle password display"
                >
                  {visiblePasswords[w.username] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border)' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => navigate('/admin/attendance')}
                style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.76rem', fontWeight: 700, borderRadius: '8px' }}
              >
                Attendance Log
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => navigate('/admin/worker-tracking')}
                style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.76rem', fontWeight: 700, borderRadius: '8px' }}
              >
                Live Tracking
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Worker Modal */}
      {showModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(0,0,0,0.6)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          zIndex: 1200,
          padding: '1.25rem'
        }}>
          <div style={{ 
            width: '100%', 
            maxWidth: '460px', 
            backgroundColor: '#ffffff', 
            borderRadius: '16px', 
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <UserPlus size={20} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Register New Field Worker</h3>
              </div>
              <button 
                onClick={() => { setShowModal(false); setNewWorkerUsername(''); setNewWorkerEmail(''); setNewWorkerPassword(''); setNewWorkerPhone(''); }}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddWorker} style={{ padding: '1.5rem' }} autoComplete="off">
              {/* Dummy decoy inputs to prevent browser password managers from auto-filling credentials into the registration form */}
              <input type="text" name="decoy_reg_user" style={{ display: 'none' }} tabIndex="-1" autoComplete="off" />
              <input type="password" name="decoy_reg_pass" style={{ display: 'none' }} tabIndex="-1" autoComplete="new-password" />

              {/* Field 1: Worker Username */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.785rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem', display: 'block' }}>
                  Worker Username *
                </label>
                <input 
                  type="text" 
                  name="worker_reg_username_field"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  className="form-control" 
                  value={newWorkerUsername} 
                  onChange={(e) => {
                    let val = e.target.value;
                    // If user pastes or types email, split username & email
                    if (val.includes('@') && !newWorkerEmail) {
                      setNewWorkerEmail(val);
                      val = val.split('@')[0];
                    }
                    setNewWorkerUsername(val);
                  }} 
                  placeholder="e.g. thirsha"
                  required
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              {/* Field 2: Worker Email Address */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.785rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem', display: 'block' }}>
                  Worker Email Address *
                </label>
                <input 
                  type="email" 
                  name="worker_reg_email_field"
                  autoComplete="off"
                  className="form-control" 
                  value={newWorkerEmail} 
                  onChange={(e) => setNewWorkerEmail(e.target.value)} 
                  placeholder="e.g. thirsha@gmail.com"
                  required
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              {/* Field 3: Login Password */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.785rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem', display: 'block' }}>
                  Login Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    name="worker_reg_password_field"
                    autoComplete="new-password"
                    className="form-control" 
                    value={newWorkerPassword} 
                    onChange={(e) => setNewWorkerPassword(e.target.value)} 
                    placeholder="Enter login password"
                    required
                    style={{ paddingRight: '2.5rem', fontSize: '0.85rem' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Field 4: Contact Mobile Number */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontSize: '0.785rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem', display: 'block' }}>
                  Contact Mobile Number
                </label>
                <input 
                  type="tel" 
                  name="worker_reg_phone_field"
                  autoComplete="off"
                  className="form-control" 
                  value={newWorkerPhone} 
                  onChange={(e) => setNewWorkerPhone(e.target.value)} 
                  placeholder="e.g. 9876543210"
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => { setShowModal(false); setNewWorkerUsername(''); setNewWorkerEmail(''); setNewWorkerPassword(''); setNewWorkerPhone(''); }}
                  style={{ fontSize: '0.825rem', padding: '0.5rem 1rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ fontSize: '0.825rem', padding: '0.5rem 1.25rem', fontWeight: 700 }}
                >
                  Create Worker Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

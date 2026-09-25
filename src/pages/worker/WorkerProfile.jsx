import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Mail, Phone, MapPin, Building, ShieldCheck, LogOut, Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WorkerProfile() {
  const { currentUser, logout, applications, attendanceRecords, dailyReports } = useApp();
  const navigate = useNavigate();

  // Format current worker name nicely
  const workerDisplayName = currentUser === 'Pooja' || currentUser === 'pooja@gmail.com' ? 'Pooja' : currentUser;

  const workerApps = applications.filter(app => {
    if (!app.workerId || app.workerId === null || app.source === 'Customer Public') return false;
    return app.workerId === currentUser || 
           app.assignedWorker === currentUser || 
           app.workerId === workerDisplayName || 
           app.assignedWorker === workerDisplayName;
  });
  const myAttendance = attendanceRecords.filter(r => r.workerId === currentUser || r.workerName === currentUser);
  const myReports = dailyReports.filter(r => r.workerId === currentUser || r.workerName === currentUser);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ paddingBottom: '2.5rem' }}>

      {/* Header Banner - Compact Typography */}
      <div style={{
        background: 'linear-gradient(135deg, #003366 0%, #004080 100%)',
        color: 'white',
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
            <span style={{ backgroundColor: 'rgba(255,255,255,0.18)', padding: '0.15rem 0.55rem', borderRadius: '14px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px' }}>
              OFFICIAL PERSONNEL FILE
            </span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>•</span>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.78rem' }}>ID: WRK-2026-089</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#ffffff', letterSpacing: '-0.01em' }}>
            Field Officer Profile
          </h2>
          <p style={{ margin: '0.2rem 0 0 0', color: 'rgba(255,255,255,0.85)', fontSize: '0.825rem' }}>
            Department of Municipal Administration & Building Approval
          </p>
        </div>

        <button 
          onClick={handleLogout}
          style={{
            backgroundColor: '#dc2626',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.55rem 1rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            boxShadow: '0 3px 10px rgba(220, 38, 38, 0.25)'
          }}
        >
          <LogOut size={14} /> Logout Account
        </button>
      </div>

      {/* Profile & Performance Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
        
        {/* Worker Info Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          borderLeft: '5px solid #003366',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          padding: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#003366',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 800,
              lineHeight: 1,
              textAlign: 'center',
              boxShadow: '0 3px 8px rgba(0,51,102,0.2)'
            }}>
              {workerDisplayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {workerDisplayName}
              </h3>
              <span style={{
                backgroundColor: '#e6f0fa',
                color: '#003366',
                fontWeight: 700,
                fontSize: '0.75rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                display: 'inline-block',
                marginTop: '0.2rem'
              }}>
                Verification & Field Officer
              </span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            fontSize: '0.825rem',
            color: '#334155',
            backgroundColor: '#f8fafc',
            padding: '1rem',
            borderRadius: '10px',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={14} color="#003366" />
              <strong>Email:</strong> pooja@gmail.com
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={14} color="#003366" />
              <strong>Contact:</strong> +91 98765 43210
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={14} color="#003366" />
              <strong>Dept:</strong> Municipal Building Approval
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={14} color="#003366" />
              <strong>Assigned Zone:</strong> Chennai South Zone 4
            </div>
          </div>
        </div>

        {/* Performance Overview Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Award size={18} color="#FF9933" /> Performance Scorecard
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: '#e6f0fa', padding: '0.75rem', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#003366', textTransform: 'uppercase' }}>Applications</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#003366', marginTop: '0.1rem' }}>{workerApps.length}</div>
              </div>

              <div style={{ backgroundColor: '#e7f5e8', padding: '0.75rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#138808', textTransform: 'uppercase' }}>Attendance</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#138808', marginTop: '0.1rem' }}>{myAttendance.length} Days</div>
              </div>

              <div style={{ backgroundColor: '#fff5e6', padding: '0.75rem', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>Daily Reports</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706', marginTop: '0.1rem' }}>{myReports.length} Submitted</div>
              </div>

              <div style={{ backgroundColor: '#f3e8ff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e9d5ff' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase' }}>Quality Rating</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#8b5cf6', marginTop: '0.1rem' }}>4.9 ★</div>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#f8fafc',
            padding: '0.65rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '0.785rem',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <ShieldCheck size={14} color="#138808" /> Official Staff Account • Active Status
          </div>
        </div>
      </div>

    </div>
  );
}

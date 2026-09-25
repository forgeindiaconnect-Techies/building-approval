import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CheckCircle, Clock, LogIn, LogOut, Award, MapPin, UserCheck
} from 'lucide-react';

export default function WorkerAttendance() {
  const { currentUser, attendanceRecords, checkInWorker, checkOutWorker } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Live clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const dateFormatted = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const timeFormatted = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Format current worker name nicely (e.g. thirsha@gmail.com -> Thirsha)
  const cleanWorkerName = currentUser ? (currentUser.includes('@') ? currentUser.split('@')[0] : currentUser) : 'Worker';
  const workerDisplayName = cleanWorkerName.replace(/^\w/, c => c.toUpperCase());

  // Get today's record for logged in worker
  const todayRecord = attendanceRecords.find(r => {
    if (r.date !== todayStr) return false;
    const rId = (r.workerId || '').toLowerCase();
    const rName = (r.workerName || '').toLowerCase();
    const userLow = (currentUser || '').toLowerCase();
    const cleanLow = cleanWorkerName.toLowerCase();
    return rId === userLow || rName === userLow || rId === cleanLow || rName === cleanLow ||
           (rId.includes('@') && rId.split('@')[0] === cleanLow) ||
           (rName.includes('@') && rName.split('@')[0] === cleanLow);
  });

  // Get history records for logged in worker
  const myHistory = attendanceRecords.filter(r => {
    const rId = (r.workerId || '').toLowerCase();
    const rName = (r.workerName || '').toLowerCase();
    const userLow = (currentUser || '').toLowerCase();
    const cleanLow = cleanWorkerName.toLowerCase();
    return rId === userLow || rName === userLow || rId === cleanLow || rName === cleanLow ||
           (rId.includes('@') && rId.split('@')[0] === cleanLow) ||
           (rName.includes('@') && rName.split('@')[0] === cleanLow);
  });

  const isCheckedIn = !!todayRecord;
  const isCheckedOut = !!(todayRecord && todayRecord.checkOut);

  const handleCheckIn = () => {
    checkInWorker(workerDisplayName);
  };

  const handleCheckOut = () => {
    checkOutWorker(workerDisplayName);
  };

  return (
    <div style={{ paddingBottom: '2.5rem' }}>

      {/* Header Banner - Clean White Card */}
      <div className="card" style={{
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.25rem',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ 
              backgroundColor: 'var(--primary-light, #f1f5f9)', 
              color: 'var(--primary, #0f2a4a)',
              padding: '0.2rem 0.6rem', 
              borderRadius: '6px', 
              fontSize: '0.7rem', 
              fontWeight: 700, 
              letterSpacing: '0.5px' 
            }}>
              STAFF ATTENDANCE PORTAL
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>•</span>
            <span style={{ color: '#475569', fontSize: '0.8rem', fontWeight: 600 }}>{workerDisplayName}</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.01em' }}>
            My Daily Attendance Log
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.825rem' }}>
            Record shift check-in and check-out times with automated timestamping.
          </p>
        </div>

        {/* Live Clock Card */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '0.65rem 1.1rem',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {dateFormatted}
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary, #0f172a)', fontFamily: 'monospace', marginTop: '0.1rem' }}>
            {timeFormatted}
          </div>
        </div>
      </div>

      {/* KPI Stats Bar - Compact font sizes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
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
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today's Status</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: isCheckedOut ? '#047857' : isCheckedIn ? 'var(--primary, #0F2A4A)' : '#d97706', marginTop: '0.1rem' }}>
              {isCheckedOut ? 'Present (Completed)' : isCheckedIn ? 'Logged In (Active)' : 'Not Checked In'}
            </div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
            <UserCheck size={18} />
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
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Check In Time</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem' }}>
              {todayRecord?.checkIn || '--:--'}
            </div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
            <LogIn size={18} />
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
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Check Out Time</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem' }}>
              {todayRecord?.checkOut || '--:--'}
            </div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
            <LogOut size={18} />
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
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Worked</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem' }}>
              {todayRecord?.hours || (isCheckedIn ? 'Active' : '0 hrs')}
            </div>
          </div>
          <div style={{ backgroundColor: '#f3e8ff', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
            <Clock size={18} />
          </div>
        </div>
      </div>

      {/* Main Today's Attendance Interactive Hub */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        maxWidth: '600px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={18} color="var(--primary)" /> Attendance Terminal
            </h3>
            <span style={{ fontSize: '0.785rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
              <MapPin size={12} color="var(--primary)" /> Location: <strong>Chennai South Zone Office</strong>
            </span>
          </div>

          <div>
            {!isCheckedIn ? (
              <span style={{ backgroundColor: '#fff5e6', color: '#d97706', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '14px', border: '1px solid #fed7aa' }}>
                Pending Entry
              </span>
            ) : isCheckedOut ? (
              <span style={{ backgroundColor: '#e7f5e8', color: '#138808', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '14px', border: '1px solid #bbf7d0', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle size={13} /> Completed
              </span>
            ) : (
              <span style={{ backgroundColor: '#e0f2fe', color: '#0284c7', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '14px', border: '1px solid #bae6fd', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={13} className="animate-spin" /> Shift Active
              </span>
            )}
          </div>
        </div>

        {/* State 1: Not Checked In */}
        {!isCheckedIn && (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <LogIn size={24} />
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
              Ready to start your work shift?
            </h4>
            <p style={{ color: '#64748b', fontSize: '0.825rem', maxWidth: '380px', margin: '0 auto 1.25rem' }}>
              Marking check-in logs your entry timestamp automatically.
            </p>

            <button 
              onClick={handleCheckIn}
              style={{
                width: '100%',
                maxWidth: '320px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.25rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)'
              }}
            >
              <CheckCircle size={18} /> Mark Check In Now
            </button>
          </div>
        )}

        {/* State 2: Checked In, Pending Check Out */}
        {isCheckedIn && !isCheckedOut && (
          <div>
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              marginBottom: '1.25rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.25rem'
            }}>
              <div>
                <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Check In Timestamp</span>
                <p style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary, #0F2A4A)', margin: '0.2rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <LogIn size={16} color="#138808" /> {todayRecord.checkIn}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Check Out Timestamp</span>
                <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                  Pending Exit...
                </p>
              </div>
            </div>

            <button 
              onClick={handleCheckOut}
              style={{
                width: '100%',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.25rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.2)'
              }}
            >
              <LogOut size={18} /> Mark Check Out (End Shift)
            </button>
          </div>
        )}

        {/* State 3: Checked Out (Completed) */}
        {isCheckedOut && (
          <div>
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              marginBottom: '1.25rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '0.85rem',
              textAlign: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Check In</span>
                <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary, #0F2A4A)', margin: '0.2rem 0 0 0' }}>
                  {todayRecord.checkIn}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Check Out</span>
                <p style={{ fontSize: '1rem', fontWeight: 800, color: '#dc2626', margin: '0.2rem 0 0 0' }}>
                  {todayRecord.checkOut}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Shift Duration</span>
                <p style={{ fontSize: '1rem', fontWeight: 800, color: '#138808', margin: '0.2rem 0 0 0' }}>
                  {todayRecord.hours || '8h 50m'}
                </p>
              </div>
            </div>

            <div style={{
              backgroundColor: '#e7f5e8',
              color: '#138808',
              border: '1px solid #bbf7d0',
              padding: '0.85rem',
              borderRadius: '8px',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}>
              <Award size={18} /> Shift Attendance Recorded Successfully!
            </div>
          </div>
        )}
      </div>

      {/* Attendance History Log */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            My Attendance History Log
          </h4>
          <span style={{ fontSize: '0.785rem', color: '#64748b', fontWeight: 600 }}>
            {myHistory.length} Entry Logs
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9', color: 'var(--primary)', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700 }}>Date</th>
                <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700 }}>Check In</th>
                <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700 }}>Check Out</th>
                <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700 }}>Working Hours</th>
                <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {myHistory.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    No attendance logs recorded yet.
                  </td>
                </tr>
              ) : (
                myHistory.map(rec => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1.25rem', fontWeight: 700, color: '#1e293b' }}>
                      <span style={{ backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.785rem' }}>
                        {rec.date}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem', color: '#138808', fontWeight: 700 }}>
                      {rec.checkIn || '--'}
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem', color: '#dc2626', fontWeight: 700 }}>
                      {rec.checkOut || '--'}
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem', fontWeight: 700, color: '#0f172a' }}>
                      {rec.hours || '--'}
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem' }}>
                      <span style={{ 
                        backgroundColor: rec.status === 'present' ? '#e7f5e8' : '#fee2e2', 
                        color: rec.status === 'present' ? '#138808' : '#dc2626', 
                        fontWeight: 700, 
                        fontSize: '0.725rem', 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '14px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem'
                      }}>
                        {rec.status === 'present' ? '✓ Present' : 'Absent'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

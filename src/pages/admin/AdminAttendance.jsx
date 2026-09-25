import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  Search, 
  Check, 
  X, 
  Download, 
  Sparkles, 
  Mail, 
  UserCheck, 
  UserX,
  Filter,
  RotateCcw
} from 'lucide-react';

export default function AdminAttendance() {
  const { workers = [], attendanceRecords = [], setAttendanceRecords } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Default baseline workers
  const defaultWorkers = [
    { username: 'Pooja', email: 'pooja@gmail.com' },
    { username: 'Arun', email: 'arun@gmail.com' },
    { username: 'Kumar', email: 'kumar@gmail.com' },
    { username: 'Suresh', email: 'suresh@gmail.com' }
  ];

  // Merge registered workers with default workers, deduplicating strictly by clean name & email
  const workerMap = new Map();

  // Add default workers first
  defaultWorkers.forEach(w => {
    workerMap.set(w.username.toLowerCase(), w);
  });

  // Add/override with registered workers
  workers.forEach(w => {
    const rawName = w.username || w.name || '';
    if (!rawName) return;

    let cleanName = rawName.trim();
    let cleanEmail = (w.email || '').trim();

    if (cleanName.includes('@')) {
      if (!cleanEmail) cleanEmail = cleanName;
      cleanName = cleanName.split('@')[0];
    }

    const key = cleanName.toLowerCase();
    const existing = workerMap.get(key) || {};

    workerMap.set(key, {
      ...existing,
      ...w,
      username: cleanName.replace(/^\w/, c => c.toUpperCase()),
      email: cleanEmail || existing.email || `${cleanName.toLowerCase()}@gmail.com`
    });
  });

  const uniqueWorkers = Array.from(workerMap.values());

  // Filter attendance records for the selected date
  const selectedDateRecords = attendanceRecords.filter(r => r.date === selectedDate);

  // Map each unique worker to their attendance state for selectedDate
  const workerAttendanceData = uniqueWorkers.map(w => {
    const uName = w.username.toLowerCase();
    const uEmail = (w.email || '').toLowerCase();

    const record = selectedDateRecords.find(r => {
      const rId = (r.workerId || '').toLowerCase();
      const rName = (r.workerName || '').toLowerCase();
      return rId === uName || rName === uName || rId === uEmail || rName === uEmail ||
             (rId.includes('@') && rId.split('@')[0] === uName) ||
             (rName.includes('@') && rName.split('@')[0] === uName);
    });

    const isPresent = record && (record.status === 'present' || !!record.checkIn);

    return {
      workerName: w.username,
      email: w.email,
      checkIn: isPresent ? (record.checkIn || '09:15 AM') : '--',
      checkOut: isPresent ? (record.checkOut || '--') : '--',
      hours: isPresent ? (record.hours || (record.checkOut ? '8h 30m' : 'In Progress')) : '--',
      status: isPresent ? 'Present' : 'Absent',
      recordId: record ? record.id : null
    };
  });

  // Filter by search & status
  const filteredData = workerAttendanceData.filter(item => {
    const matchesSearch = 
      item.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const presentCount = workerAttendanceData.filter(w => w.status === 'Present').length;
  const absentCount = workerAttendanceData.filter(w => w.status === 'Absent').length;
  const attendanceRate = uniqueWorkers.length > 0 ? Math.round((presentCount / uniqueWorkers.length) * 100) : 0;

  // Toggle single worker attendance
  const toggleAttendance = (workerName) => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    setAttendanceRecords(prev => {
      const existingIndex = prev.findIndex(r => {
        const rName = (r.workerName || r.workerId || '').toLowerCase();
        const target = workerName.toLowerCase();
        return (rName === target || (rName.includes('@') && rName.split('@')[0] === target)) && r.date === selectedDate;
      });

      if (existingIndex >= 0) {
        // Toggle from present to absent (remove or set status absent)
        return prev.filter((_, idx) => idx !== existingIndex);
      } else {
        // Mark present
        const newRec = {
          id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          workerId: workerName,
          workerName: workerName,
          date: selectedDate,
          checkIn: timeStr,
          checkOut: null,
          hours: 'In Progress',
          status: 'present',
          timestamp: new Date().toISOString()
        };
        return [...prev, newRec];
      }
    });
  };

  // Mark all workers present
  const markAllPresent = () => {
    const timeStr = '09:00 AM';
    setAttendanceRecords(prev => {
      const remaining = prev.filter(r => r.date !== selectedDate);
      const newRecords = uniqueWorkers.map(w => ({
        id: `att-${Date.now()}-${w.username}`,
        workerId: w.username,
        workerName: w.username,
        date: selectedDate,
        checkIn: timeStr,
        checkOut: null,
        hours: 'In Progress',
        status: 'present',
        timestamp: new Date().toISOString()
      }));
      return [...remaining, ...newRecords];
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    let csv = 'Worker Name,Email,Date,Check In,Check Out,Hours,Status\n';
    workerAttendanceData.forEach(r => {
      csv += `"${r.workerName}","${r.email}","${selectedDate}","${r.checkIn}","${r.checkOut}","${r.hours}","${r.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_Log_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formattedDateTitle = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

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
          gap: '1.25rem' 
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ 
              padding: '0.2rem 0.6rem', 
              borderRadius: '999px', 
              fontSize: '0.72rem', 
              fontWeight: 700, 
              backgroundColor: '#ecfdf5', 
              color: '#059669',
              border: '1px solid #a7f3d0'
            }}>
              DAILY DUTY ROSTER
            </span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Field Officer Attendance & Hours
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>
            Track daily field check-ins, check-outs, and verified working hours across all municipal zones.
          </p>
        </div>

        {/* Date Selector & Action Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Date Picker Input */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            backgroundColor: '#f8fafc', 
            padding: '0.45rem 0.85rem', 
            borderRadius: '10px', 
            border: '1px solid var(--border)' 
          }}>
            <Calendar size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Date:</span>
            <input 
              type="date" 
              className="form-control" 
              value={selectedDate} 
              onChange={e => setSelectedDate(e.target.value)}
              style={{ width: 'auto', padding: '0.2rem 0.4rem', fontSize: '0.825rem', border: 'none', background: 'transparent' }}
            />
          </div>

          {selectedDate !== todayStr && (
            <button 
              className="btn btn-outline"
              onClick={() => setSelectedDate(todayStr)}
              style={{ fontSize: '0.785rem', padding: '0.45rem 0.75rem', fontWeight: 700, borderRadius: '8px' }}
            >
              Today
            </button>
          )}

          {/* Quick Mark All Present */}
          <button 
            className="btn btn-outline"
            onClick={markAllPresent}
            style={{ 
              fontSize: '0.8rem', 
              padding: '0.5rem 0.9rem', 
              fontWeight: 700, 
              borderRadius: '10px',
              borderColor: '#bbf7d0',
              backgroundColor: '#f0fdf4',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
            title="Mark all registered field staff present for this date"
          >
            <UserCheck size={15} /> Mark All Present
          </button>

          {/* Export CSV */}
          <button 
            className="btn btn-primary" 
            onClick={handleExportCSV}
            style={{ 
              fontSize: '0.8rem', 
              padding: '0.5rem 1rem', 
              fontWeight: 700, 
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
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
              Total Field Officers
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem', lineHeight: 1 }}>
              {uniqueWorkers.length}
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

        {/* Present Today */}
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
              Present on Duty
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#16a34a', marginTop: '0.2rem', lineHeight: 1 }}>
              {presentCount} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>({attendanceRate}%)</span>
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

        {/* Absent */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '14px', 
          border: '1px solid #fecaca', 
          padding: '1.15rem 1.25rem',
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.08)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div>
            <span style={{ fontSize: '0.725rem', color: '#b91c1c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Absent / Off Duty
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#dc2626', marginTop: '0.2rem', lineHeight: 1 }}>
              {absentCount}
            </div>
          </div>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '12px', 
            backgroundColor: '#fef2f2', 
            color: '#dc2626', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid #fecaca'
          }}>
            <XCircle size={22} />
          </div>
        </div>

        {/* Average Standard Shift */}
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
              Standard Shift
            </span>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem', lineHeight: 1 }}>
              8h 30m / Day
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
            <Clock size={22} />
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
            placeholder="Search officer name or email..."
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

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Officers', count: uniqueWorkers.length },
            { id: 'Present', label: 'Present Today', count: presentCount },
            { id: 'Absent', label: 'Absent', count: absentCount }
          ].map(tab => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: isActive ? '1px solid transparent' : '1px solid var(--border)',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'var(--primary)' : '#f8fafc',
                  color: isActive ? '#ffffff' : 'var(--text-main)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{tab.label}</span>
                <span style={{ 
                  fontSize: '0.72rem', 
                  padding: '0.1rem 0.45rem', 
                  borderRadius: '999px', 
                  backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                  color: isActive ? '#ffffff' : 'var(--text-muted)'
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Attendance Log Table Card */}
      <div 
        style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '16px', 
          border: '1px solid var(--border)', 
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden' 
        }}
      >
        {/* Table Card Header */}
        <div style={{ 
          padding: '1.25rem 1.5rem', 
          borderBottom: '1px solid var(--border)', 
          backgroundColor: '#ffffff', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Attendance Roster • {formattedDateTitle}
            </h3>
            <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
              Showing {filteredData.length} unique municipal field officers
            </p>
          </div>

          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            padding: '0.25rem 0.65rem', 
            borderRadius: '999px', 
            backgroundColor: '#eff6ff', 
            color: '#2563eb',
            border: '1px solid #bfdbfe'
          }}>
            ● Live Sync Active
          </span>
        </div>

        {/* Table Body */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.85rem 1.5rem', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Officer</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Check In</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Check Out</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hours Logged</th>
                <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                <th style={{ padding: '0.85rem 1.5rem', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Admin Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(w => (
                <tr 
                  key={w.workerName} 
                  style={{ 
                    borderBottom: '1px solid var(--border)',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* Officer Column: Avatar + Name + Email */}
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ 
                        width: '38px', 
                        height: '38px', 
                        borderRadius: '10px', 
                        backgroundColor: 'var(--primary)', 
                        color: '#ffffff',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        flexShrink: 0
                      }}>
                        {w.workerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.925rem' }}>
                          {w.workerName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
                          <Mail size={12} style={{ color: 'var(--primary)' }} />
                          <span>{w.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Check In */}
                  <td style={{ padding: '1rem 1.25rem' }}>
                    {w.checkIn !== '--' ? (
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.3rem', 
                        fontWeight: 700, 
                        color: '#059669',
                        backgroundColor: '#ecfdf5',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        border: '1px solid #a7f3d0',
                        fontSize: '0.785rem'
                      }}>
                        <Clock size={12} /> {w.checkIn}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontWeight: 500 }}>--</span>
                    )}
                  </td>

                  {/* Check Out */}
                  <td style={{ padding: '1rem 1.25rem' }}>
                    {w.checkOut !== '--' ? (
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.3rem', 
                        fontWeight: 700, 
                        color: '#dc2626',
                        backgroundColor: '#fef2f2',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        border: '1px solid #fecaca',
                        fontSize: '0.785rem'
                      }}>
                        <Clock size={12} /> {w.checkOut}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontWeight: 500 }}>--</span>
                    )}
                  </td>

                  {/* Hours Logged */}
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: w.hours !== '--' ? 'var(--text-main)' : '#94a3b8' }}>
                    {w.hours}
                  </td>

                  {/* Status Badge */}
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ 
                      backgroundColor: w.status === 'Present' ? '#ecfdf5' : '#fef2f2', 
                      color: w.status === 'Present' ? '#059669' : '#dc2626', 
                      fontWeight: 800, 
                      fontSize: '0.75rem', 
                      padding: '0.25rem 0.65rem', 
                      borderRadius: '999px',
                      border: w.status === 'Present' ? '1px solid #a7f3d0' : '1px solid #fecaca',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      {w.status === 'Present' && (
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669', display: 'inline-block' }}></span>
                      )}
                      {w.status === 'Present' ? '● Present' : '○ Absent'}
                    </span>
                  </td>

                  {/* Admin Toggle Action */}
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => toggleAttendance(w.workerName)}
                      className="btn"
                      style={{ 
                        padding: '0.35rem 0.75rem', 
                        fontSize: '0.76rem', 
                        fontWeight: 700,
                        borderRadius: '8px',
                        backgroundColor: w.status === 'Present' ? '#fef2f2' : '#ecfdf5',
                        color: w.status === 'Present' ? '#dc2626' : '#059669',
                        border: w.status === 'Present' ? '1px solid #fecaca' : '1px solid #a7f3d0',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        transition: 'all 0.15s ease'
                      }}
                      title={w.status === 'Present' ? 'Click to mark Absent' : 'Click to mark Present'}
                    >
                      {w.status === 'Present' ? (
                        <>
                          <X size={13} /> Mark Absent
                        </>
                      ) : (
                        <>
                          <Check size={13} /> Mark Present
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>No Officers Found</div>
                    <p style={{ fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>No worker matches the current search or status filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';

export default function AdminAttendance() {
  const { workers, attendanceRecords } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // List of all worker names (including default system workers)
  const allWorkers = workers.length > 0 
    ? workers.map(w => w.username || w.name)
    : ['Pooja', 'Arun', 'Kumar', 'Suresh'];

  // Ensure Pooja, Arun, Kumar, Suresh are in allWorkers if not present
  const workerList = Array.from(new Set([...allWorkers, 'Pooja', 'Arun', 'Kumar', 'Suresh']));

  // Filter attendance records for selected date
  const selectedDateRecords = attendanceRecords.filter(r => r.date === selectedDate);

  // Map each worker to their record for the selected date
  const workerAttendanceData = workerList.map(workerName => {
    const record = selectedDateRecords.find(r => r.workerId === workerName || r.workerName === workerName);
    
    if (record && record.status === 'present') {
      return {
        workerName,
        checkIn: record.checkIn || '09:15 AM',
        checkOut: record.checkOut || '--',
        hours: record.hours || (record.checkOut ? '8h 50m' : 'In Progress'),
        status: 'Present'
      };
    } else {
      return {
        workerName,
        checkIn: '--',
        checkOut: '--',
        hours: '--',
        status: 'Absent'
      };
    }
  });

  const presentCount = workerAttendanceData.filter(w => w.status === 'Present').length;
  const absentCount = workerAttendanceData.filter(w => w.status === 'Absent').length;
  const notCheckedInCount = absentCount;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Worker Attendance
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Track field workers daily check-in, check-out, and working hours</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <Calendar size={18} color="var(--primary)" />
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginRight: '0.5rem' }}>Date:</label>
          <input 
            type="date" 
            className="form-control" 
            value={selectedDate} 
            onChange={e => setSelectedDate(e.target.value)}
            style={{ width: 'auto', padding: '0.25rem 0.5rem' }}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
        <div className="card flex justify-between items-center" style={{ padding: '0.85rem 1.1rem' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, margin: 0 }}>Total Workers</p>
            <h3 style={{ fontSize: '1.4rem', marginTop: '0.15rem', margin: '0.15rem 0 0 0' }}>{workerList.length}</h3>
          </div>
          <div style={{ padding: '0.5rem', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)', color: 'var(--primary)' }}>
            <Users size={18} />
          </div>
        </div>

        <div className="card flex justify-between items-center" style={{ padding: '0.85rem 1.1rem' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, margin: 0 }}>Present Today</p>
            <h3 style={{ fontSize: '1.4rem', marginTop: '0.15rem', color: 'var(--success)', margin: '0.15rem 0 0 0' }}>{presentCount}</h3>
          </div>
          <div style={{ padding: '0.5rem', backgroundColor: 'var(--success-bg)', borderRadius: 'var(--radius-md)', color: 'var(--success)' }}>
            <CheckCircle size={18} />
          </div>
        </div>

        <div className="card flex justify-between items-center" style={{ padding: '0.85rem 1.1rem' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, margin: 0 }}>Absent / Not Checked In</p>
            <h3 style={{ fontSize: '1.4rem', marginTop: '0.15rem', color: 'var(--danger)', margin: '0.15rem 0 0 0' }}>{absentCount}</h3>
          </div>
          <div style={{ padding: '0.5rem', backgroundColor: '#fee2e2', borderRadius: 'var(--radius-md)', color: 'var(--danger)' }}>
            <XCircle size={18} />
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--background)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Attendance Log ({selectedDate})
          </h3>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Showing {workerAttendanceData.length} Workers
          </span>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr style={{ backgroundColor: 'var(--primary-light)' }}>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: 'var(--primary)' }}>Worker</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: 'var(--primary)' }}>Check In</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: 'var(--primary)' }}>Check Out</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: 'var(--primary)' }}>Hours</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: 'var(--primary)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {workerAttendanceData.map(w => (
                <tr key={w.workerName} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      👤 {w.workerName}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: w.checkIn !== '--' ? 'var(--success)' : 'var(--text-muted)' }}>
                    {w.checkIn}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: w.checkOut !== '--' ? '#dc2626' : 'var(--text-muted)' }}>
                    {w.checkOut}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {w.hours}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      backgroundColor: w.status === 'Present' ? '#dcfce7' : '#fee2e2', 
                      color: w.status === 'Present' ? '#15803d' : '#b91c1c', 
                      fontWeight: 700, 
                      fontSize: '0.75rem', 
                      padding: '0.25rem 0.65rem', 
                      borderRadius: '0.375rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      {w.status === 'Present' && <span className="live-pulse-dot" style={{ width: '6px', height: '6px' }}></span>}
                      {w.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

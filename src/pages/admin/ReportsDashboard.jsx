import React, { useState } from 'react';
import { BarChart2, Download, Calendar, MapPin, Users, FileText, CheckCircle, XCircle, HardHat } from 'lucide-react';

export default function ReportsDashboard() {
  // Using mock data based on the requirement specs for UI presentation
  const metrics = {
    applications: 248,
    approved: 184,
    rejected: 20,
    siteVisits: 44
  };

  const appStatusData = [
    { label: 'Submitted', count: 32, color: 'var(--text-muted)' },
    { label: 'Documents', count: 18, color: 'var(--warning)' },
    { label: 'Site Visit', count: 12, color: 'var(--primary)' },
    { label: 'Pending Approval', count: 8, color: 'var(--warning)' },
    { label: 'Approved', count: 158, color: 'var(--success)' },
    { label: 'Rejected', count: 20, color: 'var(--danger)' }
  ];

  const workerReport = [
    { name: 'Kumar', visits: 24, completed: 20, pending: 4 },
    { name: 'Arun', visits: 18, completed: 15, pending: 3 },
    { name: 'Priya', visits: 12, completed: 10, pending: 2 }
  ];

  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [workerFilter, setWorkerFilter] = useState('All Workers');
  const [fromDate, setFromDate] = useState('2026-09-23');
  const [toDate, setToDate] = useState('2026-09-30');

  return (
    <div>
      {/* Header and Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={24} color="var(--primary)" /> Reports & Analytics
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Overview of all portal activities and worker performance.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={() => alert('Excel export will be implemented in the backend.')}>
            <Download size={16} /> Export Excel
          </button>
          <button className="btn btn-outline" onClick={() => alert('PDF export will be implemented in the backend.')}>
            <Download size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Location</label>
          <div style={{ position: 'relative' }}>
            <MapPin size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <select 
              className="form-control" 
              style={{ paddingLeft: '2.5rem' }}
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
            >
              <option>All Locations</option>
              <option>Krishnagiri</option>
              <option>Hosur</option>
              <option>Bangalore</option>
              <option>Chennai</option>
            </select>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Worker</label>
          <div style={{ position: 'relative' }}>
            <Users size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <select 
              className="form-control" 
              style={{ paddingLeft: '2.5rem' }}
              value={workerFilter}
              onChange={e => setWorkerFilter(e.target.value)}
            >
              <option>All Workers</option>
              <option>Kumar</option>
              <option>Arun</option>
              <option>Priya</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flex: 2, minWidth: '300px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>From Date</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="date" 
                className="form-control" 
                style={{ paddingLeft: '2.5rem' }}
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>To Date</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="date" 
                className="form-control" 
                style={{ paddingLeft: '2.5rem' }}
                value={toDate}
                onChange={e => setToDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div>
          <button className="btn btn-primary" style={{ height: '42px' }}>Apply Filter</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <FileText size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Applications</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{metrics.applications}</h3>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Approved</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{metrics.approved}</h3>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
            <XCircle size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Rejected</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{metrics.rejected}</h3>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
            <HardHat size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Site Visits</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{metrics.siteVisits}</h3>
          </div>
        </div>
      </div>

      {/* Detailed Reports Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Application Status Chart */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={18} color="var(--primary)" /> Application Status
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {appStatusData.map((status, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: index < appStatusData.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: status.color }}></div>
                  <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{status.label}</span>
                </div>
                <span style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-main)' }}>{status.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Site Visit Report */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} color="var(--primary)" /> Site Visit Report
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--primary-light)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--primary)' }}>Worker</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--primary)' }}>Total Visits</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--primary)' }}>Completed</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--primary)' }}>Pending</th>
                </tr>
              </thead>
              <tbody>
                {workerReport.map((worker, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{worker.name}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{worker.visits}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--success)', fontWeight: 500 }}>{worker.completed}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--warning)', fontWeight: 500 }}>{worker.pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Calendar, Search, Filter, Eye, CheckCircle, Clock } from 'lucide-react';

export default function AdminDailyReports() {
  const { workers, dailyReports } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [workerFilter, setWorkerFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReportModal, setSelectedReportModal] = useState(null);

  // Clean and deduplicate registered field worker names
  const defaultWorkers = ['Pooja', 'Arun', 'Kumar', 'Suresh'];
  const registeredUsernames = workers.map(w => {
    const raw = w.username || w.name || '';
    return raw.includes('@') ? raw.split('@')[0] : raw;
  }).filter(Boolean);

  const workerMap = new Map();
  [...defaultWorkers, ...registeredUsernames].forEach(name => {
    const clean = name.trim().replace(/^\w/, c => c.toUpperCase());
    workerMap.set(clean.toLowerCase(), clean);
  });
  const workerList = Array.from(workerMap.values());

  // Filter daily reports
  const filteredReports = dailyReports.filter(rep => {
    const matchesDate = !selectedDate || rep.date === selectedDate;
    const matchesWorker = workerFilter === 'ALL' || (rep.workerId && rep.workerId.toLowerCase() === workerFilter.toLowerCase()) || (rep.workerName && rep.workerName.toLowerCase() === workerFilter.toLowerCase());
    const matchesSearch = !searchTerm || (rep.description && rep.description.toLowerCase().includes(searchTerm.toLowerCase())) || (rep.workerName && rep.workerName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesDate && matchesWorker && matchesSearch;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Daily Reports Tracking
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Track field work activities submitted by workers</p>
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

      {/* Filters Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search work description or worker name..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ width: '200px' }}>
            <select className="form-control" value={workerFilter} onChange={e => setWorkerFilter(e.target.value)}>
              <option value="ALL">All Workers ▼</option>
              {workerList.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          <button 
            className="btn btn-outline" 
            onClick={() => { setSelectedDate(todayStr); setWorkerFilter('ALL'); setSearchTerm(''); }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Submitted Reports ({filteredReports.length})
          </h3>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr style={{ backgroundColor: 'var(--primary-light)' }}>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: 'var(--primary)' }}>Worker</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: 'var(--primary)' }}>Date</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: 'var(--primary)' }}>Applications</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: 'var(--primary)' }}>Visits</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: 'var(--primary)' }}>Site Visits</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: 'var(--primary)' }}>Documents</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: 'var(--primary)' }}>Status</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: 'var(--primary)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                    <FileText size={40} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                    <p style={{ fontWeight: 500 }}>No daily reports found for selected filters.</p>
                  </td>
                </tr>
              ) : (
                filteredReports.map(rep => (
                  <tr key={rep.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      👤 {rep.workerName || rep.workerId}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{rep.date}</td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--primary)' }}>{rep.applicationsHandled}</td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#8b5cf6' }}>{rep.customerVisits}</td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#0284c7' }}>{rep.siteVisitsCompleted}</td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--success)' }}>{rep.documentsReviewed}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 600, fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '0.375rem' }}>
                        Submitted
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <button 
                        className="btn" 
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}
                        onClick={() => setSelectedReportModal(rep)}
                      >
                        <Eye size={14} /> View Report
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '550px', backgroundColor: '#FFFFFF', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>Daily Work Report</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Worker: <strong>{selectedReportModal.workerName || selectedReportModal.workerId}</strong> • {selectedReportModal.date}</p>
              </div>
              <button onClick={() => setSelectedReportModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', backgroundColor: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.5rem', textAlign: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Applications</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>{selectedReportModal.applicationsHandled}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Visits</span>
                <strong style={{ fontSize: '1.25rem', color: '#8b5cf6' }}>{selectedReportModal.customerVisits}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Site Visits</span>
                <strong style={{ fontSize: '1.25rem', color: '#0284c7' }}>{selectedReportModal.siteVisitsCompleted}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Documents</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--success)' }}>{selectedReportModal.documentsReviewed}</strong>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'block' }}>Work Description:</label>
              <div style={{ backgroundColor: 'white', border: '1px solid var(--border)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9375rem', color: 'var(--text-main)', lineHeight: 1.6, minHeight: '100px' }}>
                {selectedReportModal.description}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Submitted at {selectedReportModal.submittedAt || '06:15 PM'}</span>
              <button className="btn btn-outline" onClick={() => setSelectedReportModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileText, CheckCircle, Calendar, Send, Sparkles, Building2, UserCheck, Eye
} from 'lucide-react';

export default function WorkerDailyReport() {
  const { currentUser, dailyReports, submitDailyReport, getWorkerTodayMetrics } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const dateFormatted = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  // Format current worker name nicely
  const workerDisplayName = currentUser === 'Pooja' || currentUser === 'pooja@gmail.com' ? 'Pooja' : currentUser;

  // Auto-calculated system metrics
  const autoMetrics = getWorkerTodayMetrics(currentUser);

  // Form State
  const [formData, setFormData] = useState({
    applicationsHandled: autoMetrics.applicationsHandled,
    customerVisits: autoMetrics.customerVisits,
    siteVisitsCompleted: autoMetrics.siteVisitsCompleted,
    documentsReviewed: autoMetrics.documentsReviewed,
    description: ''
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      applicationsHandled: autoMetrics.applicationsHandled,
      customerVisits: autoMetrics.customerVisits,
      siteVisitsCompleted: autoMetrics.siteVisitsCompleted,
      documentsReviewed: autoMetrics.documentsReviewed
    }));
  }, [currentUser]);

  // Check if worker already submitted today's report
  const todayReport = dailyReports.find(r => 
    (r.workerId === currentUser || r.workerName === currentUser) && r.date === todayStr
  );

  // History reports for current worker
  const myHistory = dailyReports.filter(r => 
    r.workerId === currentUser || r.workerName === currentUser
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      alert('Please enter your work description before submitting.');
      return;
    }
    submitDailyReport(formData);
  };

  const insertQuickText = (text) => {
    setFormData(prev => ({
      ...prev,
      description: prev.description ? `${prev.description}\n• ${text}` : `• ${text}`
    }));
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
              DAILY WORK LOGBOOK
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>•</span>
            <span style={{ color: '#475569', fontSize: '0.8rem', fontWeight: 600 }}>{workerDisplayName}</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.01em' }}>
            Field Activity Report
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.825rem' }}>
            Log your daily verification activities, customer interactions, and field inspections.
          </p>
        </div>

        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '0.65rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <Calendar size={18} color="var(--primary, #0F2A4A)" />
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Report Date</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>{dateFormatted}</div>
          </div>
        </div>
      </div>

      {/* 4 Auto Metric Cards - Scaled Down */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Applications</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem' }}>{formData.applicationsHandled}</div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
            <FileText size={18} />
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
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer Visits</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem' }}>{formData.customerVisits}</div>
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
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Site Inspections</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem' }}>{formData.siteVisitsCompleted}</div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
            <Building2 size={18} />
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
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Docs Verified</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem' }}>{formData.documentsReviewed}</div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
            <Eye size={18} />
          </div>
        </div>
      </div>

      {/* Main Today's Work Form or Submitted Summary */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        maxWidth: '640px'
      }}>
        {!todayReport ? (
          <div>
            <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={18} color="var(--primary)" /> Fill Today's Work Report
              </h3>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Metrics auto-filled from system activity. Add notes below.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Applications Handled
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    required
                    value={formData.applicationsHandled}
                    onChange={e => setFormData({ ...formData, applicationsHandled: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', backgroundColor: '#f8fafc' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Auto-synced</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Customer Visits
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    required
                    value={formData.customerVisits}
                    onChange={e => setFormData({ ...formData, customerVisits: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Site Inspections
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    required
                    value={formData.siteVisitsCompleted}
                    onChange={e => setFormData({ ...formData, siteVisitsCompleted: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Documents Reviewed
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    required
                    value={formData.documentsReviewed}
                    onChange={e => setFormData({ ...formData, documentsReviewed: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', backgroundColor: '#f8fafc' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Auto-synced</span>
                </div>
              </div>

              {/* Quick Text Template Chips */}
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  <Sparkles size={13} color="var(--sidebar-active, #D97706)" /> Quick Insert Notes:
                </label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {[
                    'Verified customer site documents',
                    'Registered new building application',
                    'Issued re-upload notice for missing deed',
                    'Completed site inspection'
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => insertQuickText(chip)}
                      style={{
                        backgroundColor: '#f1f5f9',
                        color: 'var(--primary)',
                        border: '1px solid #cbd5e1',
                        borderRadius: '16px',
                        padding: '0.3rem 0.65rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                  Work Description & Remarks *
                </label>
                <textarea 
                  rows="3" 
                  required
                  placeholder="Describe field activities, verified customer files, or observations..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: '#1e293b',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                ></textarea>
              </div>

              <button 
                type="submit" 
                style={{
                  width: '100%',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)'
                }}
              >
                <Send size={16} /> Submit Daily Work Report
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e7f5e8', color: '#138808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Daily Report Submitted
                  </h4>
                  <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.785rem', color: '#64748b' }}>
                    Submitted today at {todayReport.submittedAt || '4:30 PM'}
                  </p>
                </div>
              </div>

              <span style={{ backgroundColor: '#e7f5e8', color: '#138808', fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: '14px', border: '1px solid #bbf7d0' }}>
                ✓ Submitted
              </span>
            </div>

            {/* Metrics Grid Display */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', textAlign: 'center' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Applications</span>
                <strong style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>{todayReport.applicationsHandled}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Visits</span>
                <strong style={{ fontSize: '1.15rem', color: '#8b5cf6' }}>{todayReport.customerVisits}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Site Visits</span>
                <strong style={{ fontSize: '1.15rem', color: '#0284c7' }}>{todayReport.siteVisitsCompleted}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Verified</span>
                <strong style={{ fontSize: '1.15rem', color: '#138808' }}>{todayReport.documentsReviewed}</strong>
              </div>
            </div>

            {/* Work Description Display */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem', display: 'block' }}>
                Work Description & Field Remarks:
              </label>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '0.85rem', borderRadius: '8px', fontSize: '0.85rem', color: '#1e293b', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                {todayReport.description}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* History Log Table */}
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
            My Submitted Daily Reports Log
          </h4>
          <span style={{ fontSize: '0.785rem', color: '#64748b', fontWeight: 600 }}>
            {myHistory.length} Reports Logged
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9', color: 'var(--primary)', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700 }}>Date</th>
                <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700 }}>Applications</th>
                <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700 }}>Customer Visits</th>
                <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700 }}>Site Inspections</th>
                <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700 }}>Docs Verified</th>
                <th style={{ padding: '0.75rem 1.25rem', fontWeight: 700 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {myHistory.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    No daily reports submitted yet.
                  </td>
                </tr>
              ) : (
                myHistory.map(rep => (
                  <tr key={rep.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1.25rem', fontWeight: 700, color: '#1e293b' }}>
                      <span style={{ backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.785rem' }}>
                        {rep.date}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{rep.applicationsHandled}</td>
                    <td style={{ padding: '0.75rem 1.25rem', fontWeight: 700, color: '#8b5cf6' }}>{rep.customerVisits}</td>
                    <td style={{ padding: '0.75rem 1.25rem', fontWeight: 700, color: '#0284c7' }}>{rep.siteVisitsCompleted}</td>
                    <td style={{ padding: '0.75rem 1.25rem', fontWeight: 700, color: '#138808' }}>{rep.documentsReviewed}</td>
                    <td style={{ padding: '0.75rem 1.25rem' }}>
                      <span style={{ backgroundColor: '#e7f5e8', color: '#138808', fontWeight: 700, fontSize: '0.725rem', padding: '0.25rem 0.65rem', borderRadius: '14px' }}>
                        Submitted
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

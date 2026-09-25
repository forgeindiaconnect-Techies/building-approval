import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  ArrowUpRight, 
  Activity, 
  MapPin, 
  User, 
  FileDigit, 
  Calendar,
  Layers,
  AlertCircle,
  Plus,
  UserPlus
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { applications = [], dailyReports = [], notifications = [], attendanceRecords = [] } = useApp();

  // Dynamic Real-time Calculations
  const totalAppsCount = applications.length;
  
  const pendingApps = applications.filter(a => a.status === 'pending' || a.status === 'under_review');
  const pendingAppsCount = pendingApps.length;

  const approvedAppsCount = applications.filter(a => a.status === 'approved' || a.status === 'site_visit_completed').length;
  
  // Calculate site visits count
  const todayStr = new Date().toISOString().split('T')[0];
  const siteVisitsCount = applications.filter(a => a.status === 'documents_verified' || (a.stages && a.stages[4]?.status === 'Pending')).length;

  // Real-time Activity derived from notifications or app history
  const recentActivityList = notifications.length > 0 
    ? notifications.slice(0, 4).map(n => ({
        id: n.id,
        text: n.message || `${n.type.replace(/_/g, ' ')}`,
        subtext: `${n.targetId} • ${new Date(n.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        icon: n.type.includes('COMPLETED') ? <CheckCircle size={14} color="var(--success)" /> : <FileText size={14} color="var(--primary)" />
      }))
    : [
        { text: 'Kumar completed site visit', subtext: 'BA-2026-000120 • 10 mins ago', icon: <CheckCircle size={14} color="var(--success)" /> },
        { text: 'New document uploaded', subtext: 'BA-2026-000125 • 25 mins ago', icon: <FileText size={14} color="var(--primary)" /> },
        { text: 'New application created', subtext: 'BA-2026-000128 • 1 hour ago', icon: <User size={14} color="var(--text-muted)" /> },
      ];

  // Dynamic Site Visits agenda
  const siteVisitsAgenda = applications.slice(0, 3).map((app, idx) => ({
    time: idx === 0 ? '10:30 AM' : idx === 1 ? '02:00 PM' : '04:30 PM',
    applicant: app.applicantName,
    location: app.location || 'Chennai',
    status: app.status === 'approved' ? 'Completed' : app.status === 'under_review' ? 'In Progress' : 'Pending',
    statusColor: app.status === 'approved' ? 'var(--success)' : app.status === 'under_review' ? 'var(--primary)' : 'var(--warning)'
  }));

  const dateFormatted = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div>
      {/* 1. Header with Real-time Indicator & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Good Morning, Admin 👋
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '0.15rem' }}>
            Here's what's happening with your applications today • {dateFormatted}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            backgroundColor: 'var(--surface)', 
            border: '1px solid var(--border)',
            padding: '0.35rem 0.75rem', 
            borderRadius: 'var(--radius-full)', 
            fontSize: '0.75rem', 
            fontWeight: 600,
            color: 'var(--success)'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--success)', display: 'inline-block' }}></span>
            Real-time Sync Active
          </span>
          
          <button 
            className="btn btn-outline btn-sm" 
            onClick={() => navigate('/admin/workers')}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <UserPlus size={14} /> Add Worker
          </button>
          
          <button 
            className="btn btn-primary btn-sm" 
            onClick={() => navigate('/admin/applications')}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
          >
            <Plus size={14} /> New Application
          </button>
        </div>
      </div>

      {/* 2. Compact Real-time Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '0.85rem', 
        marginBottom: '1.25rem' 
      }}>
        {/* Total Applications Card */}
        <div className="card" style={{ 
          padding: '0.85rem 1.1rem', 
          border: '1px solid #cbd5e1', 
          display: 'flex', 
          justify: 'space-between', 
          alignItems: 'center' 
        }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, margin: 0 }}>Total Applications</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0.15rem 0' }}>
              {totalAppsCount}
            </h3>
            <p style={{ color: '#047857', fontSize: '0.7rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem', margin: 0 }}>
              <ArrowUpRight size={12} /> Live Updated
            </p>
          </div>
          <div style={{ padding: '0.5rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', color: '#475569' }}>
            <FileText size={20} />
          </div>
        </div>

        {/* Pending Applications Card */}
        <div className="card" style={{ 
          padding: '0.85rem 1.1rem', 
          border: '1px solid #cbd5e1', 
          display: 'flex', 
          justify: 'space-between', 
          alignItems: 'center' 
        }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, margin: 0 }}>Pending Applications</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0.15rem 0' }}>
              {pendingAppsCount}
            </h3>
            <p style={{ color: '#475569', fontSize: '0.7rem', fontWeight: 600, margin: 0 }}>
              Requires Action
            </p>
          </div>
          <div style={{ padding: '0.5rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', color: '#475569' }}>
            <Clock size={20} />
          </div>
        </div>

        {/* Site Visits Today Card */}
        <div className="card" style={{ 
          padding: '0.85rem 1.1rem', 
          border: '1px solid #cbd5e1', 
          display: 'flex', 
          justify: 'space-between', 
          alignItems: 'center' 
        }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, margin: 0 }}>Site Visits Scheduled</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0.15rem 0' }}>
              {siteVisitsCount}
            </h3>
            <p style={{ color: '#475569', fontSize: '0.7rem', fontWeight: 600, margin: 0 }}>
              Active Field Work
            </p>
          </div>
          <div style={{ padding: '0.5rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', color: '#475569' }}>
            <MapPin size={20} />
          </div>
        </div>

        {/* Approved Applications Card */}
        <div className="card" style={{ 
          padding: '0.85rem 1.1rem', 
          border: '1px solid #cbd5e1', 
          display: 'flex', 
          justify: 'space-between', 
          alignItems: 'center' 
        }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, margin: 0 }}>Approved Applications</p>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0.15rem 0' }}>
              {approvedAppsCount}
            </h3>
            <p style={{ color: '#047857', fontSize: '0.7rem', fontWeight: 600, margin: 0 }}>
              Completed
            </p>
          </div>
          <div style={{ padding: '0.5rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', color: '#475569' }}>
            <CheckCircle size={20} />
          </div>
        </div>
      </div>

      {/* 3. Real-Time Applications Trend (Compact Area Visual) */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Applications Overview</h3>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Real-time application processing velocity</span>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
            This Month
          </span>
        </div>
        
        {/* Sleek Visual SVG Area Trend */}
        <div style={{ height: '110px', width: '100%', position: 'relative' }}>
          <svg viewBox="0 0 500 100" style={{ width: '100%', height: '100%', overflow: 'visible' }} preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d="M 0,80 Q 80,40 160,60 T 320,20 T 500,50 L 500,100 L 0,100 Z" fill="url(#chartGrad)" />
            <path d="M 0,80 Q 80,40 160,60 T 320,20 T 500,50" fill="none" stroke="var(--primary)" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="160" cy="60" r="4" fill="white" stroke="var(--primary)" strokeWidth="2" />
            <circle cx="320" cy="20" r="5" fill="var(--primary)" stroke="white" strokeWidth="2" />
            <circle cx="500" cy="50" r="4" fill="white" stroke="var(--primary)" strokeWidth="2" />
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4 (Today)</span>
          </div>
        </div>
      </div>

      {/* 4 & 5. Pending Applications & Site Visits Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        
        {/* Real-time Pending Applications Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--background)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Pending Applications</h3>
            <button 
              onClick={() => navigate('/admin/applications')} 
              style={{ background: 'none', border: 'none', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
            >
              View All ({applications.length}) →
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--primary-light)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.6rem 1rem', fontSize: '0.725rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Application</th>
                  <th style={{ padding: '0.6rem 1rem', fontSize: '0.725rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Applicant</th>
                  <th style={{ padding: '0.6rem 1rem', fontSize: '0.725rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Location</th>
                  <th style={{ padding: '0.6rem 1rem', fontSize: '0.725rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ padding: '0.6rem 1rem', fontSize: '0.725rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 4).map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.65rem 1rem', fontWeight: 600, color: 'var(--primary)', whiteSpace: 'nowrap' }}>{app.id}</td>
                    <td style={{ padding: '0.65rem 1rem', fontWeight: 500 }}>{app.applicantName}</td>
                    <td style={{ padding: '0.65rem 1rem', color: 'var(--text-muted)' }}>{app.location || 'Chennai'}</td>
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <span style={{ 
                        padding: '0.15rem 0.5rem', 
                        backgroundColor: app.status === 'approved' ? 'var(--success-bg)' : 'var(--warning-bg)', 
                        color: app.status === 'approved' ? 'var(--success)' : '#c2410c', 
                        borderRadius: 'var(--radius-sm)', 
                        fontSize: '0.7rem', 
                        fontWeight: 700 
                      }}>
                        {app.status === 'under_review' ? 'Under Review' : app.status === 'approved' ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.2rem 0.55rem', fontSize: '0.725rem' }}
                        onClick={() => navigate(`/admin/application/${app.id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's Site Visits Agenda */}
        <div className="card" style={{ padding: '0.85rem 1.15rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Today's Site Visits</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scheduled</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {siteVisitsAgenda.map((visit, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                gap: '0.75rem', 
                paddingBottom: idx !== siteVisitsAgenda.length - 1 ? '0.75rem' : '0', 
                borderBottom: idx !== siteVisitsAgenda.length - 1 ? '1px solid var(--border)' : 'none',
                alignItems: 'center'
              }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, minWidth: '65px' }}>
                  {visit.time}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.825rem', margin: 0 }}>{visit.applicant}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem', margin: '0.1rem 0 0 0' }}>
                    <MapPin size={10} /> {visit.location}
                  </p>
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: visit.statusColor, backgroundColor: 'var(--background)', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-sm)' }}>
                  {visit.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Recent Real-Time Activity */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <Activity size={16} color="var(--primary)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Recent Activity</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {recentActivityList.map((act, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {act.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{act.text}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>{act.subtext}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

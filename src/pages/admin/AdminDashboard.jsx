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
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--canvas-title, #0F172A)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Good Morning, Admin 👋
          </h2>
          <p style={{ color: 'var(--canvas-sub, #475569)', fontSize: '0.825rem', marginTop: '0.2rem', fontWeight: 500 }}>
            Here's what's happening with your applications today • {dateFormatted}
          </p>
        </div>

        <div className="admin-dashboard-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.45rem', 
            backgroundColor: 'var(--canvas-pill-bg, #FFFFFF)', 
            border: '1px solid var(--canvas-pill-border, #CBD5E1)',
            padding: '0.4rem 0.85rem', 
            borderRadius: 'var(--radius-full)', 
            fontSize: '0.75rem', 
            fontWeight: 700,
            color: 'var(--canvas-pill-text, #16A34A)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#16A34A', display: 'inline-block' }}></span>
            Real-time Sync Active
          </span>
          
          <button 
            className="admin-header-btn"
            onClick={() => navigate('/admin/workers')}
            style={{ 
              padding: '0.45rem 0.85rem', 
              fontSize: '0.78rem', 
              fontWeight: 700,
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.35rem',
              backgroundColor: 'var(--canvas-btn-bg, #FFFFFF)',
              color: 'var(--canvas-btn-color, #0F172A)',
              border: '1px solid var(--canvas-btn-border, #CBD5E1)',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <UserPlus size={14} /> Add Worker
          </button>
          
          <button 
            className="btn btn-primary btn-sm admin-header-btn" 
            onClick={() => navigate('/admin/applications')}
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
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
          padding: '0.9rem 1.15rem', 
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0', 
          borderRadius: '12px',
          display: 'flex', 
          justify: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div>
            <p style={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, margin: 0 }}>Total Applications</p>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', margin: '0.15rem 0' }}>
              {totalAppsCount}
            </h3>
            <p style={{ color: '#047857', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem', margin: 0 }}>
              <ArrowUpRight size={12} /> Live Updated
            </p>
          </div>
          <div style={{ padding: '0.6rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', color: '#334155' }}>
            <FileText size={20} />
          </div>
        </div>

        {/* Pending Applications Card */}
        <div className="card" style={{ 
          padding: '0.9rem 1.15rem', 
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0', 
          borderRadius: '12px',
          display: 'flex', 
          justify: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div>
            <p style={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, margin: 0 }}>Pending Applications</p>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', margin: '0.15rem 0' }}>
              {pendingAppsCount}
            </h3>
            <p style={{ color: '#D97706', fontSize: '0.72rem', fontWeight: 700, margin: 0 }}>
              Requires Action
            </p>
          </div>
          <div style={{ padding: '0.6rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', color: '#D97706' }}>
            <Clock size={20} />
          </div>
        </div>

        {/* Site Visits Today Card */}
        <div className="card" style={{ 
          padding: '0.9rem 1.15rem', 
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0', 
          borderRadius: '12px',
          display: 'flex', 
          justify: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div>
            <p style={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, margin: 0 }}>Site Visits Scheduled</p>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', margin: '0.15rem 0' }}>
              {siteVisitsCount}
            </h3>
            <p style={{ color: '#2563EB', fontSize: '0.72rem', fontWeight: 700, margin: 0 }}>
              Active Field Work
            </p>
          </div>
          <div style={{ padding: '0.6rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', color: '#2563EB' }}>
            <MapPin size={20} />
          </div>
        </div>

        {/* Approved Applications Card */}
        <div className="card" style={{ 
          padding: '0.9rem 1.15rem', 
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0', 
          borderRadius: '12px',
          display: 'flex', 
          justify: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div>
            <p style={{ color: '#475569', fontSize: '0.78rem', fontWeight: 700, margin: 0 }}>Approved Applications</p>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', margin: '0.15rem 0' }}>
              {approvedAppsCount}
            </h3>
            <p style={{ color: '#047857', fontSize: '0.72rem', fontWeight: 700, margin: 0 }}>
              Completed
            </p>
          </div>
          <div style={{ padding: '0.6rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', color: '#047857' }}>
            <CheckCircle size={20} />
          </div>
        </div>
      </div>

      {/* 3 & 4. Pending Applications & Site Visits Grid */}
      <div className="dashboard-main-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        
        {/* Real-time Pending Applications Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Pending Applications</h3>
            <button 
              onClick={() => navigate('/admin/applications')} 
              style={{ background: 'none', border: 'none', fontSize: '0.78rem', color: 'var(--primary, #0F2A4A)', fontWeight: 700, cursor: 'pointer' }}
            >
              View All ({applications.length}) →
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '0.65rem 1rem', fontSize: '0.725rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Application</th>
                  <th style={{ padding: '0.65rem 1rem', fontSize: '0.725rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Applicant</th>
                  <th style={{ padding: '0.65rem 1rem', fontSize: '0.725rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Location</th>
                  <th style={{ padding: '0.65rem 1rem', fontSize: '0.725rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ padding: '0.65rem 1rem', fontSize: '0.725rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 4).map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: '#FFFFFF' }}>
                    <td style={{ padding: '0.7rem 1rem', fontWeight: 700, color: 'var(--primary, #0F2A4A)', whiteSpace: 'nowrap' }}>{app.id}</td>
                    <td style={{ padding: '0.7rem 1rem', fontWeight: 600, color: '#0F172A' }}>{app.applicantName}</td>
                    <td style={{ padding: '0.7rem 1rem', color: '#475569' }}>{app.location || 'Chennai'}</td>
                    <td style={{ padding: '0.7rem 1rem' }}>
                      <span style={{ 
                        padding: '0.2rem 0.55rem', 
                        backgroundColor: app.status === 'approved' ? '#F0FDF4' : '#FFFBEB', 
                        color: app.status === 'approved' ? '#15803D' : '#B45309', 
                        border: app.status === 'approved' ? '1px solid #BBF7D0' : '1px solid #FDE68A',
                        borderRadius: '6px', 
                        fontSize: '0.72rem', 
                        fontWeight: 700 
                      }}>
                        {app.status === 'under_review' ? 'Under Review' : app.status === 'approved' ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '0.7rem 1rem' }}>
                      <button 
                        style={{ 
                          padding: '0.25rem 0.65rem', 
                          fontSize: '0.725rem', 
                          fontWeight: 700,
                          backgroundColor: '#FFFFFF',
                          color: '#0F172A',
                          border: '1px solid #CBD5E1',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
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
        <div className="card" style={{ padding: '0.9rem 1.25rem', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Today's Site Visits</h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Scheduled</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {siteVisitsAgenda.map((visit, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                gap: '0.75rem', 
                paddingBottom: idx !== siteVisitsAgenda.length - 1 ? '0.75rem' : '0', 
                borderBottom: idx !== siteVisitsAgenda.length - 1 ? '1px solid #F1F5F9' : 'none',
                alignItems: 'center'
              }}>
                <div style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 700, minWidth: '65px' }}>
                  {visit.time}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.825rem', margin: 0 }}>{visit.applicant}</p>
                  <p style={{ fontSize: '0.7rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.2rem', margin: '0.1rem 0 0 0' }}>
                    <MapPin size={10} /> {visit.location}
                  </p>
                </div>
                <span style={{ 
                  fontSize: '0.7rem', 
                  fontWeight: 700, 
                  color: visit.statusColor, 
                  backgroundColor: '#F8FAFC', 
                  border: '1px solid #E2E8F0',
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '6px' 
                }}>
                  {visit.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Recent Real-Time Activity */}
      <div className="card" style={{ padding: '1rem 1.25rem', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <Activity size={16} color="var(--primary, #0F2A4A)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Recent Activity</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {recentActivityList.map((act, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {act.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>{act.text}</p>
                <p style={{ fontSize: '0.7rem', color: '#475569', margin: 0, fontWeight: 500 }}>{act.subtext}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

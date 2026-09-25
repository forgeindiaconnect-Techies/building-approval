import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Play, CheckCircle, Camera } from 'lucide-react';
import SiteVisitCard from '../../components/site-visit/SiteVisitCard';
import VisitPhotoGallery from '../../components/site-visit/VisitPhotoGallery';
import VisitStatus from '../../components/site-visit/VisitStatus';

export default function SiteVisitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { applications, currentUser } = useApp();
  
  const app = applications.find(a => a.id === id);
  const [localStatus, setLocalStatus] = useState('pending'); // pending, in_progress, completed
  const [remarks, setRemarks] = useState('');
  const [photos, setPhotos] = useState([]);

  if (!app) return <div style={{ padding: '2rem' }}>Application not found.</div>;

  const isAdmin = currentUser === 'Admin';
  
  // Mock data conversion for the UI
  const mockVisitData = {
    visitDate: app.stages[4].visitDate ? new Date(app.stages[4].visitDate).toLocaleDateString('en-GB') : '25 Sep 2026',
    officerName: app.stages[4].officerName || 'Kumar',
    status: localStatus
  };

  const handleStartVisit = () => setLocalStatus('in_progress');
  
  const handleAddPhoto = () => {
    setPhotos([...photos, { url: null }]);
  };

  const handleCompleteVisit = () => {
    if (!remarks) return alert('Please add remarks');
    setLocalStatus('completed');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '1rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Back to Application
        </button>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Site Visit</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>{app.id}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Component 1: Card */}
        <SiteVisitCard visitData={mockVisitData} appData={app} />

        {/* Worker & Admin Views */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Visit Execution</h3>
            <VisitStatus status={localStatus} />
          </div>

          {localStatus === 'pending' && !isAdmin && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You are at the site location. Ready to begin verification?</p>
              <button className="btn btn-primary" onClick={handleStartVisit} style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
                <Play size={18} style={{ display: 'inline', marginRight: '0.5rem' }} /> Start Visit
              </button>
            </div>
          )}

          {localStatus === 'pending' && isAdmin && (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
              Waiting for assigned worker to start the visit...
            </div>
          )}

          {localStatus === 'in_progress' && !isAdmin && (
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Started: Today • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</p>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Visit Photos</label>
                  <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={handleAddPhoto}>
                    <Camera size={14} style={{ display: 'inline', marginRight: '0.25rem' }} /> Add Photo
                  </button>
                </div>
                <VisitPhotoGallery photos={photos} />
              </div>

              <div className="form-group">
                <label className="form-label">Remarks</label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  placeholder="Enter site verification details..."
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                ></textarea>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={handleCompleteVisit} style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={18} /> Complete Visit
                </button>
              </div>
            </div>
          )}

          {localStatus === 'in_progress' && isAdmin && (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
              Worker is currently executing the site visit. Live updates enabled.
            </div>
          )}

          {localStatus === 'completed' && (
            <div>
              <div style={{ backgroundColor: 'var(--surface-hover)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed Date</p>
                    <p style={{ fontWeight: 500 }}>Today • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed By</p>
                    <p style={{ fontWeight: 500 }}>{mockVisitData.officerName}</p>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Remarks</p>
                <p style={{ padding: '1rem', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  {remarks || 'Site verified successfully'}
                </p>
              </div>

              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Photos ({photos.length || 2})</p>
                <VisitPhotoGallery photos={photos.length ? photos : [{url: null}, {url: null}]} />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

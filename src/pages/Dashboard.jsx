import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Search, FileText, CheckCircle, Clock, Copy, Share2, ExternalLink, Eye, EyeOff } from 'lucide-react';

export default function Dashboard() {
  const { applications, currentUser, addApplication, workers, addNewWorker } = useApp();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [newAppLink, setNewAppLink] = useState('');
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerPassword, setNewWorkerPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState('Present');
  const [reportText, setReportText] = useState('');
  
  const [selectedDocs, setSelectedDocs] = useState({
    "Aadhaar / ID Proof": true,
    "Ownership Document": true,
    "Property Document": true,
    "Tax Receipt": true,
    "EC": true,
    "Patta / Chitta": true,
    "Required NOC": false,
    "Other required documents": false
  });
  
  // Filter for worker vs admin
  const visibleApps = currentUser === 'Admin' 
    ? applications 
    : applications.filter(a => a.assignedWorker === currentUser);

  // Stats
  const total = visibleApps.length;
  const docsPending = visibleApps.filter(a => a.stages[1].status !== 'Completed').length;
  const completed = visibleApps.filter(a => a.status === 'approved').length;
  const siteVisitsPending = visibleApps.filter(a => a.status === 'documents_verified').length;
  
  const handleCreate = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      applicantName: formData.get('applicantName'),
      mobile: formData.get('mobile'),
      projectName: formData.get('projectName'),
      address: formData.get('address'),
      location: formData.get('location'),
      pincode: formData.get('pincode'),
      surveyNumber: formData.get('surveyNumber'),
      buildingType: formData.get('buildingType'),
      assignedWorker: currentUser === 'Admin' ? formData.get('assignedWorker') : currentUser,
      remarks: formData.get('remarks'),
      requiredDocs: Object.keys(selectedDocs).filter(k => selectedDocs[k])
    };
    
    const newId = addApplication(data);
    const link = `${window.location.origin}/upload/${newId}`;
    setNewAppLink(link);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4" style={{ marginBottom: '2rem' }}>
        <h2>Dashboard Overview</h2>
        <div className="flex gap-2">
          {currentUser === 'Admin' ? (
            <>
              <button className="btn btn-outline" onClick={() => setShowWorkerModal(true)} style={{ backgroundColor: 'white' }}>
                <Plus size={16} /> Add Worker
              </button>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={16} /> New Application
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-outline" onClick={() => setShowAttendanceModal(true)} style={{ backgroundColor: 'white' }}>
                <CheckCircle size={16} /> Log Attendance
              </button>
              <button className="btn btn-primary" onClick={() => setShowReportModal(true)}>
                <FileText size={16} /> Daily Report
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card flex justify-between items-center">
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Total Applications</p>
            <h3 style={{ fontSize: '2rem', marginTop: '0.25rem' }}>{total}</h3>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--primary-light)', borderRadius: '1rem', color: 'var(--primary)' }}>
            <FileText size={24} />
          </div>
        </div>
        <div className="card flex justify-between items-center">
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>{currentUser === 'Admin' ? 'Doc Collection Pending' : 'Site Visits Pending'}</p>
            <h3 style={{ fontSize: '2rem', marginTop: '0.25rem', color: 'var(--warning)' }}>{currentUser === 'Admin' ? docsPending : siteVisitsPending}</h3>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--warning-bg)', borderRadius: '1rem', color: 'var(--warning)' }}>
            <Clock size={24} />
          </div>
        </div>
        <div className="card flex justify-between items-center">
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Completed</p>
            <h3 style={{ fontSize: '2rem', marginTop: '0.25rem', color: 'var(--success)' }}>{completed}</h3>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--success-bg)', borderRadius: '1rem', color: 'var(--success)' }}>
            <CheckCircle size={24} />
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--background)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Recent Applications</h3>
          <div style={{ position: 'relative', width: '250px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '0.75rem', color: 'var(--text-muted)' }} />
            <input type="text" className="form-control" placeholder="Search applications..." style={{ paddingLeft: '2.25rem', borderRadius: 'var(--radius-full)' }} />
          </div>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>App No</th>
                <th>Applicant</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleApps.map(app => {
                // Determine current stage for display
                let currentStage = 'Stage 1';
                for(let i=1; i<=5; i++) {
                   if(app.stages[i].status !== 'Completed') {
                     currentStage = `Stage ${i}`;
                     break;
                   }
                }
                
                return (
                  <tr key={app.id}>
                    <td style={{ fontWeight: 500 }}>{app.id}</td>
                    <td>{app.applicantName}</td>
                    <td>{app.projectName}</td>
                    <td>{app.assignedWorker}</td>
                    <td>
                      {app.status === 'COMPLETED' ? (
                        <span className="badge badge-completed">Completed</span>
                      ) : (
                        <span className="badge badge-progress">{currentStage}</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }} onClick={() => navigate(`/admin/application/${app.id}`)}>
                          View Details
                        </button>
                        <a href={`/upload/${app.id}`} target="_blank" rel="noreferrer" className="btn" style={{ padding: '0.375rem', fontSize: '0.75rem', backgroundColor: 'var(--surface-hover)', color: 'var(--text-muted)' }} title="Open Customer View">
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {visibleApps.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            {!newAppLink ? (
              <>
                <h3 style={{ marginBottom: '1.5rem' }}>Create New Building Approval</h3>
                <form onSubmit={handleCreate}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Applicant Name</label>
                      <input name="applicantName" type="text" required className="form-control" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mobile Number</label>
                      <input name="mobile" type="text" required className="form-control" />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Project Name</label>
                      <select name="projectName" className="form-control">
                        <option>Alpha Towers</option>
                        <option>Green Valley</option>
                        <option>Skyline Heights</option>
                        <option>Sunrise Apartments</option>
                        <option>Metro Commercial Complex</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Property Address</label>
                      <input name="address" type="text" required className="form-control" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input name="location" type="text" className="form-control" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pincode</label>
                      <input name="pincode" type="text" className="form-control" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Survey Number</label>
                      <input name="surveyNumber" type="text" className="form-control" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Building Type</label>
                      <select name="buildingType" className="form-control">
                        <option>Residential</option>
                        <option>Commercial</option>
                      </select>
                    </div>
                    {currentUser === 'Admin' && (
                      <div className="form-group">
                        <label className="form-label">Assigned Worker</label>
                        <select name="assignedWorker" className="form-control" required>
                          <option value="">-- Select Worker --</option>
                          {workers.map(w => (
                            <option key={w.username} value={w.username}>{w.username}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="form-group" style={{ gridColumn: currentUser === 'Admin' ? 'span 1' : 'span 2' }}>
                      <label className="form-label">Remarks</label>
                      <input name="remarks" type="text" className="form-control" />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Required Documents for Customer</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {Object.keys(selectedDocs).map(doc => (
                          <label key={doc} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                            <input 
                              type="checkbox" 
                              checked={selectedDocs[doc]}
                              onChange={(e) => setSelectedDocs({...selectedDocs, [doc]: e.target.checked})}
                            />
                            {doc}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4" style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Create Application</button>
                  </div>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <CheckCircle size={48} style={{ color: 'var(--success)', margin: '0 auto 1rem' }} />
                <h3>Application Created!</h3>
                <p style={{ margin: '1rem 0' }}>Share this unique link with the customer to upload documents:</p>
                <div style={{ padding: '1rem', backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', wordBreak: 'break-all', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                  <code>{newAppLink}</code>
                </div>
                <div className="flex justify-center gap-4">
                  <button className="btn btn-outline" onClick={() => {
                    navigator.clipboard.writeText(newAppLink);
                    alert("Copied!");
                  }}>
                    <Copy size={16} /> Copy Link
                  </button>
                  <a href={`https://wa.me/?text=${encodeURIComponent(`Hello, please upload your building approval documents here: ${newAppLink}`)}`} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ backgroundColor: '#25D366' }}>
                    Share on WhatsApp
                  </a>
                </div>
                <button className="btn btn-outline w-full mt-4" onClick={() => { setShowModal(false); setNewAppLink(''); }}>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Worker Modal */}
      {showWorkerModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Add New Worker</h3>
            <div className="form-group">
              <label className="form-label">Worker Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={newWorkerName} 
                onChange={(e) => setNewWorkerName(e.target.value)} 
                placeholder="Enter worker name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="form-control" 
                  value={newWorkerPassword} 
                  onChange={(e) => setNewWorkerPassword(e.target.value)} 
                  placeholder="Enter worker password"
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4" style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <button type="button" className="btn btn-outline" onClick={() => { setShowWorkerModal(false); setNewWorkerName(''); setNewWorkerPassword(''); setShowPassword(false); }}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={() => {
                if(newWorkerName.trim() && newWorkerPassword.trim()) {
                  addNewWorker(newWorkerName.trim(), newWorkerPassword.trim());
                  setNewWorkerName('');
                  setNewWorkerPassword('');
                  setShowWorkerModal(false);
                }
              }}>Add Worker</button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Log Daily Attendance</h3>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="text" className="form-control" value={new Date().toLocaleDateString()} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={attendanceStatus} onChange={e => setAttendanceStatus(e.target.value)}>
                <option value="Present">Present</option>
                <option value="Leave">Leave</option>
                <option value="Half Day">Half Day</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Location (GPS)</label>
              <input type="text" className="form-control" value="Fetching location..." disabled />
            </div>
            <div className="flex justify-end gap-2 mt-4" style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowAttendanceModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={() => {
                alert('Attendance logged successfully!');
                setShowAttendanceModal(false);
              }}>Submit Attendance</button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Report Modal */}
      {showReportModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Submit Daily Report</h3>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="text" className="form-control" value={new Date().toLocaleDateString()} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Tasks Completed Today</label>
              <textarea 
                className="form-control" 
                rows="5"
                placeholder="Describe the site visits, document reviews, and other tasks completed today..."
                value={reportText}
                onChange={e => setReportText(e.target.value)}
              ></textarea>
            </div>
            <div className="flex justify-end gap-2 mt-4" style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowReportModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={() => {
                if(!reportText.trim()) return alert('Please enter report details');
                alert('Daily report submitted successfully!');
                setReportText('');
                setShowReportModal(false);
              }}>Submit Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

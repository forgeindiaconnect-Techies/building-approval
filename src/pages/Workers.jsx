import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, UserPlus, Eye, EyeOff } from 'lucide-react';

export default function Workers() {
  const { workers, addNewWorker } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerPassword, setNewWorkerPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const togglePasswordVisibility = (username) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [username]: !prev[username]
    }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4" style={{ marginBottom: '2rem' }}>
        <h2>Worker Management</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <UserPlus size={16} /> Add New Worker
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} color="var(--primary)" /> 
            Registered Workers ({workers.length})
          </h3>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Password</th>
                <th>Total Assigned Apps</th>
              </tr>
            </thead>
            <tbody>
              {workers.map(w => (
                <tr key={w.username}>
                  <td style={{ fontWeight: 500 }}>{w.username}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontFamily: 'monospace', letterSpacing: visiblePasswords[w.username] ? 'normal' : '0.2em' }}>
                        {visiblePasswords[w.username] ? w.password : '••••••••'}
                      </span>
                      <button 
                        onClick={() => togglePasswordVisibility(w.username)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        title="Toggle visibility"
                      >
                        {visiblePasswords[w.username] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </td>
                  <td>--</td>
                </tr>
              ))}
              {workers.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No workers registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Worker Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Add New Worker</h3>
            <div className="form-group">
              <label className="form-label">Worker Name (Username)</label>
              <input 
                type="text" 
                className="form-control" 
                value={newWorkerName} 
                onChange={(e) => setNewWorkerName(e.target.value)} 
                placeholder="Enter worker username"
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
              <button type="button" className="btn btn-outline" onClick={() => { setShowModal(false); setNewWorkerName(''); setNewWorkerPassword(''); setShowPassword(false); }}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={() => {
                if(newWorkerName.trim() && newWorkerPassword.trim()) {
                  addNewWorker(newWorkerName.trim(), newWorkerPassword.trim());
                  setNewWorkerName('');
                  setNewWorkerPassword('');
                  setShowModal(false);
                }
              }}>Add Worker</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

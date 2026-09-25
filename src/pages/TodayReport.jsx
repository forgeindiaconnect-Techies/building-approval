import React from 'react';
import { useApp } from '../context/AppContext';

export default function TodayReport() {
  const { applications, workerLogs, currentUser } = useApp();

  const isWorker = currentUser !== 'Admin';
  
  // Get today's start date
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Filter applications modified today
  let todayApps = applications.filter(app => {
    return app.history.some(h => {
      const hDate = new Date(h.date);
      return hDate >= startOfToday && (isWorker ? h.by === currentUser : true);
    });
  });

  // Today's login logs for the current worker (if worker)
  const todayLogs = workerLogs.filter(log => {
    const lDate = new Date(log.timestamp);
    return lDate >= startOfToday && (isWorker ? log.user === currentUser : true);
  });

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Today's Report</h2>
      
      {isWorker && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Session Activity (Today)</h3>
          <ul style={{ marginTop: '1rem', listStyle: 'none' }}>
            {todayLogs.length === 0 ? <li style={{ color: 'var(--text-muted)' }}>No session logs for today.</li> : null}
            {todayLogs.map((log, i) => (
              <li key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <strong>{log.action}</strong> at {new Date(log.timestamp).toLocaleTimeString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <h3>Applications Handled Today</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Showing applications that had activity recorded today.</p>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>App No</th>
                <th>Project</th>
                {!isWorker && <th>Worker Involved</th>}
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {todayApps.length === 0 && (
                <tr>
                  <td colSpan={isWorker ? 3 : 4} style={{ textAlign: 'center', padding: '1rem' }}>No activity today.</td>
                </tr>
              )}
              {todayApps.map(app => (
                <tr key={app.id}>
                  <td>{app.id}</td>
                  <td>{app.projectName}</td>
                  {!isWorker && <td>{app.assignedWorker}</td>}
                  <td>
                    <span className={`badge ${app.status === 'COMPLETED' ? 'badge-completed' : 'badge-progress'}`}>
                      {app.status}
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

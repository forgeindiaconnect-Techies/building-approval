import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function DashboardLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--background)', transition: 'background-color 0.3s ease' }}>
      <Sidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0, backgroundColor: 'var(--background)', transition: 'background-color 0.3s ease' }}>
        <Navbar />
        <div className="dashboard-content-area" style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--background)', transition: 'background-color 0.3s ease' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

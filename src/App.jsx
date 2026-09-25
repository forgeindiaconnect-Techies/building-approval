import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import Applications from './pages/admin/Applications';
import WorkerApplications from './pages/worker/WorkerApplications';
import WorkerAttendance from './pages/worker/WorkerAttendance';
import AdminAttendance from './pages/admin/AdminAttendance';
import WorkerDailyReport from './pages/worker/WorkerDailyReport';
import AdminDailyReports from './pages/admin/AdminDailyReports';
import WorkerTracking from './pages/admin/WorkerTracking';
import DocumentsPage from './pages/admin/DocumentsPage';
import SiteVisitDetail from './pages/shared/SiteVisitDetail';
import ApplicationDetails from './pages/admin/ApplicationDetails';
import Workers from './pages/Workers';
import Login from './pages/Login';
import Placeholder from './components/Placeholder';
import NotificationsPage from './pages/shared/NotificationsPage';
import ReportsDashboard from './pages/admin/ReportsDashboard';
import CustomerUpload from './pages/CustomerUpload';
import WorkerProfile from './pages/worker/WorkerProfile';
import LandingPage from './pages/LandingPage';
import ApplyNowPage from './pages/ApplyNowPage';
import TrackStatusPage from './pages/TrackStatusPage';
import AdminSettings from './pages/admin/AdminSettings';
import { AppProvider, useApp } from './context/AppContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser } = useApp();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Enforce role-based routing
  if (requiredRole === 'admin' && currentUser !== 'Admin') {
    return <Navigate to="/worker" replace />;
  }
  if (requiredRole === 'worker' && currentUser === 'Admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>

          {/* Public Landing Page, Apply Now, Track Status & Auth */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/apply" element={<ApplyNowPage />} />
          <Route path="/track" element={<TrackStatusPage />} />
          <Route path="/track-status" element={<TrackStatusPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Navigate to="/login" replace />} />
          <Route path="/customer-upload/:id" element={<CustomerUpload />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="applications" element={<Applications />} />
            <Route path="application/:id" element={<ApplicationDetails />} />
            <Route path="application/:id/documents" element={<DocumentsPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="worker-tracking" element={<WorkerTracking />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="daily-reports" element={<AdminDailyReports />} />
            <Route path="site-visits" element={<Placeholder title="Site Visits Schedule" />} />
            <Route path="site-visit/:id" element={<SiteVisitDetail />} />
            <Route path="workers" element={<Workers />} />
            <Route path="locations" element={<Placeholder title="Locations Directory" />} />
            <Route path="reports" element={<ReportsDashboard />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Worker Routes */}
          <Route path="/worker" element={<ProtectedRoute requiredRole="worker"><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<WorkerDashboard />} />
            <Route path="applications" element={<WorkerApplications />} />
            <Route path="application/:id" element={<ApplicationDetails />} />
            <Route path="application/:id/documents" element={<DocumentsPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="attendance" element={<WorkerAttendance />} />
            <Route path="daily-reports" element={<WorkerDailyReport />} />
            <Route path="site-visits" element={<Placeholder title="My Site Visits" />} />
            <Route path="site-visit/:id" element={<SiteVisitDetail />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<WorkerProfile />} />
          </Route>
          
          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;

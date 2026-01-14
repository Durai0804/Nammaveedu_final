import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import ResidentDashboard from './pages/resident/Dashboard';
import Flats from './pages/admin/Flats';
import Maintenance from './pages/admin/Maintenance';
import Complaints from './pages/admin/Complaints';
import Notices from './pages/admin/Notices';
import Visitors from './pages/admin/Visitors';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import SuperAdmin from './pages/admin/SuperAdmin';
import CreateResident from './pages/admin/CreateResident';
import RaiseComplaint from './pages/resident/RaiseComplaint';
import MyComplaints from './pages/resident/MyComplaints';
import ComplaintDetail from './pages/resident/ComplaintDetail';
import ResidentVisitors from './pages/resident/Visitors';
import ResidentNotices from './pages/resident/Notices';
import ResidentSettings from './pages/resident/Settings';

function App() {
  // Redirect /dashboard to role-specific dashboard
  const RoleDashboardRedirect = () => {
    const role = localStorage.getItem('userRole') || 'admin';
    return (
      <Navigate to={role === 'resident' ? '/resident/dashboard' : '/admin/dashboard'} replace />
    );
  };
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<RoleDashboardRedirect />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/resident/dashboard" element={<ResidentDashboard />} />
          <Route path="/resident/complaints/new" element={<RaiseComplaint />} />
          <Route path="/resident/complaints" element={<MyComplaints />} />
          <Route path="/resident/complaints/:id" element={<ComplaintDetail />} />
          <Route path="/resident/visitors" element={<ResidentVisitors />} />
          <Route path="/resident/notices" element={<ResidentNotices />} />
          <Route path="/resident/settings" element={<ResidentSettings />} />
          <Route path="/flats" element={<Flats />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/visitors" element={<Visitors />} />
          <Route path="/admin/residents/create" element={<CreateResident />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />

          {/* Super Admin Route */}
          <Route path="/super-admin" element={<SuperAdmin />} />

          {/* Redirect unknown routes to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;

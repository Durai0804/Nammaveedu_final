import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LanguageProvider } from './context/LanguageContext';

// Pages - Public
import Landing from './pages-v2/Landing';
import Login from './pages-v2/Login';

// Pages - Admin
import AdminDashboard from './pages-v2/admin/Dashboard';
import Flats from './pages-v2/admin/Flats';
import Maintenance from './pages-v2/admin/Maintenance';
import Complaints from './pages-v2/admin/Complaints';
import Notices from './pages-v2/admin/Notices';
import Visitors from './pages-v2/admin/Visitors';
import Reports from './pages-v2/admin/Reports';
import Settings from './pages-v2/admin/Settings';
import SuperAdmin from './pages-v2/admin/SuperAdmin';
import CreateResident from './pages-v2/admin/CreateResident';

// Pages - Resident
import ResidentDashboard from './pages-v2/resident/Dashboard';
import RaiseComplaint from './pages-v2/resident/RaiseComplaint';
import MyComplaints from './pages-v2/resident/MyComplaints';
import ComplaintDetail from './pages-v2/resident/ComplaintDetail';
import ResidentVisitors from './pages-v2/resident/Visitors';
import ResidentNotices from './pages-v2/resident/Notices';
import ResidentSettings from './pages-v2/resident/Settings';

// Page transition wrapper - Smooth crossfade
const PageTransition = ({ children }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
        {children}
    </motion.div>
);

// Animated Routes Component
const AnimatedRoutes = () => {
    const location = useLocation();

    // Redirect /dashboard to role-specific dashboard
    const RoleDashboardRedirect = () => {
        const role = localStorage.getItem('userRole') || 'admin';
        return (
            <Navigate to={role === 'resident' ? '/resident/dashboard' : '/admin/dashboard'} replace />
        );
    };

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Public Routes */}
                <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
                <Route path="/login" element={<PageTransition><Login /></PageTransition>} />

                {/* Dashboard Routes */}
                <Route path="/dashboard" element={<RoleDashboardRedirect />} />
                <Route path="/admin/dashboard" element={<PageTransition><AdminDashboard /></PageTransition>} />
                <Route path="/resident/dashboard" element={<PageTransition><ResidentDashboard /></PageTransition>} />

                {/* Resident Routes */}
                <Route path="/resident/complaints/new" element={<PageTransition><RaiseComplaint /></PageTransition>} />
                <Route path="/resident/complaints" element={<PageTransition><MyComplaints /></PageTransition>} />
                <Route path="/resident/complaints/:id" element={<PageTransition><ComplaintDetail /></PageTransition>} />
                <Route path="/resident/visitors" element={<PageTransition><ResidentVisitors /></PageTransition>} />
                <Route path="/resident/notices" element={<PageTransition><ResidentNotices /></PageTransition>} />
                <Route path="/resident/settings" element={<PageTransition><ResidentSettings /></PageTransition>} />

                {/* Admin Routes */}
                <Route path="/flats" element={<PageTransition><Flats /></PageTransition>} />
                <Route path="/maintenance" element={<PageTransition><Maintenance /></PageTransition>} />
                <Route path="/administration" element={<PageTransition><Maintenance /></PageTransition>} />
                <Route path="/complaints" element={<PageTransition><Complaints /></PageTransition>} />
                <Route path="/notices" element={<PageTransition><Notices /></PageTransition>} />
                <Route path="/visitors" element={<PageTransition><Visitors /></PageTransition>} />
                <Route path="/admin/residents/create" element={<PageTransition><CreateResident /></PageTransition>} />
                <Route path="/reports" element={<PageTransition><Reports /></PageTransition>} />
                <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />

                {/* Super Admin Route */}
                <Route path="/super-admin" element={<PageTransition><SuperAdmin /></PageTransition>} />

                {/* Redirect unknown routes to landing */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AnimatePresence>
    );
};

/**
 * NammaVeedu - Apartment Management System
 * 
 * Main routing configuration with smooth page transitions.
 * Backend APIs remain locked and unchanged.
 */
function App() {
    return (
        <LanguageProvider>
            <Router>
                <AnimatedRoutes />
            </Router>
        </LanguageProvider>
    );
}

export default App;

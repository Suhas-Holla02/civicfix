import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import CitizenDashboard from './pages/CitizenDashboard.jsx';
import SubmitComplaintPage from './pages/SubmitComplaintPage.jsx';
import ComplaintDetailsPage from './pages/ComplaintDetailsPage.jsx';
import MyComplaintsPage from './pages/MyComplaintsPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ComplaintManagementPage from './pages/ComplaintManagementPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import HotspotMapPage from './pages/HotspotMapPage.jsx';
import AboutSdgPage from './pages/AboutSdgPage.jsx';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'ADMIN' || user.role === 'OFFICER' ? '/admin' : '/citizen'} replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/complaints/:id" element={<ComplaintDetailsPage />} />
              <Route path="/map" element={<HotspotMapPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/about-sdg" element={<AboutSdgPage />} />

              {/* Citizen Routes */}
              <Route
                path="/citizen"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN']}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/submit"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN', 'OFFICER']}>
                    <SubmitComplaintPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-complaints"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN', 'OFFICER']}>
                    <MyComplaintsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin & Department Officer Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/complaints"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER']}>
                    <ComplaintManagementPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import DocumentationPage from './components/DocumentationPage'; // NEW

// App Pages
import Dashboard from './components/Dashboard';
import PipelineBuilder from './components/PipelineBuilder';
import AllPipelines from './components/AllPipelines';
import DataSources from './components/DataSources';
import ProcessedData from './components/ProcessedData';
import SettingsPage from './components/SettingsPage';
import DataCatalog from './components/DataCatalog';
import CollaborationPage from './components/CollaborationPage';
import NotificationsPage from './components/NotificationsPage';

// Admin
import AdminDashboard from './components/AdminDashboard';

const App = () => {
  // Simple auth check helper
  const isAuthenticated = () => !!localStorage.getItem('token');

  // Protected Route Wrapper
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/documentation" element={<DocumentationPage />} /> {/* NEW ROUTE */}

        {/* Protected Application Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/builder" element={<ProtectedRoute><PipelineBuilder /></ProtectedRoute>} />
        <Route path="/builder/:id" element={<ProtectedRoute><PipelineBuilder /></ProtectedRoute>} />
        <Route path="/pipelines" element={<ProtectedRoute><AllPipelines /></ProtectedRoute>} />
        <Route path="/datasources" element={<ProtectedRoute><DataSources /></ProtectedRoute>} />
        <Route path="/catalog" element={<ProtectedRoute><DataCatalog /></ProtectedRoute>} />
        <Route path="/collaboration" element={<ProtectedRoute><CollaborationPage /></ProtectedRoute>} />
        <Route path="/processed" element={<ProtectedRoute><ProcessedData /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
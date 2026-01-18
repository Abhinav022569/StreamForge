import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import DocumentationPage from './components/DocumentationPage';

// App Pages
import Dashboard from './components/Dashboard';
import PipelineBuilder from './components/PipelineBuilder';
import AllPipelines from './components/AllPipelines';
import DataSources from './components/DataSources';
import ProcessedData from './components/ProcessedData';
import SettingsPage from './components/SettingsPage'; 
import CollaborationPage from './components/CollaborationPage';
import PipelineHistory from './components/PipelineHistory';
import DataCatalog from './components/DataCatalog'; 
import NotificationsPage from './components/NotificationsPage'; 

// Admin Pages
import AdminDashboard from './components/AdminDashboard';
import AdminUsers from './components/AdminUsers';

// Auth Guard
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !user.is_admin) {
      return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/docs" element={<DocumentationPage />} />
        <Route path="/documentation" element={<DocumentationPage />} /> {/* Alias for docs */}
        
        {/* --- User Routes --- */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/builder" element={<ProtectedRoute><PipelineBuilder /></ProtectedRoute>} />
        <Route path="/builder/:id" element={<ProtectedRoute><PipelineBuilder /></ProtectedRoute>} />
        <Route path="/pipelines" element={<ProtectedRoute><AllPipelines /></ProtectedRoute>} />
        <Route path="/pipelines/:id/history" element={<ProtectedRoute><PipelineHistory /></ProtectedRoute>} />
        <Route path="/datasources" element={<ProtectedRoute><DataSources /></ProtectedRoute>} />
        <Route path="/catalog" element={<ProtectedRoute><DataCatalog /></ProtectedRoute>} />
        <Route path="/collaboration" element={<ProtectedRoute><CollaborationPage /></ProtectedRoute>} />
        <Route path="/processed" element={<ProtectedRoute><ProcessedData /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

        {/* --- Admin Routes --- */}
        <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><AdminUsers /></ProtectedRoute>} />

        {/* --- Fallback --- */}
        <Route path="/app" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
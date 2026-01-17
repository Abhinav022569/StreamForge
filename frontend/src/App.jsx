import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import PipelineBuilder from './components/PipelineBuilder';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Dashboard from './components/Dashboard';
import AllPipelines from './components/AllPipelines';
import DocumentationPage from './components/DocumentationPage';
import DataSources from './components/DataSources';
import ProcessedData from './components/ProcessedData';
import AdminDashboard from './components/AdminDashboard';
import AdminUsers from './components/AdminUsers';
import SettingsPage from './components/SettingsPage'; 
import CollaborationPage from './components/CollaborationPage';
import PipelineHistory from './components/PipelineHistory';
import DataCatalog from './components/DataCatalog'; // IMPORT NEW COMPONENT

// Security Guard: Checks for a token before letting you in
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
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/docs" element={<DocumentationPage />} />
        
        {/* Protected Routes */}
        <Route 
          path="/datasources" 
          element={
            <ProtectedRoute>
              <DataSources />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/pipelines" 
          element={
            <ProtectedRoute>
              <AllPipelines />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/pipelines/:id/history" 
          element={
            <ProtectedRoute>
              <PipelineHistory />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/builder/:id?" 
          element={
            <ProtectedRoute>
              <PipelineBuilder />
            </ProtectedRoute>
          } 
        />

        <Route path="/app" element={<Navigate to="/dashboard" replace />} />

        <Route 
          path="/processed" 
          element={
            <ProtectedRoute>
              <ProcessedData />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/collaboration" 
          element={
            <ProtectedRoute>
              <CollaborationPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } 
        />

        {/* NEW DATA CATALOG ROUTE */}
        <Route 
          path="/catalog" 
          element={
            <ProtectedRoute>
              <DataCatalog />
            </ProtectedRoute>
          } 
        />

        {/* ADMIN ROUTES */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminUsers />
            </ProtectedRoute>
          } 
        />

      </Routes>
    </Router>
  );
}

export default App;
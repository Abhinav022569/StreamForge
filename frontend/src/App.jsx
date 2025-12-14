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
import AdminUsers from './components/AdminUsers'; // Import new component

// Security Guard: Checks for a token before letting you in
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    // If not logged in, kick them back to the login page
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !user.is_admin) {
      // If route is admin-only but user is not admin, go to dashboard
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
        
        {/* Protected Routes (Require Login) */}
        <Route path="/datasources" element={<ProtectedRoute><DataSources /></ProtectedRoute>} />
        
        {/* 1. The Dashboard (Home for logged-in users) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* 2. All Pipelines List Page */}
        <Route 
          path="/pipelines" 
          element={
            <ProtectedRoute>
              <AllPipelines />
            </ProtectedRoute>
          } 
        />

        {/* 3. The Builder (With optional ID parameter for editing) */}
        <Route 
          path="/builder/:id?" 
          element={
            <ProtectedRoute>
              <PipelineBuilder />
            </ProtectedRoute>
          } 
        />

        {/* 4. Redirect old /app links to the dashboard */}
        <Route path="/app" element={<Navigate to="/dashboard" replace />} />

        <Route 
          path="/processed" 
          element={
            <ProtectedRoute>
              <ProcessedData />
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
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import PipelineBuilder from './components/PipelineBuilder';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Dashboard from './components/Dashboard';

// Security Guard: Checks for a token before letting you in
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // If not logged in, kick them back to the login page
    return <Navigate to="/login" replace />;
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
        
        {/* Protected Routes (Require Login) */}
        
        {/* 1. The Dashboard (Home for logged-in users) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* 2. The Builder (With optional ID parameter for editing) */}
        <Route 
          path="/builder/:id?" 
          element={
            <ProtectedRoute>
              <PipelineBuilder />
            </ProtectedRoute>
          } 
        />

        {/* 3. Redirect old /app links to the dashboard */}
        <Route path="/app" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </Router>
  );
}

export default App;
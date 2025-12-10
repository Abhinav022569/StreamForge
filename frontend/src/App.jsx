import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import PipelineBuilder from './components/PipelineBuilder';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Dashboard from './components/Dashboard'; // <--- Import Dashboard

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* NEW DASHBOARD ROUTE */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* BUILDER ROUTE (Renamed from /app to /builder for clarity) */}
        <Route 
          path="/builder" 
          element={
            <ProtectedRoute>
              <PipelineBuilder />
            </ProtectedRoute>
          } 
        />

        {/* Redirect old /app requests to dashboard if needed */}
        <Route path="/app" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </Router>
  );
}

export default App;
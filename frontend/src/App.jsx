import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import PipelineBuilder from './components/PipelineBuilder';

function App() {
  return (
    // REMOVED style={{ padding: '20px' }} from here
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<PipelineBuilder />} />
      </Routes>
    </Router>
  );
}

export default App;
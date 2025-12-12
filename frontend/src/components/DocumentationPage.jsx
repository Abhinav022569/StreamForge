import React from 'react';
import { useNavigate } from 'react-router-dom';
import ParticlesBackground from './ParticlesBackground';
import logo from '../assets/logo.png';

const DocumentationPage = () => {
  const navigate = useNavigate();

  // Reuse the glassmorphism style from Landing Page
  const glassStyle = {
    background: 'rgba(24, 24, 27, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '40px',
    borderRadius: '12px',
    marginBottom: '30px',
    color: '#e4e4e7',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  };

  const navStyle = {
    ...glassStyle,
    padding: '15px 50px',
    borderRadius: '0',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    marginBottom: '50px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  };

  return (
    <ParticlesBackground>
      <div style={{ minHeight: '100vh', paddingBottom: '50px' }}>
        
        {/* 1. STICKY NAVBAR */}
        <nav style={navStyle}>
             <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
                <img src={logo} alt="Logo" style={{ width: '30px', borderRadius: '4px' }} />
                StreamForge Docs
             </div>
             <div style={{ display: 'flex', gap: '15px' }}>
                <button 
                    onClick={() => navigate('/login')} 
                    style={{ background: 'transparent', color: '#9ca3af', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                >
                    Log In
                </button>
                <button 
                    onClick={() => navigate('/')} 
                    style={{ border: '1px solid #10b981', color: '#10b981', padding: '8px 20px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', cursor: 'pointer', fontWeight: '600' }}
                >
                    Back to Home
                </button>
             </div>
        </nav>

        {/* 2. MAIN CONTENT CONTAINER */}
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
            
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '15px', color: 'white', lineHeight: '1.1' }}>
                    Documentation
                </h1>
                <p style={{ color: '#9ca3af', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
                    Everything you need to build powerful ETL pipelines without writing a single line of code.
                </p>
            </div>

            {/* Section 1: Introduction */}
            <div style={glassStyle}>
                <h2 style={{ color: '#10b981', marginBottom: '20px', fontSize: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                    1. Introduction
                </h2>
                <p style={{ lineHeight: '1.8', fontSize: '16px', color: '#d1d5db' }}>
                    StreamForge is a visual ETL (Extract, Transform, Load) builder designed for data engineers and analysts who value speed and simplicity. 
                    It allows you to construct complex data workflows by simply dragging and dropping nodes onto a canvas, connecting them to define logic, and executing them on a powerful Pandas-based backend.
                </p>
            </div>

            {/* Section 2: Getting Started */}
            <div style={glassStyle}>
                <h2 style={{ color: '#10b981', marginBottom: '20px', fontSize: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                    2. Getting Started
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <Step number="01" title="Create an Account" desc="Sign up for free to access your personal dashboard." />
                    <Step number="02" title="Start a Project" desc="Click '+ Create New Pipeline' in your dashboard." />
                    <Step number="03" title="Design Flow" desc="Drag nodes from the sidebar and connect them." />
                    <Step number="04" title="Save & Run" desc="Persist your work to the database and execute the transformation." />
                </div>
            </div>

            {/* Section 3: Core Nodes */}
            <div style={glassStyle}>
                <h2 style={{ color: '#10b981', marginBottom: '20px', fontSize: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                    3. Node Reference
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                    <NodeCard icon="📂" title="Source: CSV" desc="Upload or link a raw CSV file as your data input source." />
                    <NodeCard icon="⚙️" title="Filter Data" desc="Apply conditional logic (e.g., Age > 18) to exclude rows." />
                    <NodeCard icon="💾" title="Destination: DB" desc="Save the processed, clean data into your target SQL database." />
                </div>
            </div>

        </div>
      </div>
    </ParticlesBackground>
  );
};

// --- Helper Components ---
const Step = ({ number, title, desc }) => (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '5px 10px', borderRadius: '4px' }}>{number}</div>
        <div>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: 'white' }}>{title}</h3>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '15px' }}>{desc}</p>
        </div>
    </div>
);

const NodeCard = ({ icon, title, desc }) => (
    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>{icon}</div>
        <h3 style={{ color: 'white', marginBottom: '10px', fontSize: '16px' }}>{title}</h3>
        <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.5', margin: 0 }}>{desc}</p>
    </div>
);

export default DocumentationPage;
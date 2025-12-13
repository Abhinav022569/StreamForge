import React from 'react';
import { useNavigate } from 'react-router-dom';
import ParticlesBackground from './ParticlesBackground';
import logo from '../assets/logo.png';
import '../App.css'; // Import shared styles

const DocumentationPage = () => {
  const navigate = useNavigate();

  return (
    <ParticlesBackground>
      <div style={{ minHeight: '100vh', paddingBottom: '50px' }}>
        
        {/* 1. STICKY NAVBAR */}
        <nav className="docs-nav">
             <div 
                className="flex items-center gap-10 pointer" 
                onClick={() => navigate('/')} 
                style={{ fontSize: '20px', fontWeight: 'bold' }}
             >
                <img src={logo} alt="Logo" style={{ width: '30px', borderRadius: '4px' }} />
                StreamForge Docs
             </div>
             
             <div className="flex gap-20">
                <button 
                    className="btn btn-ghost"
                    onClick={() => navigate('/login')} 
                >
                    Log In
                </button>
                <button 
                    className="btn"
                    onClick={() => navigate('/')} 
                    style={{ 
                        border: '1px solid var(--success)', 
                        color: 'var(--success)', 
                        background: 'rgba(16, 185, 129, 0.1)' 
                    }}
                >
                    Back to Home
                </button>
             </div>
        </nav>

        {/* 2. MAIN CONTENT CONTAINER */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
            
            {/* Header */}
            <div className="text-center" style={{ marginBottom: '60px' }}>
                <h1 className="landing-h1">
                    Documentation
                </h1>
                <p className="landing-p">
                    Everything you need to build powerful ETL pipelines without writing a single line of code.
                </p>
            </div>

            {/* Section 1: Introduction */}
            <div className="glass-panel">
                <h2 className="text-success" style={{ marginBottom: '20px', fontSize: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                    1. Introduction
                </h2>
                <p className="text-muted" style={{ lineHeight: '1.8', fontSize: '16px' }}>
                    StreamForge is a visual ETL (Extract, Transform, Load) builder designed for data engineers and analysts who value speed and simplicity. 
                    It allows you to construct complex data workflows by simply dragging and dropping nodes onto a canvas, connecting them to define logic, and executing them on a powerful Pandas-based backend.
                </p>
            </div>

            {/* Section 2: Getting Started */}
            <div className="glass-panel">
                <h2 className="text-success" style={{ marginBottom: '20px', fontSize: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                    2. Getting Started
                </h2>
                <div className="flex-col gap-20">
                    <Step number="01" title="Create an Account" desc="Sign up for free to access your personal dashboard." />
                    <Step number="02" title="Start a Project" desc="Click '+ Create New Pipeline' in your dashboard." />
                    <Step number="03" title="Design Flow" desc="Drag nodes from the sidebar and connect them." />
                    <Step number="04" title="Save & Run" desc="Persist your work to the database and execute the transformation." />
                </div>
            </div>

            {/* Section 3: Core Nodes */}
            <div className="glass-panel">
                <h2 className="text-success" style={{ marginBottom: '20px', fontSize: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
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
    <div className="flex gap-20" style={{ alignItems: 'flex-start' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '5px 10px', borderRadius: '4px' }}>
            {number}
        </div>
        <div>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: 'var(--text-main)' }}>{title}</h3>
            <p className="text-muted" style={{ margin: 0, fontSize: '15px' }}>{desc}</p>
        </div>
    </div>
);

const NodeCard = ({ icon, title, desc }) => (
    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>{icon}</div>
        <h3 style={{ color: 'white', marginBottom: '10px', fontSize: '16px' }}>{title}</h3>
        <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.5', margin: 0 }}>{desc}</p>
    </div>
);

export default DocumentationPage;
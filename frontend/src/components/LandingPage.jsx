import React from 'react';
import { useNavigate } from 'react-router-dom';
import ParticlesBackground from './ParticlesBackground';
import logo from '../assets/logo.png';
import '../App.css'; // Updated to use the global stylesheet

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <ParticlesBackground>
      <div className="landing-page">
        
        {/* 1. NAVBAR */}
        <nav className="landing-nav">
          <div className="landing-logo" onClick={() => navigate('/')}>
            <img 
              src={logo} 
              alt="StreamForge Logo" 
              className="landing-logo-img"
            />
            StreamForge
          </div>
          
          <div className="landing-nav-actions">
            <button onClick={() => navigate('/login')} className="landing-btn-nav-login">
              Log in
            </button>
            <button onClick={() => navigate('/signup')} className="landing-btn-nav-signup">
              Sign Up
            </button>
          </div>
        </nav>

        {/* 2. HERO SECTION */}
        <section className="landing-hero-section">
          <div className="landing-container">
            <h1 className="landing-h1">
              Stop Writing Scripts.<br />
              Start Drawing Pipelines.
            </h1>
            <p className="landing-p">
              The visual ETL builder for data engineers who value their time. 
              Extract, Transform, and Load data without writing a single line of Pandas code.
            </p>
            <div className="mt-30">
              <button className="landing-btn-primary" onClick={() => navigate('/app')}>
                Start Building Free <span>→</span>
              </button>
              <button className="landing-btn-secondary" onClick={()=> navigate('/docs')}>
                View Documentation
              </button>
            </div>
          </div>
        </section>

        {/* 3. THREE FEATURE CARDS */}
        <section className="landing-features-section">
          <div className="landing-container landing-grid-3">
            
            {/* Card 1 */}
            <div className="landing-glass-card">
              <div className="landing-icon-box">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
              </div>
              <h3 className="landing-h3">Visual Node Editor</h3>
              <p className="landing-p text-left" style={{fontSize: '15px'}}>
                Drag and drop sources, filters, and destinations. Visualize your data lineage instantly with React Flow.
              </p>
            </div>

            {/* Card 2 */}
            <div className="landing-glass-card">
              <div className="landing-icon-box">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="landing-h3">Powered by Pandas</h3>
              <p className="landing-p text-left" style={{fontSize: '15px'}}>
                Your visual flows are converted into optimized Python Pandas operations on the backend for maximum speed.
              </p>
            </div>

            {/* Card 3 */}
            <div className="landing-glass-card">
              <div className="landing-icon-box">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              </div>
              <h3 className="landing-h3">Save & Reuse</h3>
              <p className="landing-p text-left" style={{fontSize: '15px'}}>
                Persist your workflows to the database. Load complex pipelines instantly and run them anytime.
              </p>
            </div>

          </div>
        </section>

        {/* 4. SPLIT SECTION: HOW IT WORKS */}
        <section className="landing-how-it-works-section">
          <div className="landing-container landing-grid-2">
            
            {/* Left: Text */}
            <div className="landing-text-content">
              <p className="landing-subtitle">
                How it works
              </p>
              <h2 className="landing-h2" style={{ lineHeight: '1.2' }}>
                Visual simplicity,<br />
                Python power.
              </h2>
              <p className="landing-p text-left mb-30">
                Don't choose between a drag-and-drop interface and powerful data processing. StreamForge gives you both.
              </p>
              
              <ul className="landing-list">
                {['Design pipelines visually', 'Execute via Flask API', 'Process with Pandas'].map((item, i) => (
                  <li key={i} className="landing-list-item">
                    <div className="landing-checkmark">✓</div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Code Block Visual */}
            <div className="code-block">
              <div className="code-dots">
                <div className="code-dot red"></div>
                <div className="code-dot yellow"></div>
                <div className="code-dot green"></div>
              </div>
              
              <div className="code-content">
                <span className="hl-comment"># StreamForge Engine Logic</span><br/>
                <span className="hl-def">def</span> <span className="hl-func">run_pipeline</span>(json_data):<br/>
                &nbsp;&nbsp;<span className="hl-comment">"""Executes the visual flow"""</span><br/>
                &nbsp;&nbsp;df = pd.read_csv(json_data[<span className="hl-str">'source'</span>])<br/>
                <br/>
                &nbsp;&nbsp;<span className="hl-key">if</span> json_data[<span className="hl-str">'action'</span>] == <span className="hl-str">'filter'</span>:<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;df = df[df[<span className="hl-str">'col'</span>] &gt; 50]<br/>
                <br/>
                &nbsp;&nbsp;<span className="hl-key">return</span> df.to_json()<br/>
              </div>
            </div>

          </div>
        </section>

        {/* 5. DESIGNED FOR SCALE */}
        <section className="landing-everything-section">
          <div className="landing-container">
            <div className="landing-section-header">
              <h2 className="landing-h2">Everything you need</h2>
              <p className="landing-p">From simple CSV cleanups to complex data workflows.</p>
            </div>

            <div className="landing-grid-3">
               <div className="landing-glass-card landing-glass-card-large">
                 <h3 className="landing-h3">Data Cleaning</h3>
                 <p className="landing-p text-left" style={{fontSize: '15px'}}>
                   Automatically remove null values, fix formatting errors, and standardize text across your datasets.
                 </p>
               </div>
               <div className="landing-glass-card landing-glass-card-large">
                 <h3 className="landing-h3">Smart Filtering</h3>
                 <p className="landing-p text-left" style={{fontSize: '15px'}}>
                   Use logic-based nodes to filter out irrelevant rows, ensuring only high-quality data reaches your destination.
                 </p>
               </div>
               <div className="landing-glass-card landing-glass-card-large">
                 <h3 className="landing-h3">Extensible</h3>
                 <p className="landing-p text-left" style={{fontSize: '15px'}}>
                   Built on top of Pandas and Flask, allowing you to add custom Python modules easily.
                 </p>
               </div>
            </div>
          </div>
        </section>

        {/* 6. BOTTOM CTA */}
        <section className="landing-cta-section">
          <div className="landing-container landing-glass-card landing-cta-card">
            <h2 className="landing-h2 landing-cta-title">Ready to modernize your workflow?</h2>
            <p className="landing-p mb-30">
              Join the no-code data revolution today.
            </p>
            <button className="landing-btn-primary" onClick={() => navigate('/app')}>
              Launch App Now
            </button>
          </div>
        </section>

        {/* 7. FOOTER */}
        <footer className="landing-footer">
          © 2025 StreamForge. Built for builders.
        </footer>

      </div>
    </ParticlesBackground>
  );
};

export default LandingPage;
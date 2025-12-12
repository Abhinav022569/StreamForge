import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import ParticlesBackground from './ParticlesBackground'; // <--- NEW IMPORT

const LandingPage = () => {
  const navigate = useNavigate();

  // Glassmorphism effect for cards to let particles show through
  const glassCardStyle = {
    background: 'rgba(24, 24, 27, 0.6)', 
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '30px',
    borderRadius: '12px',
    textAlign: 'left'
  };

  return (
    <ParticlesBackground>
      {/* Background is now transparent to show particles */}
      <div className="landing-page" style={{ backgroundColor: 'transparent' }}>
        
        {/* 1. NAVBAR */}
        <nav className="landing-nav" style={{ background: 'rgba(15, 17, 21, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="landing-logo" onClick={() => navigate('/')}>
            <div style={{ width: '30px', height: '30px', background: '#10b981', borderRadius: '6px' }}></div>
            StreamForge
          </div>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button onClick={() => navigate('/login')} className="landing-btn-nav-login">
              Log in
            </button>
            <button onClick={() => navigate('/signup')} className="landing-btn-nav-signup">
              Sign Up
            </button>
          </div>
        </nav>

        {/* 2. HERO SECTION */}
        <section style={{ padding: '80px 0 60px', textAlign: 'center' }}>
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
              <button className="landing-btn-secondary">
                View Documentation
              </button>
            </div>
          </div>
        </section>

        {/* 3. THREE FEATURE CARDS */}
        <section style={{ padding: '40px 0' }}>
          <div className="landing-container landing-grid-3">
            
            {/* Card 1 */}
            <div style={glassCardStyle}>
              <div className="landing-icon-box">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
              </div>
              <h3 className="landing-h3">Visual Node Editor</h3>
              <p className="landing-p text-left" style={{fontSize: '15px'}}>
                Drag and drop sources, filters, and destinations. Visualize your data lineage instantly with React Flow.
              </p>
            </div>

            {/* Card 2 */}
            <div style={glassCardStyle}>
              <div className="landing-icon-box">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="landing-h3">Powered by Pandas</h3>
              <p className="landing-p text-left" style={{fontSize: '15px'}}>
                Your visual flows are converted into optimized Python Pandas operations on the backend for maximum speed.
              </p>
            </div>

            {/* Card 3 */}
            <div style={glassCardStyle}>
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
        <section style={{ padding: '80px 0' }}>
          <div className="landing-container landing-grid-2">
            
            {/* Left: Text */}
            <div style={{ textAlign: 'left' }}>
              <p style={{ color: '#10b981', fontWeight: 'bold', fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
                How it works
              </p>
              <h2 className="landing-h2" style={{ lineHeight: '1.2' }}>
                Visual simplicity,<br />
                Python power.
              </h2>
              <p className="landing-p text-left mb-30">
                Don't choose between a drag-and-drop interface and powerful data processing. StreamForge gives you both.
              </p>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {['Design pipelines visually', 'Execute via Flask API', 'Process with Pandas'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: '#fff', fontWeight: '500' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontSize: '12px' }}>✓</div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Code Block Visual */}
            <div className="code-block" style={{ ...glassCardStyle, padding: '24px', fontFamily: 'monospace' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308' }}></div>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }}></div>
              </div>
              
              <div style={{ lineHeight: '1.6' }}>
                <span style={{ color: '#6b7280' }}># StreamForge Engine Logic</span><br/>
                <span style={{ color: '#eab308' }}>def</span> <span style={{ color: '#60a5fa' }}>run_pipeline</span>(json_data):<br/>
                &nbsp;&nbsp;<span style={{ color: '#6b7280' }}>"""Executes the visual flow"""</span><br/>
                &nbsp;&nbsp;df = pd.read_csv(json_data[<span style={{ color: '#a5f3fc' }}>'source'</span>])<br/>
                <br/>
                &nbsp;&nbsp;<span style={{ color: '#f472b6' }}>if</span> json_data[<span style={{ color: '#a5f3fc' }}>'action'</span>] == <span style={{ color: '#a5f3fc' }}>'filter'</span>:<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;df = df[df[<span style={{ color: '#a5f3fc' }}>'col'</span>] &gt; 50]<br/>
                <br/>
                &nbsp;&nbsp;<span style={{ color: '#f472b6' }}>return</span> df.to_json()<br/>
              </div>
            </div>

          </div>
        </section>

        {/* 5. DESIGNED FOR SCALE */}
        <section style={{ padding: '60px 0' }}>
          <div className="landing-container">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 className="landing-h2">Everything you need</h2>
              <p className="landing-p">From simple CSV cleanups to complex data workflows.</p>
            </div>

            <div className="landing-grid-3">
               <div style={{...glassCardStyle, padding: '40px'}}>
                 <h3 className="landing-h3">Data Cleaning</h3>
                 <p className="landing-p text-left" style={{fontSize: '15px'}}>
                   Automatically remove null values, fix formatting errors, and standardize text across your datasets.
                 </p>
               </div>
               <div style={{...glassCardStyle, padding: '40px'}}>
                 <h3 className="landing-h3">Smart Filtering</h3>
                 <p className="landing-p text-left" style={{fontSize: '15px'}}>
                   Use logic-based nodes to filter out irrelevant rows, ensuring only high-quality data reaches your destination.
                 </p>
               </div>
               <div style={{...glassCardStyle, padding: '40px'}}>
                 <h3 className="landing-h3">Extensible</h3>
                 <p className="landing-p text-left" style={{fontSize: '15px'}}>
                   Built on top of Pandas and Flask, allowing you to add custom Python modules easily.
                 </p>
               </div>
            </div>
          </div>
        </section>

        {/* 6. BOTTOM CTA */}
        <section style={{ padding: '80px 0', marginTop: '40px' }}>
          <div className="landing-container" style={{ ...glassCardStyle, background: 'rgba(17, 24, 39, 0.8)', padding: '60px', textAlign: 'center' }}>
            <h2 className="landing-h2" style={{ fontSize: '32px' }}>Ready to modernize your workflow?</h2>
            <p className="landing-p mb-30">
              Join the no-code data revolution today.
            </p>
            <button className="landing-btn-primary" onClick={() => navigate('/app')}>
              Launch App Now
            </button>
          </div>
        </section>

        {/* 7. FOOTER */}
        <footer style={{ textAlign: 'center', padding: '50px', color: '#555', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '50px', background: 'rgba(15, 17, 21, 0.8)' }}>
          © 2025 StreamForge. Built for builders.
        </footer>

      </div>
    </ParticlesBackground>
  );
};

export default LandingPage;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // Import framer-motion
import ParticlesBackground from './ParticlesBackground';
import logo from '../assets/logo.png';
import '../App.css'; 

const LandingPage = () => {
  const navigate = useNavigate();

  // Animation variants for cleaner code
  const slideFromLeft = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const slideFromRight = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <ParticlesBackground>
      <div className="landing-page">
        
        {/* 1. NAVBAR */}
        <nav className="landing-nav" style={{ borderBottom: '1px solid rgba(16, 185, 129, 0.1)' }}>
          <div className="landing-logo" onClick={() => navigate('/')}>
            <img 
              src={logo} 
              alt="StreamForge Logo" 
              className="landing-logo-img"
              style={{ boxShadow: '0 0 10px rgba(16,185,129,0.4)' }}
            />
            StreamForge
          </div>
          
          <div className="landing-nav-actions">
            <button onClick={() => navigate('/login')} className="landing-btn-nav-login">
              Log in
            </button>
            <button onClick={() => navigate('/signup')} className="landing-btn-nav-signup" style={{ boxShadow: '0 0 15px rgba(16,185,129,0.3)' }}>
              Sign Up
            </button>
          </div>
        </nav>

        {/* 2. HERO SECTION */}
        <section className="landing-hero-section" style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Decorative Glow */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
            zIndex: -1, pointerEvents: 'none'
          }}></div>

          <motion.div 
            className="landing-container landing-hero-content"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <div style={{ display: 'inline-block', marginBottom: '20px', padding: '5px 15px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', fontSize: '14px', fontWeight: 'bold' }}>
              ✨ The Future of ETL is Here
            </div>
            
            <h1 className="landing-h1 text-gradient" style={{ fontSize: '64px', marginBottom: '20px' }}>
              Stop Writing Scripts.<br />
              Start Drawing Pipelines.
            </h1>
            
            <p className="landing-p" style={{ fontSize: '20px', maxWidth: '700px' }}>
              The visual data builder for the modern era. 
              Extract, Transform, and Load data with a futuristic drag-and-drop interface.
            </p>
            
            <div className="mt-30" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <button 
                className="landing-btn-primary" 
                onClick={() => navigate('/app')}
                style={{ padding: '15px 40px', fontSize: '18px', boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}
              >
                Start Building Free <span>→</span>
              </button>
              <button 
                className="landing-btn-secondary" 
                onClick={()=> navigate('/docs')}
                style={{ padding: '15px 30px', fontSize: '18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                View Documentation
              </button>
            </div>
          </motion.div>
        </section>

        {/* 3. FEATURE CARDS */}
        <section className="landing-features-section">
          <div className="landing-container landing-grid-3">
            
            {[
              { title: "Visual Node Editor", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z", desc: "Drag and drop sources, filters, and destinations. Visualize your data lineage instantly.", delay: 0 },
              { title: "Powered by Pandas", icon: "M13 10V3L4 14h7v7l9-11h-7z", desc: "Your visual flows are converted into optimized Python Pandas operations on the backend.", delay: 0.2 },
              { title: "Save & Reuse", icon: "M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4", desc: "Persist your workflows to the database. Load complex pipelines instantly and run them anytime.", delay: 0.4 }
            ].map((card, i) => (
              <motion.div 
                key={i}
                className="landing-glass-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: card.delay }}
              >
                <div className="landing-icon-box">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d={card.icon} /></svg>
                </div>
                <h3 className="landing-h3">{card.title}</h3>
                <p className="landing-p text-left" style={{fontSize: '15px', color: '#a1a1aa'}}>{card.desc}</p>
              </motion.div>
            ))}

          </div>
        </section>

        {/* 4. SPLIT SECTION: HOW IT WORKS (ANIMATED WITH FRAMER MOTION) */}
        <section className="landing-how-it-works-section" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '0', top: '20%', width: '300px', height: '300px', background: 'rgba(59, 130, 246, 0.1)', filter: 'blur(80px)', borderRadius: '50%', zIndex: -1 }}></div>

          <div className="landing-container landing-grid-2">
            
            {/* LEFT SIDE: Slides in from LEFT */}
            <motion.div 
              className="landing-text-content"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }} // Triggers when 100px into view
              variants={slideFromLeft}
            >
              <p className="landing-subtitle" style={{ color: '#10b981', letterSpacing: '2px' }}>
                ARCHITECTURE
              </p>
              <h2 className="landing-h2 text-gradient" style={{ fontSize: '42px', lineHeight: '1.2' }}>
                Visual simplicity.<br />
                Python power.
              </h2>
              <p className="landing-p text-left mb-30" style={{ fontSize: '18px' }}>
                Don't choose between a drag-and-drop interface and powerful data processing. StreamForge gives you both.
              </p>
              
              <ul className="landing-list">
                {['Design pipelines visually', 'Execute via Flask API', 'Process with Pandas'].map((item, i) => (
                  <li key={i} className="landing-list-item" style={{ fontSize: '18px', marginBottom: '15px' }}>
                    <div className="landing-checkmark" style={{ background: '#10b981', color: 'black', border: 'none', fontWeight: 'bold' }}>✓</div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* RIGHT SIDE: Slides in from RIGHT */}
            <motion.div 
              className="code-block code-block-floating"
              style={{ background: '#0f1115' }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={slideFromRight}
            >
              <div className="code-dots">
                <div className="code-dot red"></div>
                <div className="code-dot yellow"></div>
                <div className="code-dot green"></div>
              </div>
              
              <div className="code-content" style={{ fontSize: '16px' }}>
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
            </motion.div>

          </div>
        </section>

        {/* 5. DESIGNED FOR SCALE (Simple Fade Up) */}
        <section className="landing-everything-section">
          <div className="landing-container">
            <motion.div 
              className="landing-section-header"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="landing-h2">Everything you need</h2>
              <p className="landing-p">From simple CSV cleanups to complex data workflows.</p>
            </motion.div>

            <div className="landing-grid-3">
               {[
                 { title: "Data Cleaning", desc: "Automatically remove null values, fix formatting errors, and standardize text." },
                 { title: "Smart Filtering", desc: "Use logic-based nodes to filter out irrelevant rows." },
                 { title: "Extensible", desc: "Built on top of Pandas and Flask, allowing you to add custom Python modules easily." }
               ].map((item, i) => (
                 <motion.div 
                    key={i}
                    className="landing-glass-card landing-glass-card-large"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                 >
                   <h3 className="landing-h3">{item.title}</h3>
                   <p className="landing-p text-left" style={{fontSize: '15px', color: '#a1a1aa'}}>
                     {item.desc}
                   </p>
                 </motion.div>
               ))}
            </div>
          </div>
        </section>

        {/* 6. BOTTOM CTA */}
        <section className="landing-cta-section">
          <motion.div 
            className="landing-container landing-glass-card landing-cta-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <h2 className="landing-h2 landing-cta-title text-gradient">Ready to modernize your workflow?</h2>
            <p className="landing-p mb-30" style={{ color: 'white' }}>
              Join the no-code data revolution today.
            </p>
            <button className="landing-btn-primary" onClick={() => navigate('/app')} style={{ fontSize: '18px', padding: '15px 40px' }}>
              Launch App Now
            </button>
          </motion.div>
        </section>

        {/* 7. FOOTER */}
        <footer className="landing-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          © 2025 StreamForge. Built for builders.
        </footer>

      </div>
    </ParticlesBackground>
  );
};

export default LandingPage;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ParticlesBackground from './ParticlesBackground';
import logo from '../assets/logo.png';
import '../App.css'; 

const LandingPage = () => {
  const navigate = useNavigate();

  // Animation variants
  const slideFromLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const slideFromRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <ParticlesBackground>
      <div className="landing-page" style={{ overflowX: 'hidden' }}>
        
        {/* 1. NAVBAR (Fixed Top with Blur) */}
        <nav className="landing-nav" style={{ 
            borderBottom: '1px solid rgba(16, 185, 129, 0.1)', 
            padding: '15px 20px',
            background: 'rgba(15, 17, 21, 0.85)', // Slightly darker for better contrast
            backdropFilter: 'blur(12px)'          // Ensure blur is consistent
        }}>
          <div className="landing-logo" onClick={() => navigate('/')}>
            <motion.img 
              src={logo} 
              alt="StreamForge Logo" 
              className="landing-logo-img"
              style={{ boxShadow: '0 0 10px rgba(16,185,129,0.4)' }}
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.8 }}
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
        <section className="landing-hero-section" style={{ 
            position: 'relative', 
            overflow: 'hidden', 
            // [FIX] Increased top padding to 120px to clear the fixed Navbar
            padding: '120px 20px 60px 20px' 
        }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '80vw', height: '80vw', maxWidth: '600px', maxHeight: '600px',
            background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
            zIndex: -1, pointerEvents: 'none'
          }}></div>

          <motion.div 
            className="landing-container landing-hero-content"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            style={{ width: '100%' }}
          >
            
            
            <h1 className="landing-h1 text-gradient" style={{ fontSize: 'clamp(36px, 8vw, 64px)', marginBottom: '20px', lineHeight: '1.2' }}>
              Collaborative Data Pipelines<br />
              Built for Speed.
            </h1>
            
            <p className="landing-p" style={{ fontSize: 'clamp(16px, 4vw, 20px)', maxWidth: '700px', margin: '0 auto 30px auto' }}>
              Extract, Transform, and Visualize data with your team in real-time. 
              The power of Python Pandas meets a futuristic visual interface.
            </p>
            
            <div className="mt-30" style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                className="landing-btn-primary" 
                onClick={() => navigate('/app')}
                style={{ padding: '15px 30px', fontSize: '18px', boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)', width: 'auto' }}
              >
                Start Building Free <span>→</span>
              </button>
              <button 
                className="landing-btn-secondary" 
                onClick={()=> navigate('/docs')}
                style={{ padding: '15px 30px', fontSize: '18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', width: 'auto' }}
              >
                View Documentation
              </button>
            </div>
          </motion.div>
        </section>

        {/* 3. CORE FEATURES */}
        <section className="landing-features-section" style={{ padding: '60px 20px' }}>
          <div className="landing-container landing-grid-3">
            {[
              { 
                title: "Visual Builder", 
                icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z", 
                desc: "Drag-and-drop unified sources, filters, joins, and charts. See your data lineage instantly.", 
                delay: 0 
              },
              { 
                title: "Real-Time Collaboration", 
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", 
                desc: "Work together with teammates in the same pipeline. See live cursors and updates as they happen.", 
                delay: 0.2 
              },
              { 
                title: "Automated Scheduling", 
                icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", 
                desc: "Set pipelines to run automatically on a schedule (Cron or Interval) and track execution history.", 
                delay: 0.4 
              }
            ].map((card, i) => (
              <motion.div 
                key={i}
                className="landing-glass-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: card.delay }}
                style={{ padding: '25px' }}
              >
                <div className="landing-icon-box">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={card.icon} /></svg>
                </div>
                <h3 className="landing-h3" style={{ fontSize: '20px' }}>{card.title}</h3>
                <p className="landing-p text-left" style={{fontSize: '15px', color: '#a1a1aa'}}>{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 4. ARCHITECTURE SECTION */}
        <section className="landing-how-it-works-section" style={{ position: 'relative', overflow: 'hidden', padding: '60px 20px' }}>
          <div style={{ position: 'absolute', right: '0', top: '20%', width: '300px', height: '300px', background: 'rgba(59, 130, 246, 0.1)', filter: 'blur(80px)', borderRadius: '50%', zIndex: -1 }}></div>

          <div className="landing-container landing-grid-2" style={{ alignItems: 'center' }}>
            
            {/* LEFT SIDE */}
            <motion.div 
              className="landing-text-content"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={slideFromLeft}
            >
              <p className="landing-subtitle" style={{ color: '#10b981', letterSpacing: '2px' }}>
                ARCHITECTURE
              </p>
              <h2 className="landing-h2 text-gradient" style={{ fontSize: 'clamp(32px, 5vw, 42px)', lineHeight: '1.2' }}>
                Visual simplicity.<br />
                Analysis power.
              </h2>
              <p className="landing-p text-left mb-30" style={{ fontSize: '18px' }}>
                Don't choose between a drag-and-drop interface and complex data processing. StreamForge gives you both.
              </p>
              
              <ul className="landing-list">
                {['Multi-User Environment', 'Advanced Math & Aggregations', 'Integrated Charting', 'Secure Role-Based Access'].map((item, i) => (
                  <li key={i} className="landing-list-item" style={{ fontSize: '18px', marginBottom: '15px' }}>
                    <div className="landing-checkmark" style={{ background: '#10b981', color: 'black', border: 'none', fontWeight: 'bold' }}>✓</div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* RIGHT SIDE: CODE VISUALIZATION */}
            <motion.div 
              className="code-block code-block-floating"
              style={{ background: '#0f1115', width: '100%', maxWidth: '100%' }}
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
              
              <div className="code-content" style={{ fontSize: 'clamp(12px, 2.5vw, 16px)', overflowX: 'auto' }}>
                <span className="hl-comment"># StreamForge Engine Logic</span><br/>
                <span className="hl-def">def</span> <span className="hl-func">process_pipeline</span>(node):<br/>
                &nbsp;&nbsp;<span className="hl-key">if</span> node.type == <span className="hl-str">'join'</span>:<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;df = pd.merge(df1, df2, on=<span className="hl-str">'id'</span>)<br/>
                <br/>
                &nbsp;&nbsp;<span className="hl-key">elif</span> node.type == <span className="hl-str">'vis_chart'</span>:<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;generate_chart(df, type=<span className="hl-str">'bar'</span>)<br/>
                <br/>
                &nbsp;&nbsp;<span className="hl-key">return</span> df.to_json()<br/>
              </div>
            </motion.div>

          </div>
        </section>

        {/* 5. CAPABILITIES GRID */}
        <section className="landing-everything-section" style={{ padding: '60px 20px' }}>
          <div className="landing-container">
            <motion.div 
              className="landing-section-header"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="landing-h2" style={{ fontSize: 'clamp(28px, 4vw, 36px)' }}>Comprehensive Toolset</h2>
              <p className="landing-p" style={{ fontSize: '16px' }}>Everything you need to master your data workflows.</p>
            </motion.div>

            <div className="landing-grid-3">
               {[
                 { title: "Universal Ingestion", desc: "Support for CSV, JSON, and Excel files. Upload once, process anywhere." },
                 { title: "Advanced Logic", desc: "Perform SQL-like Joins, Group By aggregations, and custom Math formulas." },
                 { title: "Data Hygiene", desc: "Auto-deduplication, Fill Missing Values, and robust Type Casting." },
                 { title: "Instant Visualization", desc: "Generate Bar, Line, Pie, and Scatter plots directly within the pipeline." },
                 { title: "Secure Sharing", desc: "Share pipelines with colleagues using Viewer or Editor permissions." },
                 { title: "Execution History", desc: "Detailed logs and performance metrics for every pipeline run." }
               ].map((item, i) => (
                 <motion.div 
                    key={i}
                    className="landing-glass-card landing-glass-card-large"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    style={{ padding: '25px' }}
                 >
                   <h3 className="landing-h3" style={{ fontSize: '18px', color: '#10b981' }}>{item.title}</h3>
                   <p className="landing-p text-left" style={{fontSize: '15px', color: '#a1a1aa'}}>
                     {item.desc}
                   </p>
                 </motion.div>
               ))}
            </div>
          </div>
        </section>

        {/* 6. BOTTOM CTA */}
        <section className="landing-cta-section" style={{ padding: '60px 20px' }}>
          <motion.div 
            className="landing-container landing-glass-card landing-cta-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100 }}
            style={{ padding: '40px 20px' }}
          >
            <h2 className="landing-h2 landing-cta-title text-gradient" style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}>Ready to modernize your workflow?</h2>
            <p className="landing-p mb-30" style={{ color: 'white', fontSize: '18px' }}>
              Join the collaborative no-code revolution today.
            </p>
            <button className="landing-btn-primary" onClick={() => navigate('/app')} style={{ fontSize: '18px', padding: '15px 40px', maxWidth: '100%' }}>
              Launch App Now
            </button>
          </motion.div>
        </section>

        {/* 7. FOOTER */}
        <footer className="landing-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px', textAlign: 'center', color: '#a1a1aa' }}>
          © 2025 StreamForge. Built for builders.
        </footer>

      </div>
    </ParticlesBackground>
  );
};

export default LandingPage;
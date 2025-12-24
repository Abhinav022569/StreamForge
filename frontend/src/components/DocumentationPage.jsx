import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowUp, ChevronRight, BookOpen, Zap, Layers, Share2, Menu, X } from 'lucide-react';
import ParticlesBackground from './ParticlesBackground';
import logo from '../assets/logo.png';
import '../App.css';

const DocumentationPage = () => {
  const navigate = useNavigate();
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- Scroll Progress Logic ---
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Handle Resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show "Back to Top" on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) setShowTopBtn(true);
      else setShowTopBtn(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  const mobileMenuVariants = {
    closed: { opacity: 0, y: -20, pointerEvents: 'none' },
    open: { opacity: 1, y: 0, pointerEvents: 'auto' }
  };

  return (
    <ParticlesBackground>
      <div style={{ minHeight: '100vh', paddingBottom: '50px', position: 'relative' }}>
        
        {/* 1. FIXED NAVBAR */}
        {/* Changed class to avoid App.css !important conflicts and switched to 'nav' tag */}
        <nav 
          className="docs-nav-custom"
          style={{ 
            backdropFilter: 'blur(16px)', 
            WebkitBackdropFilter: 'blur(16px)',
            background: 'rgba(24, 24, 27, 0.85)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: isMobile ? '8px 16px' : '15px 50px',
            paddingTop: isMobile ? 'max(8px, env(safe-area-inset-top))' : '15px', // Handle notch
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            transform: 'translateZ(0)', // Fix for mobile flickering
          }}
        >
             {/* Progress Bar */}
             <motion.div
                style={{
                    position: 'absolute', 
                    bottom: -1, 
                    left: 0, 
                    right: 0, 
                    height: '3px',
                    background: '#10b981', 
                    transformOrigin: '0%', 
                    scaleX,
                    zIndex: 1001
                }}
             />

             <div 
                className="flex items-center pointer" 
                onClick={() => navigate('/')} 
                style={{ 
                    fontSize: isMobile ? '16px' : '20px', 
                    fontWeight: 'bold', 
                    color: 'white',
                    gap: isMobile ? '8px' : '10px'
                }}
             >
                <motion.img 
                  src={logo} 
                  alt="Logo" 
                  // Slim logo
                  style={{ width: isMobile ? '24px' : '30px', borderRadius: '4px' }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
                {/* Text on right side, slimmed down */}
                {isMobile ? <span style={{ whiteSpace: 'nowrap' }}>SF Docs</span> : <span>StreamForge <span style={{ color: '#10b981' }}>Docs</span></span>}
             </div>
             
             {isMobile ? (
               <div style={{ position: 'relative' }}>
                 <button 
                   onClick={() => setIsMenuOpen(!isMenuOpen)}
                   style={{ background: 'transparent', border: 'none', color: 'white', display: 'flex', alignItems: 'center' }}
                 >
                   {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                 </button>

                 <AnimatePresence>
                   {isMenuOpen && (
                     <motion.div
                       initial="closed"
                       animate="open"
                       exit="closed"
                       variants={mobileMenuVariants}
                       style={{
                         position: 'absolute',
                         top: '35px',
                         right: '-10px',
                         background: 'rgba(24, 24, 27, 0.95)',
                         backdropFilter: 'blur(12px)',
                         border: '1px solid rgba(255,255,255,0.1)',
                         borderRadius: '12px',
                         padding: '15px',
                         display: 'flex',
                         flexDirection: 'column',
                         gap: '10px',
                         width: '180px',
                         boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                       }}
                     >
                       <button 
                         className="btn btn-ghost"
                         onClick={() => navigate('/login')} 
                         style={{ justifyContent: 'flex-start', width: '100%', fontSize: '14px' }}
                       >
                         Log In
                       </button>
                       <button 
                         className="btn"
                         onClick={() => navigate('/')} 
                         style={{ 
                             border: '1px solid var(--success)', 
                             color: 'var(--success)', 
                             background: 'rgba(16, 185, 129, 0.1)',
                             justifyContent: 'flex-start',
                             width: '100%',
                             fontSize: '14px'
                         }}
                       >
                         Back to Home
                       </button>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
             ) : (
               <div className="flex" style={{ gap: '20px' }}>
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
                          background: 'rgba(16, 185, 129, 0.1)',
                          padding: '12px 24px'
                      }}
                  >
                      Back to Home
                  </button>
               </div>
             )}
        </nav>

        {/* 2. SPACER DIV to prevent content hidden under fixed nav */}
        <div style={{ height: isMobile ? '60px' : '90px' }} />

        {/* 3. MAIN CONTENT */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            
            {/* HERO SECTION */}
            <motion.div 
              className="text-center" 
              style={{ marginBottom: '80px', marginTop: '40px', position: 'relative' }}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
                <motion.div variants={itemVariants}>
                    <span style={{ 
                        background: 'rgba(16, 185, 129, 0.1)', 
                        color: '#10b981', 
                        padding: '6px 16px', 
                        borderRadius: '20px', 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <BookOpen size={14} /> Official Documentation
                    </span>
                </motion.div>

                <motion.h1 
                  className="landing-h1 text-gradient"
                  variants={itemVariants}
                  style={{ 
                      fontSize: 'clamp(36px, 8vw, 56px)', 
                      marginTop: '24px', 
                      letterSpacing: '-0.02em',
                      lineHeight: '1.2'
                  }}
                >
                    Master Your Data Pipelines
                </motion.h1>
                <motion.p 
                  className="landing-p"
                  variants={itemVariants}
                  style={{ maxWidth: '680px', marginTop: '16px' }}
                >
                    A complete guide to building, sharing, and executing powerful ETL workflows visually with StreamForge.
                </motion.p>

                {/* Scroll Down Indicator */}
                <motion.div 
                    variants={itemVariants}
                    animate={{ y: [0, 8, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    style={{ marginTop: '50px', display: 'flex', justifyContent: 'center' }}
                >
                    <ChevronDown size={28} color="#a1a1aa" />
                </motion.div>
            </motion.div>

            {/* SECTION 1: INTRO */}
            <motion.div 
              className="glass-panel"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={sectionVariants}
              style={{ position: 'relative', overflow: 'hidden' }}
            >
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#10b981' }}></div>
                <h2 className="text-success" style={{ marginBottom: '20px', fontSize: '26px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Zap size={22} /> Introduction
                </h2>
                <p className="text-muted" style={{ lineHeight: '1.8', fontSize: '17px' }}>
                    StreamForge is a <b>visual ETL builder</b> designed for speed and simplicity. It allows you to construct complex data workflows by dragging and dropping nodes onto a canvas. 
                    <br/><br/>
                    Unlike traditional coding, StreamForge handles the heavy lifting of Pandas dataframes behind the scenes, letting you focus on the logic:
                    <span style={{ color: '#e4e4e7', display: 'block', margin: '20px 0', paddingLeft: '20px', borderLeft: '2px solid #3f3f46', fontStyle: 'italic' }}>
                        "Extract from Source → Transform with Logic → Load to Destination"
                    </span>
                    Now supporting <b>Multi-Source Joins</b>, <b>Mathematical Formulas</b>, <b>In-Pipeline Charts</b>, and <b>Automated Cron Scheduling</b>.
                </p>
            </motion.div>

            {/* SECTION 2: INTERACTIVE STEPS */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={sectionVariants}
              style={{ marginBottom: '80px' }}
            >
                <h2 className="text-success" style={{ marginBottom: '40px', fontSize: '28px', textAlign: 'center' }}>
                    How It Works
                </h2>
                
                <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
                    {/* Connecting Line */}
                    <div style={{ 
                        position: 'absolute', 
                        left: isMobile ? '12px' : '24px', 
                        top: '24px', bottom: '24px', width: '2px', 
                        background: 'linear-gradient(to bottom, #10b981 0%, rgba(16, 185, 129, 0.05) 100%)', 
                        zIndex: 0 
                    }}></div>

                    <div className="flex-col gap-20">
                        <Step 
                            number="01" 
                            title="Create or Load" 
                            desc="Start from scratch or jumpstart with a template like 'Clean & Deduplicate'." 
                            delay={0}
                            isMobile={isMobile}
                        />
                        <Step 
                            number="02" 
                            title="Design Visual Flow" 
                            desc="Drag nodes from the sidebar. Connect Sources -> Transforms -> Destinations." 
                            delay={0.1}
                            isMobile={isMobile}
                        />
                        <Step 
                            number="03" 
                            title="Configure Nodes" 
                            desc="Click any node to set parameters: filter conditions, column names, or math formulas." 
                            delay={0.2} 
                            isMobile={isMobile}
                        />
                        <Step 
                            number="04" 
                            title="Execute or Schedule" 
                            desc="Run immediately to view results/charts, or set a daily schedule to automate your pipeline." 
                            delay={0.3} 
                            isMobile={isMobile}
                        />
                    </div>
                </div>
            </motion.div>

            {/* SECTION 3: NODE CARDS GRID */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={sectionVariants}
            >
                <h2 className="text-success" style={{ marginBottom: '30px', fontSize: '28px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                    <Layers size={24} style={{ display: 'inline', marginRight: '10px' }} />
                    Capabilities & Nodes
                </h2>
                
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: 'clamp(20px, 4vw, 50px)', 
                    marginTop: '30px' 
                }}>
                    
                    <InteractiveNodeCard 
                        icon="📂" 
                        title="Multi-Format Sources" 
                        desc="Ingest data from CSV, JSON, and Excel files. Combine multiple sources in a single flow."
                        color="#10b981"
                        delay={0} 
                    />
                    
                    <InteractiveNodeCard 
                        icon="🧹" 
                        title="Smart Cleaning" 
                        desc="Deduplicate rows, fill missing values (FillNa), cast data types, and format text strings."
                        color="#a855f7"
                        delay={0.1} 
                    />
                    
                    <InteractiveNodeCard 
                        icon="⚡" 
                        title="Transformation" 
                        desc="Filter rows based on logic, sort data, rename columns, select specific fields, and limit results."
                        color="#3b82f6"
                        delay={0.2} 
                    />

                    <InteractiveNodeCard 
                        icon="🧮" 
                        title="Advanced Analysis" 
                        desc="Perform Aggregations (Group By), Join datasets (Inner/Left/Right), and run Math Formulas."
                        color="#f43f5e"
                        delay={0.3} 
                    />

                    <InteractiveNodeCard 
                        icon="📊" 
                        title="Visualization" 
                        desc="Generate Bar, Line, Scatter, Pie charts, and Histograms directly within your pipeline."
                        color="#eab308"
                        delay={0.4} 
                    />

                    <InteractiveNodeCard 
                        icon="⏰" 
                        title="Automation" 
                        desc="Schedule pipelines to run automatically at specific times. Track execution logs history."
                        color="#06b6d4"
                        delay={0.5} 
                    />

                    <InteractiveNodeCard 
                        icon="👥" 
                        title="Collaboration" 
                        desc="Share pipelines with teammates using 'Viewer' or 'Editor' roles for seamless teamwork."
                        color="#ec4899"
                        delay={0.6} 
                    />
                    
                </div>
            </motion.div>

            {/* SECTION 4: Collaboration Preview */}
            <motion.div 
                className="glass-panel"
                style={{ marginTop: '80px', border: '1px solid rgba(59, 130, 246, 0.2)', background: 'linear-gradient(rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.02))' }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={sectionVariants}
            >
                <h2 style={{ color: '#60a5fa', marginBottom: '15px', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Share2 size={24} /> New: Team Collaboration
                </h2>
                <p className="text-muted" style={{ marginBottom: '24px' }}>
                    Working in a team? You can now share your pipelines with colleagues. 
                    See <b>Live Cursors</b> as you edit together, and manage permissions securely.
                </p>
                <button className="btn" style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 24px' }} onClick={() => navigate('/collaboration')}>
                    Go to Collaboration Hub <span style={{ marginLeft: '8px' }}>→</span>
                </button>
            </motion.div>

        </div>

        {/* BACK TO TOP BUTTON */}
        <AnimatePresence>
            {showTopBtn && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    transition={{ duration: 0.3 }}
                    onClick={scrollToTop}
                    style={{
                        position: 'fixed',
                        bottom: '30px',
                        right: '30px',
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        background: '#10b981',
                        color: 'black',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                        zIndex: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    whileHover={{ scale: 1.1, backgroundColor: '#34d399' }}
                    whileTap={{ scale: 0.95 }}
                >
                    <ArrowUp size={20} />
                </motion.button>
            )}
        </AnimatePresence>

      </div>
    </ParticlesBackground>
  );
};

// --- Helper Components ---

const Step = ({ number, title, desc, delay, isMobile }) => {
    // Calculate layout adjustments for mobile timeline
    // Desktop: Line at 24px, Step marginLeft 50px, Dot left -34px
    // Mobile: Line at 12px, Step marginLeft 30px, Dot left -25px (center on 12px line)
    
    const cardMarginLeft = isMobile ? '30px' : '50px';
    const dotLeft = isMobile ? '-25px' : '-34px';

    return (
        <motion.div 
        className="glass-card"
        style={{ 
            display: 'flex', gap: '20px', alignItems: 'flex-start',
            padding: '24px', marginBottom: '20px', marginLeft: cardMarginLeft,
            border: '1px solid rgba(255,255,255,0.05)',
            position: 'relative', zIndex: 1,
            borderRadius: '12px'
        }}
        initial={{ opacity: 0, x: -15 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: delay, ease: "easeOut" }}
        whileHover={{ 
            x: 4, 
            borderColor: 'rgba(16, 185, 129, 0.3)', 
            backgroundColor: 'rgba(24, 24, 27, 0.6)' 
        }}
        >
            {/* Connector Dot */}
            <div style={{ 
                position: 'absolute', left: dotLeft, top: '32px', 
                width: '14px', height: '14px', borderRadius: '50%', 
                background: '#0f1115', border: '3px solid #10b981',
                zIndex: 2
            }}></div>

            <div style={{ 
                fontSize: '15px', fontWeight: 'bold', color: '#10b981', 
                background: 'rgba(16, 185, 129, 0.08)', width: '36px', height: '36px', 
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: '-2px'
            }}>
                {number}
            </div>
            <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: 'white' }}>{title}</h3>
                <p className="text-muted" style={{ margin: 0, fontSize: '15px', lineHeight: '1.5' }}>{desc}</p>
            </div>
        </motion.div>
    );
};

const InteractiveNodeCard = ({ icon, title, desc, color, delay }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div 
          style={{ 
            background: 'rgba(255,255,255,0.02)', 
            padding: '20px', 
            borderRadius: '19px', 
            border: '1px solid rgba(255,255,255,0.05)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            height: '90%',
            minHeight: '220px', 
            display: 'flex',
            flexDirection: 'column'
          }}
          initial={{ opacity: 0, y: 15 }} 
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: delay, ease: "easeOut" }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={{ 
            y: -4, 
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderColor: color, 
            boxShadow: `0 10px 25px -10px ${color}20`
          }}
        >
            <div style={{ fontSize: '28px', marginBottom: '16px' }}>{icon}</div>
            <h3 style={{ color: 'white', marginBottom: '8px', fontSize: '17px', fontWeight: 'bold' }}>{title}</h3>
            <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.6', margin: 0, flexGrow: 1 }}>{desc}</p>
            
            {/* Hover Reveal Interaction */}
            <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -5 }}
                transition={{ duration: 0.2 }}
                style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '5px', color: color, fontSize: '12px', fontWeight: 'bold' }}
            >
                Learn more <ChevronRight size={14} />
            </motion.div>

            {/* Decorative colored glow on top */}
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '2px',
                background: isHovered ? color : 'transparent',
                transition: 'background 0.3s'
            }}></div>
        </motion.div>
    );
};

export default DocumentationPage;
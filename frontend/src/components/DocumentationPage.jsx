import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ParticlesBackground from './ParticlesBackground';
import logo from '../assets/logo.png';
import '../App.css'; // Import shared styles

const DocumentationPage = () => {
  const navigate = useNavigate();

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  return (
    <ParticlesBackground>
      <div style={{ minHeight: '100vh', paddingBottom: '50px' }}>
        
        {/* 1. STICKY NAVBAR */}
        <motion.nav 
          className="docs-nav"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "circOut" }}
        >
             <div 
                className="flex items-center gap-10 pointer" 
                onClick={() => navigate('/')} 
                style={{ fontSize: '20px', fontWeight: 'bold' }}
             >
                <motion.img 
                  src={logo} 
                  alt="Logo" 
                  style={{ width: '30px', borderRadius: '4px' }}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.8 }}
                />
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
        </motion.nav>

        {/* 2. MAIN CONTENT CONTAINER */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
            
            {/* Header */}
            <motion.div 
              className="text-center" 
              style={{ marginBottom: '60px' }}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
                <motion.h1 
                  className="landing-h1 text-gradient"
                  variants={itemVariants}
                >
                    Documentation
                </motion.h1>
                <motion.p 
                  className="landing-p"
                  variants={itemVariants}
                >
                    Build, share, and execute powerful ETL pipelines visually.
                </motion.p>
            </motion.div>

            {/* Section 1: Introduction */}
            <motion.div 
              className="glass-panel"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={sectionVariants}
            >
                <h2 className="text-success" style={{ marginBottom: '20px', fontSize: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                    1. Introduction
                </h2>
                <p className="text-muted" style={{ lineHeight: '1.8', fontSize: '16px' }}>
                    StreamForge is a visual ETL builder designed for speed and simplicity. It allows you to construct complex data workflows by dragging and dropping nodes onto a canvas. 
                    Beyond basic filtering, StreamForge now supports <b>Advanced Data Cleaning</b>, <b>Multi-Source Joins</b>, <b>Mathematical Operations</b>, and <b>In-Pipeline Visualization</b>. 
                    Collaborate with your team by sharing pipelines and manage everything from a centralized dashboard.
                </p>
            </motion.div>

            {/* Section 2: Getting Started */}
            <motion.div 
              className="glass-panel"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={sectionVariants}
            >
                <h2 className="text-success" style={{ marginBottom: '20px', fontSize: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                    2. Getting Started
                </h2>
                <div className="flex-col gap-20">
                    <Step number="01" title="Create an Account" desc="Sign up to access your dashboard and 500MB of storage." delay={0} />
                    <Step number="02" title="Create or Use Template" desc="Start from scratch or load a pre-built template like 'Clean & Deduplicate'." delay={0.1} />
                    <Step number="03" title="Design Flow" desc="Connect Sources -> Transformations -> Destinations. Visual logic made easy." delay={0.2} />
                    <Step number="04" title="Run & Analyze" desc="Execute the pipeline to generate clean files, databases, and charts." delay={0.3} />
                </div>
            </motion.div>

            {/* Section 3: Capabilities & Nodes */}
            <motion.div 
              className="glass-panel"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={sectionVariants}
            >
                <h2 className="text-success" style={{ marginBottom: '20px', fontSize: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                    3. Capabilities & Nodes
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                    
                    <NodeCard 
                        icon="📂" 
                        title="Multi-Format Sources" 
                        desc="Ingest data from CSV, JSON, and Excel files. Combine multiple sources in a single flow." 
                        delay={0} 
                    />
                    
                    <NodeCard 
                        icon="🧹" 
                        title="Smart Cleaning" 
                        desc="Deduplicate rows, fill missing values (FillNa), cast data types, and format text strings." 
                        delay={0.1} 
                    />
                    
                    <NodeCard 
                        icon="⚡" 
                        title="Transformation" 
                        desc="Filter rows based on logic, sort data, rename columns, select specific fields, and limit results." 
                        delay={0.2} 
                    />

                    <NodeCard 
                        icon="🧮" 
                        title="Advanced Analysis" 
                        desc="Perform Aggregations (Group By), Join datasets (Inner/Left/Right), and run Math Formulas." 
                        delay={0.3} 
                    />

                    <NodeCard 
                        icon="📊" 
                        title="Visualization" 
                        desc="Generate Bar, Line, Scatter, Pie charts, and Histograms directly within your pipeline." 
                        delay={0.4} 
                    />

                    <NodeCard 
                        icon="💾" 
                        title="Flexible Export" 
                        desc="Save your processed data to a SQL Database, or export as CSV, JSON, or Excel files." 
                        delay={0.5} 
                    />
                    
                </div>
            </motion.div>

        </div>
      </div>
    </ParticlesBackground>
  );
};

// --- Helper Components with Motion ---

const Step = ({ number, title, desc, delay }) => (
    <motion.div 
      className="flex gap-20" 
      style={{ alignItems: 'flex-start' }}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay }}
    >
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '5px 10px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            {number}
        </div>
        <div>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: 'var(--text-main)' }}>{title}</h3>
            <p className="text-muted" style={{ margin: 0, fontSize: '15px' }}>{desc}</p>
        </div>
    </motion.div>
);

const NodeCard = ({ icon, title, desc, delay }) => (
    <motion.div 
      style={{ 
        background: 'rgba(255,255,255,0.03)', 
        padding: '20px', 
        borderRadius: '8px', 
        border: '1px solid rgba(255,255,255,0.05)',
        cursor: 'default'
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ 
        scale: 1.05, 
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderColor: 'rgba(16, 185, 129, 0.4)',
        boxShadow: '0 10px 30px -10px rgba(16, 185, 129, 0.2)'
      }}
      transition={{ duration: 0.3, delay: delay }}
    >
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>{icon}</div>
        <h3 style={{ color: 'white', marginBottom: '10px', fontSize: '16px' }}>{title}</h3>
        <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.5', margin: 0 }}>{desc}</p>
    </motion.div>
);

export default DocumentationPage;
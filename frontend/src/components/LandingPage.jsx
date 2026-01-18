import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useMotionTemplate, AnimatePresence } from 'framer-motion';
import { 
  Zap, Network, Bot, Users, ArrowRight, Database, 
  ShieldCheck, Activity, Code2, FileJson, 
  CheckCircle2, FileSpreadsheet, FileText, 
  Plus, Minus, Server, Table, Briefcase, ShoppingCart, 
  TrendingUp
} from 'lucide-react';
import ParticlesBackground from './ParticlesBackground';
import logo from '../assets/logo.png';

const LandingPage = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 100]);
  
  // Navigation Handler
  const handleDocClick = () => {
    navigate('/documentation');
  };

  return (
    <div style={{ background: '#09090b', minHeight: '100vh', color: '#fff', overflowX: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      
      {/* WRAP CONTENT INSIDE PARTICLES BACKGROUND */}
      <ParticlesBackground>
      
        {/* --- NAVBAR --- */}
        <nav style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, 
          padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(9, 9, 11, 0.6)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{ position: 'relative' }}>
              <img src={logo} alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
              <div style={{ position: 'absolute', bottom: -1, right: -1, width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', border: '2px solid #09090b' }} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>StreamForge</span>
          </div>
          
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            {/* UPDATED: Links now point to Documentation */}
            <div style={{ display: 'flex', gap: '24px', fontSize: '14px', fontWeight: '500', color: '#a1a1aa' }} className="desktop-menu">
              <span 
                className="nav-item" 
                onClick={handleDocClick}
                style={{ cursor: 'pointer', transition: 'color 0.2s hover:text-white' }}
                onMouseEnter={(e) => e.target.style.color = 'white'}
                onMouseLeave={(e) => e.target.style.color = '#a1a1aa'}
              >
                Getting Started
              </span>
              <span 
                className="nav-item" 
                onClick={handleDocClick}
                style={{ cursor: 'pointer', transition: 'color 0.2s hover:text-white' }}
                onMouseEnter={(e) => e.target.style.color = 'white'}
                onMouseLeave={(e) => e.target.style.color = '#a1a1aa'}
              >
                Core Concepts
              </span>
              <span 
                className="nav-item" 
                onClick={handleDocClick}
                style={{ cursor: 'pointer', transition: 'color 0.2s hover:text-white' }}
                onMouseEnter={(e) => e.target.style.color = 'white'}
                onMouseLeave={(e) => e.target.style.color = '#a1a1aa'}
              >
                API Reference
              </span>
            </div>
            
            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button 
                  onClick={() => navigate('/login')}
                  style={{ background: 'transparent', color: '#fff', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
              >
                  Log In
              </button>
              <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/signup')}
                  style={{ 
                  background: '#fff', color: '#000', border: 'none', 
                  padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' 
                  }}
              >
                  Get Access
              </motion.button>
            </div>
          </div>
        </nav>

        {/* --- HERO SECTION --- */}
        <section style={{ 
          minHeight: '100vh', display: 'flex', alignItems: 'start', 
          padding: '140px 5% 60px', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 60%)', filter: 'blur(80px)', zIndex: 0 }} />
          <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 60%)', filter: 'blur(80px)', zIndex: 0 }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', maxWidth: '1400px', margin: '0 auto', zIndex: 1, width: '100%' }}>
              
              {/* Hero Content */}
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                  <div style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '8px', 
                      background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '100px', 
                      border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '24px'
                  }}>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', background: '#10b981', borderRadius: '50%', fontSize: '10px', color: 'black', fontWeight: 'bold' }}>N</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#10b981' }}>New: Managed AI Compute</span>
                  </div>

                  <h1 style={{ 
                      fontSize: 'clamp(48px, 5vw, 72px)', fontWeight: '900', lineHeight: '1.1', letterSpacing: '-2px', marginBottom: '20px',
                      color: 'white'
                  }}>
                      Cloud-Native ETL, <br/>
                      <span style={{ 
                      background: 'linear-gradient(90deg, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                      }}>Simplified.</span>
                  </h1>
                  
                  <p style={{ fontSize: '18px', color: '#a1a1aa', maxWidth: '540px', marginBottom: '32px', lineHeight: '1.6' }}>
                      The fully managed platform for visual data transformation. Upload your files, design your pipeline, and let our infrastructure handle the execution scale.
                  </p>

                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/signup')}
                      style={{ 
                          background: '#fff', color: '#000', border: 'none', 
                          padding: '16px 36px', borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 0 20px rgba(255,255,255,0.2)'
                      }}
                      >
                          Start Building <ArrowRight size={20} />
                      </motion.button>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 20px', color: '#a1a1aa', fontSize: '14px' }}>
                          <CheckCircle2 size={16} color="#10b981" /> Enterprise Ready
                      </div>
                  </div>
              </motion.div>

              {/* Hero Visual (Mockup) */}
              <motion.div 
                  style={{ y: heroY, position: 'relative' }}
                  initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ duration: 1, delay: 0.2 }}
              >
                  <div style={{ 
                      background: '#18181b', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', overflow: 'hidden', aspectRatio: '4/3',
                      display: 'flex', flexDirection: 'column'
                  }}>
                      <div style={{ 
                          height: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)', 
                          display: 'flex', alignItems: 'center', padding: '0 16px', gap: '8px', background: 'rgba(255,255,255,0.02)'
                      }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                          <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#52525b', fontFamily: 'monospace' }}>cloud_engine.py</div>
                      </div>

                      <div style={{ padding: '20px', flex: 1, position: 'relative' }}>
                          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
                              <motion.path 
                                  d="M 100 80 C 200 80, 200 180, 300 180" 
                                  stroke="rgba(59, 130, 246, 0.4)" strokeWidth="2" fill="none"
                                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              />
                              <motion.path 
                                  d="M 300 180 C 400 180, 400 280, 500 280" 
                                  stroke="rgba(16, 185, 129, 0.4)" strokeWidth="2" fill="none"
                                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 1, repeat: Infinity, ease: "linear" }}
                              />
                          </svg>

                          <motion.div 
                              animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}
                              style={{ 
                                  position: 'absolute', top: '50px', left: '50px', width: '140px', padding: '12px',
                                  background: 'rgba(39, 39, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)',
                                  boxShadow: '0 0 20px rgba(59,130,246,0.1)'
                              }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                  <FileSpreadsheet size={16} color="#3b82f6" />
                                  <span style={{ fontSize: '12px', fontWeight: '600' }}>Sales_Data.csv</span>
                              </div>
                              <div style={{ fontSize: '10px', color: '#a1a1aa' }}>Status: Uploaded</div>
                          </motion.div>

                          <motion.div 
                              animate={{ y: [0, 5, 0] }} transition={{ duration: 5, repeat: Infinity }}
                              style={{ 
                                  position: 'absolute', top: '150px', left: '250px', width: '140px', padding: '12px',
                                  background: 'rgba(39, 39, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.3)',
                                  boxShadow: '0 0 20px rgba(139, 92, 246, 0.1)'
                              }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                  <Bot size={16} color="#8b5cf6" />
                                  <span style={{ fontSize: '12px', fontWeight: '600' }}>Cloud Transform</span>
                              </div>
                              <div style={{ fontSize: '10px', color: '#a1a1aa' }}>Processing...</div>
                          </motion.div>

                         <motion.div 
                            animate={{ y: [0, -5, 0] }} transition={{ duration: 4.5, repeat: Infinity }}
                            style={{ 
                                position: 'absolute', top: '250px', left: '450px', width: '140px', padding: '12px',
                                background: 'rgba(39, 39, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)',
                                boxShadow: '0 0 20px rgba(16, 185, 129, 0.1)'
                            }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Database size={16} color="#10b981" />
                                <span style={{ fontSize: '12px', fontWeight: '600' }}>Managed DB</span>
                            </div>
                            <div style={{ fontSize: '10px', color: '#a1a1aa' }}>Sync Complete</div>
                        </motion.div>

                        <motion.div 
                            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1 }}
                            style={{ 
                                position: 'absolute', bottom: '20px', right: '20px', 
                                background: '#10b981', color: 'black', padding: '8px 16px', borderRadius: '30px',
                                fontSize: '12px', fontWeight: '700', boxShadow: '0 10px 20px rgba(16,185,129,0.3)'
                            }}
                        >
                            System Optimal
                        </motion.div>
                    </div>
                </div>
            </motion.div>
          </div>
        </section>

        {/* --- TRUSTED BY MARQUEE --- */}
        <section style={{ padding: '40px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#52525b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', fontWeight: '600' }}>Innovative teams building on StreamForge</p>
          <div style={{ overflow: 'hidden', display: 'flex', maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
              <motion.div 
                  animate={{ x: ['0%', '-50%'] }} 
                  transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
                  style={{ display: 'flex', gap: '80px', paddingLeft: '40px', minWidth: 'fit-content' }}
              >
                  {['Acme Corp', 'Globex', 'Soylent', 'Umbrella', 'Stark Ind', 'Cyberdyne', 'Massive Dynamic', 'Hooli', 'Initech', 'Vandelay'].map((name, i) => (
                      <span key={i} style={{ fontSize: '20px', fontWeight: '800', color: '#3f3f46', whiteSpace: 'nowrap' }}>{name}</span>
                  ))}
                  {['Acme Corp', 'Globex', 'Soylent', 'Umbrella', 'Stark Ind', 'Cyberdyne', 'Massive Dynamic', 'Hooli', 'Initech', 'Vandelay'].map((name, i) => (
                      <span key={`dup-${i}`} style={{ fontSize: '20px', fontWeight: '800', color: '#3f3f46', whiteSpace: 'nowrap' }}>{name}</span>
                  ))}
              </motion.div>
          </div>
        </section>

        {/* --- STATS BANNER --- */}
        <section style={{ padding: '60px 0', background: '#000', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '40px', padding: '0 20px' }}>
              <StatItem number="15+" label="Transformation Types" />
              <StatItem number="99.9%" label="Platform Uptime" />
              <StatItem number="Real-time" label="Collaboration" />
              <StatItem number="Zero" label="Maintenance" />
          </div>
        </section>

        {/* --- BENTO GRID (FEATURES) --- */}
        <section style={{ padding: '120px 20px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '16px' }}>The complete data platform.</h2>
            <p style={{ fontSize: '18px', color: '#a1a1aa' }}>Visual simplicity backed by managed infrastructure.</p>
          </div>

          <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
              gap: '24px',
              autoRows: 'minmax(300px, auto)'
          }}>
              {/* 1. Visual Builder (Wide) */}
              <SpotlightCard style={{ gridColumn: '1 / -1', minHeight: '400px' }}>
                  <div style={{ padding: '40px', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                          <div style={{ padding: '10px', background: 'rgba(16,185,129,0.1)', borderRadius: '8px' }}><Network color="#10b981" /></div>
                          <h3 style={{ fontSize: '24px', fontWeight: '700' }}>Cloud-Based Visual Orchestration</h3>
                      </div>
                      <p style={{ color: '#a1a1aa', fontSize: '16px', maxWidth: '600px' }}>
                          Design your pipeline logic in our browser-based studio. We handle the underlying execution environment, scaling, and dependencies automatically.
                      </p>

                      {/* Inner Mockup */}
                      <div style={{ 
                          marginTop: '40px', flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', 
                          borderRadius: '12px', position: 'relative', overflow: 'hidden'
                      }}>
                          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.3 }} />
                          <motion.div 
                              style={{ position: 'absolute', top: '30%', left: '20%', padding: '10px 20px', background: '#27272a', borderRadius: '8px', border: '1px solid #3f3f46' }}
                              animate={{ x: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity }}
                          >
                              Input: Uploads
                          </motion.div>
                          <div style={{ position: 'absolute', top: '45%', left: '40%', width: '60px', height: '2px', background: '#52525b' }} />
                          <motion.div 
                              style={{ position: 'absolute', top: '30%', left: '50%', padding: '10px 20px', background: '#27272a', borderRadius: '8px', border: '1px solid #10b981' }}
                              animate={{ x: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}
                          >
                              Action: Filter
                          </motion.div>
                      </div>
                  </div>
              </SpotlightCard>

              {/* 2. AI Assistant */}
              <SpotlightCard>
                  <div style={{ padding: '30px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ width: '48px', height: '48px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                          <Bot size={24} color="#8b5cf6" />
                      </div>
                      <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Integrated AI Copilot</h3>
                      <p style={{ color: '#a1a1aa', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' }}>
                          Stuck on a transformation? Chat with our integrated AI assistant to get debugging help, optimization tips, or Python code snippets.
                      </p>
                      <div style={{ marginTop: 'auto', background: '#18181b', borderRadius: '8px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)', fontFamily: 'monospace', fontSize: '12px', color: '#d4d4d8' }}>
                          <span style={{ color: '#8b5cf6' }}>AI:</span> I recommend dropping the null values in 'age' before grouping.
                      </div>
                  </div>
              </SpotlightCard>

              {/* 3. Real-time Monitoring */}
              <SpotlightCard>
                  <div style={{ padding: '30px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                     <div style={{ width: '48px', height: '48px', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                        <Users size={24} color="#ec4899" />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Team Collaboration</h3>
                    <p style={{ color: '#a1a1aa', fontSize: '15px', lineHeight: '1.6' }}>
                        Work together on the same pipeline with your team. Share projects with Viewer or Editor roles and see updates instantly via our synced platform.
                    </p>
                </div>
            </SpotlightCard>

             {/* 4. Python Power */}
             <SpotlightCard>
                <div style={{ padding: '30px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                     <div style={{ width: '48px', height: '48px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                        <Code2 size={24} color="#f59e0b" />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Managed Python Runtime</h3>
                    <p style={{ color: '#a1a1aa', fontSize: '15px', lineHeight: '1.6' }}>
                        Built on top of a secure Python/Pandas environment. Drop in a "Python Script" node and we execute it safely in our isolated containers.
                    </p>
                </div>
            </SpotlightCard>

             {/* 5. Security */}
             <SpotlightCard>
                <div style={{ padding: '30px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                     <div style={{ width: '48px', height: '48px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                        <ShieldCheck size={24} color="#3b82f6" />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Secure Storage</h3>
                    <p style={{ color: '#a1a1aa', fontSize: '15px', lineHeight: '1.6' }}>
                        Your data and pipelines are stored securely in our private cloud. We utilize JWT authentication and strict access controls to keep your work safe.
                    </p>
                </div>
            </SpotlightCard>
          </div>
        </section>

        {/* --- NEW: SUPPORTED FORMATS --- */}
        <section style={{ padding: '80px 20px', background: 'rgba(255,255,255,0.01)' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '16px' }}>Supported Data Formats</h2>
                <p style={{ fontSize: '18px', color: '#a1a1aa', marginBottom: '60px' }}>Import, Transform, and Export your files easily.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '30px', alignItems: 'center', justifyContent: 'center' }}>
                    <IntegrationItem icon={<FileText />} label="CSV" />
                    <IntegrationItem icon={<FileJson />} label="JSON" />
                    <IntegrationItem icon={<FileSpreadsheet />} label="Excel" />
                    <IntegrationItem icon={<Database />} label="SQLite" />
                    <IntegrationItem icon={<Table />} label="DataFrames" />
                </div>
            </div>
        </section>

        {/* --- NEW: USE CASES SECTION --- */}
        <section style={{ padding: '100px 20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h2 style={{ fontSize: '36px', fontWeight: '800' }}>Solutions for every team.</h2>
                <p style={{ color: '#a1a1aa', fontSize: '18px' }}>From simple cleanups to complex aggregations.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                <UseCaseCard 
                    icon={<ShoppingCart color="#ec4899" />} 
                    title="E-Commerce Analytics" 
                    desc="Merge customer logs with sales data (CSV) to calculate lifetime value and retention rates automatically on our platform."
                />
                <UseCaseCard 
                    icon={<TrendingUp color="#10b981" />} 
                    title="Financial Reporting" 
                    desc="Securely upload daily transaction reports (Excel), deduct fees, and export a clean ledger to SQLite."
                />
                <UseCaseCard 
                    icon={<Briefcase color="#3b82f6" />} 
                    title="HR Data Migration" 
                    desc="Consolidate employee records from multiple JSON dumps, standardize formats, and prepare for system migration."
                />
            </div>
        </section>

        {/* --- NEW: ARCHITECTURE SECTION (Replacing Terminal) --- */}
        <section style={{ padding: '120px 20px' }}>
         <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <div>
                <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '20px' }}>Enterprise-grade Architecture.</h2>
                <p style={{ color: '#a1a1aa', fontSize: '18px', marginBottom: '30px', lineHeight: '1.6' }}>
                    StreamForge is built on a robust, scalable stack designed to handle your data workloads efficiently without you managing servers.
                </p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <ListItem text="Managed Python Backend" />
                    <ListItem text="Reactive Frontend Interface" />
                    <ListItem text="Real-time WebSocket Sync" />
                    <ListItem text="Secure Isolated Storage" />
                </ul>
            </div>
            
            {/* Tech Stack Visual */}
            <div style={{ background: '#0f1115', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', overflow: 'hidden', padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#e4e4e7', fontSize: '18px', fontWeight: '600' }}>
                  <div style={{ width: '40px', height: '40px', background: '#3776AB', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>Py</div>
                  Python Engine
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#e4e4e7', fontSize: '18px', fontWeight: '600' }}>
                  <div style={{ width: '40px', height: '40px', background: '#61DAFB', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: 'bold' }}>Re</div>
                  React Interface
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#e4e4e7', fontSize: '18px', fontWeight: '600' }}>
                  <div style={{ width: '40px', height: '40px', background: '#000', border: '1px solid white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>Sio</div>
                  Live Sync
               </div>
            </div>
         </div>
      </section>

      {/* --- NEW: HOW TO START --- */}
      <section style={{ padding: '100px 20px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
              <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '40px' }}>Get Started in 3 Steps</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', textAlign: 'left' }}>
                      <div style={{ background: '#10b981', color: 'black', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>1</div>
                      <div>
                          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Create an Account</h3>
                          <p style={{ color: '#a1a1aa' }}>Sign up for free to access your private workspace. No credit card required for the starter tier.</p>
                      </div>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', textAlign: 'left' }}>
                      <div style={{ background: '#10b981', color: 'black', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>2</div>
                      <div>
                          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Connect Data</h3>
                          <p style={{ color: '#a1a1aa' }}>Upload your CSV, JSON, or Excel files directly to our secure cloud storage.</p>
                      </div>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', textAlign: 'left' }}>
                      <div style={{ background: '#10b981', color: 'black', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>3</div>
                      <div>
                          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Build & Automate</h3>
                          <p style={{ color: '#a1a1aa' }}>Drag nodes onto the canvas to build your pipeline logic, then run it instantly on our servers.</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>

        {/* --- NEW: FAQ SECTION --- */}
        <section style={{ padding: '100px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800', textAlign: 'center', marginBottom: '40px' }}>Frequently Asked Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <FAQItem question="Do I need to know coding?" answer="No! The Visual Builder allows you to do most tasks without code. However, you can use the Python Script node for advanced custom logic." />
                <FAQItem question="Is my data safe?" answer="Yes. Your data is processed in isolated environments and encrypted at rest. We utilize industry-standard security practices to ensure your data remains private." />
                <FAQItem question="How do I deploy?" answer="StreamForge is a fully managed platform. We handle the deployment, scaling, and maintenance of the underlying infrastructure for you." />
                <FAQItem question="Can I export my data?" answer="Absolutely. You can export your processed data at any time in various formats like CSV, JSON, or directly to a SQLite database." />
            </div>
        </section>

        {/* --- CTA SECTION --- */}
        <section style={{ padding: '100px 20px', textAlign: 'center', position: 'relative' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
              <h2 style={{ fontSize: 'clamp(40px, 5vw, 60px)', fontWeight: '900', marginBottom: '24px', letterSpacing: '-1px' }}>
                  Ready to flow?
              </h2>
              <p style={{ fontSize: '20px', color: '#a1a1aa', marginBottom: '40px' }}>
                  Join the platform transforming how teams handle data.
              </p>
              <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/signup')}
                  style={{ 
                      background: '#fff', color: '#000', border: 'none', 
                      padding: '20px 50px', borderRadius: '16px', fontWeight: '800', fontSize: '20px', cursor: 'pointer',
                      boxShadow: '0 20px 50px rgba(255,255,255,0.15)'
                  }}
              >
                  Get Started Now
              </motion.button>
          </div>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '300px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 60%)', filter: 'blur(100px)', zIndex: 0 }} />
        </section>

        {/* --- FOOTER --- */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: '#050505', padding: '80px 20px 40px', color: '#71717a', fontSize: '14px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: '#fff' }}>
                      <img src={logo} alt="Logo" style={{ width: '24px', height: '24px', borderRadius: '6px' }} />
                      <span style={{ fontSize: '18px', fontWeight: '700' }}>StreamForge</span>
                  </div>
                  <p style={{ maxWidth: '300px', lineHeight: '1.6' }}>The managed data orchestration platform for modern engineering teams.</p>
              </div>
              <div>
                  <h4 style={{ color: '#fff', fontWeight: '600', marginBottom: '20px' }}>Product</h4>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <li>Features</li>
                      <li>Builder</li>
                      <li>Data Catalog</li>
                  </ul>
              </div>
              <div>
                  <h4 style={{ color: '#fff', fontWeight: '600', marginBottom: '20px' }}>Resources</h4>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <li>Documentation</li>
                      <li>Status</li>
                  </ul>
              </div>
              <div>
                  <h4 style={{ color: '#fff', fontWeight: '600', marginBottom: '20px' }}>Legal</h4>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <li>Privacy</li>
                      <li>Terms</li>
                  </ul>
              </div>
          </div>
          <div style={{ maxWidth: '1200px', margin: '60px auto 0', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              © 2026 StreamForge Inc.
          </div>
        </footer>
      
      </ParticlesBackground>
    </div>
  );
};

// --- SUB COMPONENTS ---

const StatItem = ({ number, label }) => (
    <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', fontWeight: '900', color: '#fff', marginBottom: '5px' }}>{number}</div>
        <div style={{ color: '#71717a', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
    </div>
);

const ListItem = ({ text }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: '500' }}>
        <CheckCircle2 size={20} color="#10b981" /> {text}
    </div>
);

const UseCaseCard = ({ icon, title, desc }) => (
    <div style={{ padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', width: 'fit-content' }}>
            {React.cloneElement(icon, { size: 28 })}
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>{title}</h3>
        <p style={{ color: '#a1a1aa', lineHeight: '1.6' }}>{desc}</p>
    </div>
);

// Integration Item (Data Formats)
const IntegrationItem = ({ icon, label }) => (
    <motion.div 
        whileHover={{ scale: 1.1, color: '#fff' }}
        style={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', 
            color: '#71717a', cursor: 'pointer', transition: 'color 0.2s' 
        }}
    >
        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            {React.cloneElement(icon, { size: 32 })}
        </div>
        <span style={{ fontSize: '14px', fontWeight: '500' }}>{label}</span>
    </motion.div>
);

// FAQ Item
const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div 
            onClick={() => setIsOpen(!isOpen)}
            style={{ 
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', 
                borderRadius: '12px', cursor: 'pointer', overflow: 'hidden'
            }}
        >
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '600', fontSize: '16px', color: '#fff' }}>{question}</span>
                {isOpen ? <Minus size={20} color="#a1a1aa" /> : <Plus size={20} color="#a1a1aa" />}
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ padding: '0 20px 20px', color: '#a1a1aa', lineHeight: '1.6' }}>{answer}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Spotlight Card for Bento Grid
const SpotlightCard = ({ children, style = {} }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        background: 'rgba(24, 24, 27, 0.4)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.05)',
        overflow: 'hidden',
        ...style
      }}
    >
      <motion.div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: useMotionTemplate`
            radial-gradient(
              500px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.06),
              transparent 40%
            )
          `,
          zIndex: 1
        }}
      />
      <div style={{ position: 'relative', zIndex: 10, height: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export default LandingPage;
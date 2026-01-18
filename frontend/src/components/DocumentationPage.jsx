import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Book, Code2, Terminal, Layers, Shield, Zap, 
  Database, Cpu, Server, Menu, X, ChevronRight, Home 
} from 'lucide-react';
import logo from '../assets/logo.png';

const DocumentationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('intro');

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      // Offset for the fixed header
      const yOffset = -100; 
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  // Scroll to hash on load
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      scrollTo(id);
    }
  }, [location]);

  return (
    <div style={{ background: '#09090b', minHeight: '100vh', color: '#e4e4e7', fontFamily: 'Inter, sans-serif' }}>
        
        {/* --- NAVBAR (Consistent with Landing Page) --- */}
        <nav style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, 
            padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(9, 9, 11, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                <img src={logo} alt="Logo" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
                <span style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '-0.5px', color: 'white' }}>StreamForge <span style={{opacity: 0.5, fontWeight: 400}}>/ Docs</span></span>
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }} className="hover:text-white">
                    <Home size={16} /> Home
                </button>
                <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)' }} className="hidden md:block"></div>
                <button 
                    onClick={() => navigate('/login')}
                    style={{ background: '#fff', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                >
                    Log In
                </button>
            </div>
        </nav>

        <div style={{ display: 'flex', paddingTop: '70px', maxWidth: '1400px', margin: '0 auto' }}>
            
            {/* --- SIDEBAR --- */}
            <aside style={{ 
                width: '260px', position: 'fixed', top: '70px', bottom: 0, 
                borderRight: '1px solid rgba(255,255,255,0.05)', 
                padding: '30px 20px', overflowY: 'auto', background: '#09090b',
                zIndex: 40,
                display: 'block' 
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <DocNavGroup title="Getting Started">
                        <NavItem id="intro" active={activeSection} onClick={scrollTo} label="Introduction" icon={<Book size={14} />} />
                        <NavItem id="architecture" active={activeSection} onClick={scrollTo} label="Architecture" icon={<Layers size={14} />} />
                        <NavItem id="quickstart" active={activeSection} onClick={scrollTo} label="Quick Start" icon={<Zap size={14} />} />
                    </DocNavGroup>

                    <DocNavGroup title="Core Concepts">
                        <NavItem id="nodes" active={activeSection} onClick={scrollTo} label="Pipeline Nodes" icon={<Database size={14} />} />
                        <NavItem id="python" active={activeSection} onClick={scrollTo} label="Python Runtime" icon={<Code2 size={14} />} />
                    </DocNavGroup>

                    <DocNavGroup title="Developers">
                        <NavItem id="api" active={activeSection} onClick={scrollTo} label="API Reference" icon={<Terminal size={14} />} />
                        <NavItem id="security" active={activeSection} onClick={scrollTo} label="Security" icon={<Shield size={14} />} />
                    </DocNavGroup>
                </div>
            </aside>

            {/* --- CONTENT --- */}
            <main style={{ marginLeft: '260px', padding: '60px 80px', width: '100%', maxWidth: '900px' }}>
                
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '20px', color: 'white', letterSpacing: '-1px' }}>Documentation</h1>
                    <p style={{ fontSize: '18px', color: '#a1a1aa', lineHeight: '1.6', marginBottom: '60px' }}>
                        Everything you need to build, deploy, and scale data pipelines on StreamForge.
                    </p>
                </motion.div>

                {/* 1. INTRODUCTION */}
                <Section id="intro" title="Introduction">
                    <p className="doc-text">
                        StreamForge is a fully managed data orchestration platform. We replace complex Airflow setups with a visual, drag-and-drop interface powered by a scalable Python backend.
                    </p>
                    <div className="doc-alert">
                        <Zap size={18} color="#10b981" />
                        <span><strong>Focus on logic, not infra.</strong> We handle the execution environment, dependencies, and scaling.</span>
                    </div>
                </Section>

                {/* 2. ARCHITECTURE */}
                <Section id="architecture" title="Architecture">
                    <p className="doc-text">
                        Our decoupled architecture ensures reliability. The frontend is a lightweight React application, while the heavy lifting is done by our distributed Python engine.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                        <ArchitectureCard 
                            title="Control Plane" 
                            desc="React-based visual studio. Handles configuration, validation, and real-time collaboration via WebSockets." 
                            icon={<Cpu color="#3b82f6" />}
                        />
                        <ArchitectureCard 
                            title="Execution Plane" 
                            desc="Isolated Python environments. Each pipeline runs in its own container to ensure security and stability." 
                            icon={<Server color="#10b981" />}
                        />
                    </div>
                </Section>

                {/* 3. QUICK START */}
                <Section id="quickstart" title="Quick Start">
                    <p className="doc-text">Go from zero to production pipeline in under 5 minutes.</p>
                    <ol style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#a1a1aa', marginBottom: '20px' }}>
                        <li style={{ marginBottom: '10px' }}><strong>Create an Account:</strong> Sign up to access your private workspace.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Upload Data:</strong> Navigate to <span className="code-snippet">Data Sources</span> and upload a CSV file.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Build:</strong> Go to the Builder, drag your source node, and connect it to a Filter node.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Run:</strong> Click "Run Pipeline". Watch the logs stream in real-time.</li>
                    </ol>
                </Section>

                {/* 4. NODE REFERENCE */}
                <Section id="nodes" title="Node Reference">
                    <p className="doc-text">
                        The builder provides a rich library of nodes to manipulate your data.
                    </p>
                    <table className="doc-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Node Type</th>
                                <th>Function</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><span className="badge badge-blue">Source</span></td>
                                <td>File Source</td>
                                <td>Ingest CSV, JSON, or Excel files from storage.</td>
                            </tr>
                            <tr>
                                <td><span className="badge badge-purple">Transform</span></td>
                                <td>Filter</td>
                                <td>Remove rows based on conditional logic (e.g., `revenue = 1000`).</td>
                            </tr>
                            <tr>
                                <td><span className="badge badge-purple">Transform</span></td>
                                <td>Join</td>
                                <td>Merge two datasets on a common key (Left, Right, Inner).</td>
                            </tr>
                            <tr>
                                <td><span className="badge badge-green">Destination</span></td>
                                <td>Export</td>
                                <td>Save the final dataset to SQLite or download as CSV.</td>
                            </tr>
                        </tbody>
                    </table>
                </Section>

                {/* 5. PYTHON RUNTIME */}
                <Section id="python" title="Python Runtime">
                    <p className="doc-text">
                        For advanced logic, use the <strong>Python Script</strong> node. It exposes the pandas DataFrame as `df`.
                    </p>
                    <CodeBlock language="python">
{`def transform(df):
    # Example: Calculate sales tax
    df['total_with_tax'] = df['price'] * 1.2
    
    # Filter out invalid rows
    df = df[df['status'] == 'active']
    
    return df`}
                    </CodeBlock>
                </Section>

                {/* 6. API REFERENCE */}
                <Section id="api" title="API Reference">
                    <p className="doc-text">
                        Trigger pipelines programmatically from your own applications.
                    </p>
                    <div style={{ marginBottom: '20px' }}>
                        <span className="method-badge post">POST</span> 
                        <span style={{ fontFamily: 'monospace', color: '#e4e4e7', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>
                            https://api.streamforge.io/v1/pipeline/{'{id}'}/execute
                        </span>
                    </div>
                    <CodeBlock language="bash">
{`curl -X POST https://api.streamforge.io/v1/pipeline/123/execute \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                    </CodeBlock>
                </Section>

                {/* 7. SECURITY */}
                <Section id="security" title="Security">
                    <p className="doc-text">
                        We take data security seriously.
                    </p>
                    <ul className="doc-list">
                        <li><strong>Encryption:</strong> All data is encrypted at rest (AES-256) and in transit (TLS 1.3).</li>
                        <li><strong>Isolation:</strong> Customer data is logically separated. Pipeline execution occurs in ephemeral containers.</li>
                        <li><strong>Compliance:</strong> Our infrastructure is designed to meet SOC2 standards.</li>
                    </ul>
                </Section>

                <div style={{ height: '100px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '80px', paddingTop: '40px', textAlign: 'center', color: '#52525b', fontSize: '14px' }}>
                    &copy; 2026 StreamForge Inc. All rights reserved.
                </div>
            </main>
        </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const DocNavGroup = ({ title, children }) => (
    <div>
        <h4 style={{ fontSize: '11px', fontWeight: '700', color: '#52525b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', paddingLeft: '12px' }}>
            {title}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>{children}</div>
    </div>
);

const NavItem = ({ id, active, onClick, label, icon }) => (
    <div 
        onClick={() => onClick(id)}
        style={{ 
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 12px', borderRadius: '6px', cursor: 'pointer',
            fontSize: '14px', fontWeight: '500', transition: 'all 0.2s',
            background: active === id ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
            color: active === id ? '#fff' : '#a1a1aa',
        }}
    >
        {React.cloneElement(icon, { color: active === id ? '#10b981' : 'currentColor', opacity: active === id ? 1 : 0.7 })}
        {label}
    </div>
);

const Section = ({ id, title, children }) => (
    <section id={id} style={{ marginBottom: '80px', scrollMarginTop: '100px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#10b981' }}>#</span> {title}
        </h2>
        {children}
    </section>
);

const CodeBlock = ({ language, children }) => (
    <div style={{ 
        background: '#18181b', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', 
        overflow: 'hidden', margin: '24px 0', fontFamily: 'monospace', fontSize: '13px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
    }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#71717a', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
            {language}
        </div>
        <pre style={{ padding: '20px', overflowX: 'auto', margin: 0, color: '#d4d4d8', lineHeight: '1.6' }}>
            {children}
        </pre>
    </div>
);

const ArchitectureCard = ({ title, desc, icon }) => (
    <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#fff', fontWeight: '600' }}>
            {icon} {title}
        </div>
        <p style={{ fontSize: '14px', color: '#a1a1aa', margin: 0, lineHeight: '1.6' }}>{desc}</p>
    </div>
);

// CSS Helpers injected for this page
const styles = `
.doc-text { color: #d4d4d8; font-size: 16px; line-height: 1.7; margin-bottom: 20px; }
.doc-alert { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 16px; borderRadius: 8px; display: flex; gap: 12px; align-items: flex-start; color: #d4d4d8; font-size: 14px; margin-bottom: 24px; }
.doc-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
.doc-table th { text-align: left; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); color: #fff; font-size: 14px; }
.doc-table td { padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #a1a1aa; font-size: 14px; }
.badge { padding: 4px 8px; borderRadius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
.badge-blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.badge-purple { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
.badge-green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.method-badge { padding: 4px 8px; borderRadius: 4px; font-size: 12px; font-weight: 700; margin-right: 10px; }
.method-badge.post { background: #10b981; color: #000; }
.code-snippet { background: rgba(255,255,255,0.1); padding: 2px 6px; borderRadius: 4px; color: #fff; font-family: monospace; font-size: 13px; }
.doc-list li { margin-bottom: 10px; color: #a1a1aa; font-size: 16px; }
.doc-list strong { color: #fff; }
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default DocumentationPage;
import React from 'react';

const LandingPage = () => {
  // Common Styles
  const styles = {
    page: {
      backgroundColor: '#0f1115', // Deep dark background
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: '100vh',
      margin: 0,
      padding: 0,
      overflowX: 'hidden',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
    },
    // Buttons
    btnPrimary: {
      backgroundColor: '#10b981', // Emerald green
      color: '#000',
      fontWeight: '600',
      padding: '12px 24px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'background 0.2s',
    },
    btnSecondary: {
      backgroundColor: '#27272a', // Dark gray
      color: '#fff',
      fontWeight: '600',
      padding: '12px 24px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      marginLeft: '15px',
      transition: 'background 0.2s',
    },
    // Typography
    h1: {
      fontSize: '48px',
      fontWeight: '800',
      lineHeight: '1.1',
      marginBottom: '20px',
      textAlign: 'center',
    },
    h2: {
      fontSize: '36px',
      fontWeight: '700',
      marginBottom: '15px',
    },
    h3: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '10px',
      color: '#fff',
    },
    p: {
      color: '#9ca3af', // Light gray text
      fontSize: '18px',
      lineHeight: '1.6',
      marginBottom: '30px',
      maxWidth: '600px',
      marginLeft: 'auto',
      marginRight: 'auto',
      textAlign: 'center',
    },
    // Cards
    card: {
      backgroundColor: '#18181b', // Slightly lighter dark for cards
      padding: '30px',
      borderRadius: '12px',
      border: '1px solid #27272a',
      textAlign: 'left',
    },
    iconBox: {
      width: '40px',
      height: '40px',
      backgroundColor: 'rgba(16, 185, 129, 0.1)', // Green tint
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '20px',
      color: '#10b981',
    },
  };

  return (
    <div style={styles.page}>
      
      {/* 1. HERO SECTION */}
      <section style={{ padding: '80px 0 60px', textAlign: 'center' }}>
        <div style={styles.container}>
          <h1 style={styles.h1}>
            Build data pipelines<br />
            developers actually love
          </h1>
          <p style={styles.p}>
            StreamForge brings software engineering best practices to your data
            infrastructure. Version control, test, and deploy with confidence.
          </p>
          <div style={{ marginTop: '30px' }}>
            <button style={styles.btnPrimary}>
              Start Building <span>→</span>
            </button>
            <button style={styles.btnSecondary}>
              Read Documentation
            </button>
          </div>
        </div>
      </section>

      {/* 2. THREE FEATURE CARDS */}
      <section style={{ padding: '40px 0' }}>
        <div style={{ ...styles.container, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* Card 1 */}
          <div style={styles.card}>
            <div style={styles.iconBox}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            </div>
            <h3 style={styles.h3}>Code-First Design</h3>
            <p style={{...styles.p, fontSize: '15px', textAlign: 'left', margin: 0}}>
              Define transformations in SQL or Python. Your code is the single source of truth.
            </p>
          </div>

          {/* Card 2 */}
          <div style={styles.card}>
            <div style={styles.iconBox}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 style={styles.h3}>Instant Replays</h3>
            <p style={{...styles.p, fontSize: '15px', textAlign: 'left', margin: 0}}>
              Debug failures by replaying pipelines from any specific point in time instantly.
            </p>
          </div>

          {/* Card 3 */}
          <div style={styles.card}>
            <div style={styles.iconBox}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 style={styles.h3}>Enterprise Security</h3>
            <p style={{...styles.p, fontSize: '15px', textAlign: 'left', margin: 0}}>
              Role-based access control, audit logs, and isolated environments out of the box.
            </p>
          </div>

        </div>
      </section>

      {/* 3. SPLIT SECTION: DEVELOPER EXPERIENCE */}
      <section style={{ padding: '80px 0' }}>
        <div style={{ ...styles.container, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
          
          {/* Left: Text */}
          <div style={{ textAlign: 'left' }}>
            <p style={{ color: '#10b981', fontWeight: 'bold', fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px', textAlign: 'left' }}>
              Developer Experience
            </p>
            <h2 style={{ ...styles.h2, fontSize: '36px', lineHeight: '1.2' }}>
              Visual clarity meets<br />code precision
            </h2>
            <p style={{ ...styles.p, textAlign: 'left', margin: '0 0 30px 0' }}>
              Don't choose between a drag-and-drop interface and a code editor. StreamForge syncs both in real-time.
            </p>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Bi-directional syncing', 'Git integration built-in', 'Live lineage graphs'].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: '#fff', fontWeight: '500' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontSize: '12px' }}>✓</div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Code Block Visual */}
          <div style={{ background: '#18181b', borderRadius: '12px', padding: '24px', fontFamily: 'monospace', fontSize: '14px', border: '1px solid #27272a', color: '#e4e4e7', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308' }}></div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }}></div>
            </div>
            
            <div style={{ lineHeight: '1.6' }}>
              <span style={{ color: '#eab308' }}>def</span> <span style={{ color: '#60a5fa' }}>process_batch</span>(data):<br/>
              &nbsp;&nbsp;<span style={{ color: '#6b7280' }}>"""Transforms raw events"""</span><br/>
              &nbsp;&nbsp;df = pd.DataFrame(data)<br/>
              &nbsp;&nbsp;df[<span style={{ color: '#a5f3fc' }}>'timestamp'</span>] = pd.to_datetime(now)<br/>
              &nbsp;&nbsp;<span style={{ color: '#f472b6' }}>return</span> df.to_sql(<span style={{ color: '#a5f3fc' }}>'analytics'</span>)<br/>
              <br/>
              <span style={{ color: '#f472b6' }}>@pipeline</span>(schedule=<span style={{ color: '#a5f3fc' }}>"@daily"</span>)<br/>
              <span style={{ color: '#eab308' }}>def</span> <span style={{ color: '#60a5fa' }}>daily_rollups</span>():<br/>
              &nbsp;&nbsp;src = source(<span style={{ color: '#a5f3fc' }}>"postgres_prod"</span>)<br/>
              &nbsp;&nbsp;process_batch(src)
            </div>
          </div>

        </div>
      </section>

      {/* 4. DESIGNED FOR SCALE */}
      <section style={{ padding: '60px 0' }}>
        <div style={styles.container}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={styles.h2}>Designed for scale</h2>
            <p style={styles.p}>Whether you're moving gigabytes or petabytes, we've got you covered.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
             {/* Big Card 1 */}
             <div style={{ ...styles.card, padding: '40px' }}>
               <h3 style={styles.h3}>Modern Analytics</h3>
               <p style={{ ...styles.p, fontSize: '15px', textAlign: 'left', margin: 0 }}>
                 Power your BI tools with fresh, trustworthy data from all your operational systems.
               </p>
             </div>
             {/* Big Card 2 */}
             <div style={{ ...styles.card, padding: '40px' }}>
               <h3 style={styles.h3}>Machine Learning</h3>
               <p style={{ ...styles.p, fontSize: '15px', textAlign: 'left', margin: 0 }}>
                 Automate feature engineering pipelines and maintain high-quality training datasets.
               </p>
             </div>
          </div>
        </div>
      </section>

      {/* 5. BOTTOM CTA */}
      <section style={{ padding: '80px 0', marginTop: '40px' }}>
        <div style={{ ...styles.container, background: '#111827', padding: '60px', borderRadius: '16px', textAlign: 'center', border: '1px solid #1f2937' }}>
          <h2 style={{ ...styles.h2, fontSize: '32px' }}>Ready to modernize your stack?</h2>
          <p style={{ ...styles.p, marginBottom: '30px' }}>
            Join thousands of data engineers who are shipping pipelines faster and sleeping better at night.
          </p>
          <button style={styles.btnPrimary}>Create Free Account</button>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
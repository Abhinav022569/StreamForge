import React, { useRef, useEffect } from 'react';

const ParticlesBackground = ({ children }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    // CONFIGURATION
    const particleColor = 'rgba(16, 185, 129, 0.5)'; // Emerald Green
    const lineColor = 'rgba(16, 185, 129, 0.15)';   // Faint Emerald lines
    const particleCount = window.innerWidth < 768 ? 40 : 80; // Fewer dots on mobile
    const connectionDistance = 150; // Max distance to draw a line
    
    // RESIZE HANDLER
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    // PARTICLE CLASS
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5; // Slow horizontal speed
        this.vy = (Math.random() - 0.5) * 0.5; // Slow vertical speed
        this.size = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.fillStyle = particleColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and Draw Particles
      particles.forEach((p, index) => {
        p.update();
        p.draw();

        // Connect particles with lines
        for (let j = index + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    // INITIALIZE
    handleResize();
    window.addEventListener('resize', handleResize);
    animate();

    // CLEANUP
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#0f1115' }}>
      
      {/* 1. CANVAS LAYER (Fixed to viewport) */}
      <canvas 
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none' // Allows clicks to pass through
        }}
      />

      {/* 2. SUBTLE STATIC GLOWS (For depth) */}
      <div style={{
          position: 'fixed', top: '-20%', left: '-10%', width: '50vw', height: '50vw',
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
          borderRadius: '50%', zIndex: 0, pointerEvents: 'none'
      }}></div>

      {/* 3. CONTENT LAYER (Scrollable) */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>

    </div>
  );
};

export default ParticlesBackground;
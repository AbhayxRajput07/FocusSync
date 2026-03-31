import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';
import { Lock, Waves, Activity, BrainCircuit, ChevronRight, Command, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-6 nav-header">
      <nav className="flex w-full max-w-4xl items-center justify-between rounded-full bg-white px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-[#EEF2F7] backdrop-blur-md">
        
        <div className="flex items-center gap-8 pl-3">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}       
            className="group flex items-center gap-2 text-left transition-opacity hover:opacity-70"
          >
            <span className="h-3 w-3 rounded-full bg-[#0D1117]" />
            <span className="text-[15px] font-bold tracking-tight text-[#0D1117] font-space">FocusSync</span>
          </button>
          
          <div className="hidden md:flex items-center gap-6 text-[14px] font-medium text-slate-500 font-space">
            <button onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-[#0D1117] transition-colors">Architecture</button>
            <button onClick={() => window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})} className="hover:text-[#0D1117] transition-colors">Systems</button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden sm:block rounded-full px-5 py-2.5 text-[14px] font-medium text-slate-500 transition-colors hover:text-[#0D1117] font-space"
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="relative overflow-hidden rounded-full bg-[#0D1117] px-6 py-2.5 text-[14px] font-bold text-white transition-transform hover:scale-[1.03] active:scale-[0.98] font-space"
          >
            <span className="relative z-10">Access System</span>
          </button>
        </div>
      </nav>
    </header>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  useEffect(() => {
    // Add Space Grotesk dynamically if not present
    if (!document.getElementById('space-grotesk')) {
      const link = document.createElement('link');
      link.id = 'space-grotesk';
      link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700;900&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 1,
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  useGSAP(() => {
    // Nav entrance
    gsap.fromTo('.nav-header', { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' });

    // Hero entrance - Word by word stagger
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', force3D: true } });
    
    tl.fromTo('.hero-badge', 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8 }, 
        0.2
      )
      .fromTo('.hero-title-word', 
        { y: 50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1, stagger: 0.15 }, 
        0.4
      )
      .fromTo('.hero-desc', 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1 }, 
        1.0
      )
      .fromTo('.hero-cta', 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1 }, 
        1.2
      );

    // Ghost text reveal
    const statementWords = gsap.utils.toArray('.ghost-word');
    gsap.fromTo(statementWords, 
      { opacity: 0.08 }, 
      { 
        opacity: 1, 
        stagger: 0.1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.statement-section',
          start: 'top 70%',
          end: 'center 40%',
          scrub: true,
        }
      }
    );

    // Grid section reveal
    gsap.fromTo('.bento-card', 
      { y: 40, opacity: 0 },
      {
        y: 0, 
        opacity: 1,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.bento-grid',
          start: 'top 85%',
        }
      }
    );

    // Footer scaling
    gsap.fromTo('.finale-title', 
      { scale: 0.9, opacity: 0 },
      { 
        scale: 1, 
        opacity: 1,
        duration: 1.2,
        scrollTrigger: {
          trigger: '.finale-section',
          start: 'top 80%',
        }
      }
    );

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative min-h-screen bg-gradient-to-b from-[#EEF2F7] to-white text-[#0D1117] selection:bg-[#0EA5E9] selection:text-white font-space overflow-hidden will-change-scroll" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      
      <Navbar />

{/* Sea Blue Oceanic Gradient Background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Base tint */}
          <div className="absolute inset-0 bg-[#E0F2FE] opacity-40 mix-blend-multiply" />
          
          {/* Animated Blobs */}
          <div className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] bg-[#38BDF8] blur-[140px] rounded-full animate-[wave-slow_15s_ease-in-out_infinite_alternate] opacity-40 mix-blend-multiply" />
          <div className="absolute top-[20%] -left-[20%] w-[50vw] h-[50vw] bg-[#0EA5E9] blur-[130px] rounded-full animate-[wave-medium_12s_ease-in-out_infinite_alternate-reverse] opacity-30 mix-blend-multiply" />
          <div className="absolute -bottom-[20%] left-[20%] w-[70vw] h-[60vw] bg-[#22D3EE] blur-[150px] rounded-full animate-[wave-fast_18s_ease-in-out_infinite_alternate] opacity-30 mix-blend-multiply" />

          {/* Optional Noise Texture for "Water/Weather" granularity */}
          <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
      </div>

      {/* SECTION 1 - HERO */}
      <main className="hero-section relative z-10 flex min-h-[100vh] items-center justify-center px-6 pt-20">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          
          <div className="hero-badge mb-10 flex items-center gap-2 rounded-full border border-slate-300 bg-white/50 py-1.5 px-4 backdrop-blur-md shadow-sm">
            <Command className="h-3.5 w-3.5 text-[#0D1117]" />
            <span className="text-[12px] font-bold tracking-[0.1em] text-[#0D1117] uppercase font-mono">PROTOCOL_V2.0</span>
          </div>

          <h1 className="flex flex-col text-[clamp(4.5rem,12vw,11rem)] font-[900] leading-[0.9] tracking-tighter text-[#0D1117] mb-2">
            <div className="overflow-hidden py-2"><div className="hero-title-word drop-shadow-sm">Focus</div></div>
            <div className="overflow-hidden py-2">
              <div className="hero-title-word drop-shadow-sm flex items-center justify-center">
                Engineered<span className="bg-gradient-to-br from-[#0D1117] to-transparent bg-clip-text text-transparent">.</span>
              </div>
            </div>
          </h1>

          <p className="hero-desc mt-8 max-w-2xl text-[18px] text-slate-500 font-medium tracking-tight leading-relaxed">
            Not another glorified timer. A surgical approach to deep work. High-performance monitoring, hard enforcement, and exact scoring.
          </p>

          <div className="hero-cta mt-12 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              onClick={() => navigate('/dashboard')}
              className="group flex items-center justify-center gap-2 rounded-full bg-[#0D1117] px-8 py-4 text-[15px] font-bold tracking-wide text-white transition-transform hover:scale-[1.03] shadow-[0_8px_20px_rgba(13,17,23,0.15)]"
            >
              Initialize System <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
              <a 
                href="/docs.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-8 py-4 text-[15px] font-bold tracking-wide text-[#0D1117] transition-transform hover:scale-[1.03] shadow-sm"
              >
               View Documentation
              </a>
          </div>
        </div>
      </main>

      {/* SECTION 2 - STATEMENT */}
      <section className="statement-section relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-6">
        <div className="flex items-center gap-2 mb-10 opacity-80">
          <Sparkles className="h-5 w-5 text-[#0EA5E9]" />
          <span className="text-[13px] font-bold tracking-[0.2em] text-[#0EA5E9] uppercase">The Reality</span>
        </div>
        
        <h2 className="text-[clamp(3.5rem,8vw,8rem)] font-[900] leading-[1.05] tracking-tighter text-[#0D1117] text-center max-w-6xl">
          <div className="opacity-100 flex flex-wrap justify-center gap-x-[1.5vw]">
            {["Distraction", "is", "a", "system", "failure."].map((word, i) => (
              <span key={`line1-${i}`} className="ghost-word will-change-[opacity]">{word}</span>
            ))}
          </div>
          <div className="opacity-100 flex flex-wrap justify-center gap-x-[1.5vw] mt-2">
            {["FocusSync", "is", "the", "patch."].map((word, i) => (
              <span key={`line2-${i}`} className="ghost-word will-change-[opacity]">{word}</span>
            ))}
          </div>
        </h2>
      </section>

      {/* SECTION 3 - SYSTEM ARCHITECTURE */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-32" id="features">
        <div className="mb-20 flex flex-col items-center text-center">
          <h2 className="text-4xl md:text-5xl font-[900] tracking-tighter text-[#0D1117] mb-4">System Architecture</h2>
          <p className="text-slate-500 tracking-wide text-lg font-medium">Built for zero compromise execution.</p>
        </div>

        <div className="bento-grid grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          
          {/* Card 1: Large */}
          <div className="bento-card md:col-span-2 group relative bg-white p-10 transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-200">
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="flex justify-between items-start">
                <Lock className="h-8 w-8 text-[#0EA5E9]" strokeWidth={2.5} />
                <span className="text-[12px] font-bold tracking-widest text-slate-400 font-mono">MOD_01</span>
              </div>
              <div>
                <p className="text-[13px] font-[900] tracking-wider text-[#0EA5E9] mb-3 uppercase">Kernel Level</p>
                <h3 className="text-3xl font-[900] tracking-tight text-[#0D1117]">Hard Screen Lock</h3>
                <p className="mt-3 text-slate-500 text-[16px] font-medium max-w-md leading-relaxed">Mathematically blocking escape routes. Once a session begins, there is no exit. Only execution.</p>
              </div>
            </div>
          </div>

          {/* Card 2: Small */}
          <div className="bento-card group relative bg-white p-10 transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-200">
            <div className="relative z-10 flex h-full flex-col justify-between">
              <Waves className="h-8 w-8 text-[#0EA5E9]" strokeWidth={2.5} />
              <div>
                <p className="text-[13px] font-[900] tracking-wider text-[#0EA5E9] mb-3 uppercase">Procedural</p>
                <h3 className="text-2xl font-[900] tracking-tight text-[#0D1117]">40Hz Audio</h3>
              </div>
            </div>
          </div>

          {/* Card 3: Small */}
          <div className="bento-card group relative bg-white p-10 transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-200">
             <div className="relative z-10 flex h-full flex-col justify-between">
              <Activity className="h-8 w-8 text-[#E11D48]" strokeWidth={2.5} />
              <div>
                <p className="text-[13px] font-[900] tracking-wider text-[#E11D48] mb-3 uppercase">Telemetry</p>
                <h3 className="text-2xl font-[900] tracking-tight text-[#0D1117]">Exact Scoring</h3>
              </div>
            </div>
          </div>

          {/* Card 4: Large */}
          <div className="bento-card md:col-span-2 group relative bg-white p-10 transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-200">
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="flex justify-between items-start">
                <BrainCircuit className="h-8 w-8 text-[#9333EA]" strokeWidth={2.5} />
                <span className="text-[12px] font-bold tracking-widest text-slate-400 font-mono">MOD_04</span>
              </div>
              <div>
                <p className="text-[13px] font-[900] tracking-wider text-[#9333EA] mb-3 uppercase">Machine Learning</p>
                <h3 className="text-3xl font-[900] tracking-tight text-[#0D1117]">Vulnerability Map</h3>
                <p className="mt-3 text-slate-500 text-[16px] font-medium max-w-md leading-relaxed">Predictive modeling of your distraction patterns. Stop failing before it happens.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 - CTA FINALE */}
      <section className="finale-section relative z-10 min-h-screen flex flex-col items-center justify-center bg-gradient-to-t from-[#EEF2F7] to-transparent">
        <div className="mx-auto max-w-4xl px-6 relative z-10 w-full text-center finale-title">
          <h2 className="text-[clamp(4.5rem,10vw,8rem)] font-[900] tracking-tighter text-[#0D1117] mb-12 leading-[0.9]">
            Begin the<br/>Sequence.
          </h2>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-[#0D1117] px-10 py-5 text-[16px] font-bold tracking-wide text-white transition-transform hover:scale-[1.03] shadow-[0_12px_40px_rgba(13,17,23,0.15)]"
          >
            Deploy System <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 bg-[#0D1117] py-12 text-center flex flex-col items-center justify-center gap-4">
        <div className="h-3 w-3 rounded-full bg-white" />
        <p className="text-[12px] font-bold tracking-[0.2em] text-slate-400 uppercase font-mono">
          FOCUSSYNC © {new Date().getFullYear()} // NO SYSTEM FAILS.
        </p>
      </footer>

      {/* Sea Blue Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes wave-slow {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-2vw, 5vh) scale(1.05); }
          100% { transform: translate(2vw, -2vh) scale(0.95); }
        }
        @keyframes wave-medium {
          0% { transform: translate(0, 0) scale(0.95); }
          50% { transform: translate(3vw, -4vh) scale(1.05); }
          100% { transform: translate(-1vw, 2vh) scale(1); }
        }
        @keyframes wave-fast {
          0% { transform: translate(0, 0) scale(1.05); }
          50% { transform: translate(-4vw, -2vh) scale(0.95); }
          100% { transform: translate(2vw, 4vh) scale(1); }
        }
      `}} />
    </div>
  );
};

export default Landing;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import {
  Play, Settings, Clock, Shield, Target, Activity,
  CircleDot, Flame, Zap, Award, Moon, Circle, MousePointer2, Lock, CheckCircle2, X
} from 'lucide-react';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Sparkline SVG Component
const Sparkline = ({ color }) => (
  <svg className="w-full h-8 mt-2" viewBox="0 0 100 25" preserveAspectRatio="none">
    <path
      d="M0 20 Q 10 10, 20 20 T 40 15 T 60 22 T 80 5 T 100 10"
      fill="none" animate="dash"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
    />
  </svg>
);

// Counter Component
const AnimatedCounter = ({ end, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const stepTime = Math.abs(Math.floor(duration / end));
    if (end === 0) return;
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [end]);

  return <span>{prefix}{count}{suffix}</span>;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  const chartData = {
    labels: ['9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p'],
    datasets: [
      {
        label: 'Focus (min)',
        data: [10, 45, 55, 30, 0, 50, 60, 40, 0],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#2563EB',
        pointBorderColor: '#FFF',
        pointRadius: 4,
      },
      {
        label: 'Distraction',
        data: [20, 5, 2, 10, 40, 5, 0, 5, 0],
        borderColor: '#94A3B8',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.4,
        pointBackgroundColor: '#94A3B8',
        pointRadius: 0,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 6, font: { family: 'Inter', size: 11 } } },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 }, color: '#64748B' } },
      y: { grid: { color: '#F1F5F9' }, ticks: { font: { family: 'Inter', size: 11 }, color: '#64748B' }, beginAtZero: true }
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in">
      
      {/* SECTION 1: WELCOME BANNER */}
      <div 
        className="w-full rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-[0_8px_30px_rgba(37,99,235,0.15)] group"
        style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #7C3AED 100%)' }}
      >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 mb-4 border border-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
              <span className="text-[10px] font-bold tracking-widest uppercase">Welcome Back</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-[800] tracking-tight mb-2">
              Morning Check-in, <span className="text-white/60">Abhay</span>
            </h1>
            <p className="text-[14px] text-white/80 font-medium leading-relaxed max-w-xl">
              System is armed. You hold a 7-session continuity rating. Telemetry suggests peak cognitive capacity for the next 120 minutes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/5 backdrop-blur-sm px-6 py-3 text-[13px] font-bold transition-all hover:bg-white/10">
              <Settings className="h-4 w-4" /> TELEMETRY
            </button>
            <button 
              onClick={() => navigate('/session')}
              className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[13px] font-bold text-[#2563EB] shadow-[0_4px_14px_rgba(0,0,0,0.1)] transition-transform hover:scale-105 active:scale-95"
            >
              <Play className="h-4 w-4 fill-current" /> ENGAGE PROTOCOL
            </button>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="flex flex-wrap gap-3">
        {['Start 25min Pomodoro', 'Block All Social', 'Enable 40Hz Audio', 'View Last Session'].map((action, i) => (
          <button key={i} className="flex-1 sm:flex-none whitespace-nowrap rounded-full border border-[#2563EB]/20 bg-white px-5 py-2.5 text-[13px] font-semibold text-[#2563EB] transition-all hover:bg-[#EFF6FF] hover:border-[#2563EB]/40 shadow-sm">
            {action}
          </button>
        ))}
      </div>

      {/* SECTION 2: STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'TOTAL UP-TIME', val: 184, sfx: 'm', badge: '+12%', desc: 'VS PREV CYCLE', icon: Clock, c: '#10B981', sc: '#10B981' },
          { title: 'SHIELD INTEGRITY', val: 100, sfx: '%', badge: 'STABLE', desc: 'FOCUS / DISTRACT', icon: Shield, c: '#2563EB', sc: '#2563EB' },
          { title: 'COGNITIVE SCORE', val: 91, sfx: '', badge: '+4 PT', desc: 'BASELINE 7-DAY', icon: Target, c: '#10B981', sc: '#7C3AED' },
          { title: 'CYCLES EXECUTED', val: 12, sfx: '', badge: 'OPTIMAL', desc: 'DAILY CONFIG', icon: Activity, c: '#2563EB', sc: '#F59E0B' }
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E2E8F0] hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase">{stat.title}</p>
              <stat.icon className="h-4 w-4 text-[#94A3B8]" />
            </div>
            <div className="text-3xl font-[800] text-[#0F172A] tracking-tight mb-2">
              <AnimatedCounter end={stat.val} suffix={stat.sfx} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100" style={{color: stat.c}}>{stat.badge}</span>
              <span className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wide">{stat.desc}</span>
            </div>
            <Sparkline color={stat.sc} />
          </div>
        ))}
      </div>

      {/* SECTION 3: CHARTS & GAUGE */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Timeline Analytics */}
        <div className="flex-1 lg:w-[65%] rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E2E8F0]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-[16px] font-bold text-[#0F172A]">Timeline Analytics</h2>
              <p className="text-[11px] font-bold text-[#2563EB] tracking-wider uppercase mt-1">HOURLY FOCUS VECTOR</p>
            </div>
            <div className="flex bg-slate-100 rounded-full p-1">
              <button className="px-3 py-1 rounded-full bg-white text-[#0F172A] text-[11px] font-bold shadow-sm">24H</button>
              <button className="px-3 py-1 rounded-full text-[#64748B] hover:text-[#0F172A] text-[11px] font-bold">7D</button>
            </div>
          </div>
          <div className="h-[240px] w-full">
             <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Right: Current State */}
        <div className="w-full lg:w-[35%] rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E2E8F0] flex flex-col">
          <div>
             <h2 className="text-[16px] font-bold text-[#0F172A]">Current State</h2>
             <p className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase mt-1">REAL-TIME STATUS</p>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center py-6">
            <div className="relative h-40 w-40 flex items-center justify-center rounded-full shadow-[0_0_40px_rgba(37,99,235,0.15)] mb-6">
              <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                <circle 
                  cx="50" cy="50" r="45" fill="none" stroke="#2563EB" strokeWidth="8" 
                  strokeLinecap="round" strokeDasharray="283" strokeDashoffset="42" 
                  className="transition-all duration-1500 ease-out" 
                />
              </svg>
              <div className="relative z-10 flex flex-col items-center">
                <Shield className="h-5 w-5 text-[#2563EB] mb-1" />
                <span className="text-3xl font-[900] text-[#0F172A] tracking-tighter"><AnimatedCounter end={85} />%</span>
                <span className="text-[9px] font-bold text-[#64748B] tracking-widest uppercase">INTEGRITY</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
              <div>
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">BLOCKS ACTIVE</p>
                <p className="text-[14px] font-bold text-[#0F172A]">412 Subnets</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">MODE</p>
                <p className="text-[14px] font-bold text-[#10B981]">Strict Enforce</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: LOGS & MILESTONES */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left: System Events */}
        <div className="flex-1 lg:w-[58%] rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E2E8F0] min-h-[300px] flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-[16px] font-bold text-[#0F172A]">System Events</h2>
              <p className="text-[11px] font-bold text-[#2563EB] tracking-wider uppercase mt-1">LIVE LOGGING STREAM</p>
            </div>
            <div className="flex items-center gap-2 bg-[#10B981]/10 px-2.5 py-1 rounded-full border border-[#10B981]/20">
              <div className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest text-[#10B981]">LIVE</span>
            </div>
          </div>
          
          <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-200 overflow-y-auto max-h-[220px] font-mono text-[11px] text-slate-600 space-y-2 relative">
             <div className="flex gap-4"><span className="text-[#94A3B8]">11:42:05</span><span className="text-[#2563EB]">INFO</span> <span>System initialized. V2 Kernel active.</span></div>
             <div className="flex gap-4"><span className="text-[#94A3B8]">11:42:10</span><span className="text-[#10B981]">OK</span> <span>Network shield engaged. 412 subnets blocked.</span></div>
             <div className="flex gap-4"><span className="text-[#94A3B8]">11:45:00</span><span className="text-[#F59E0B]">WARN</span> <span>Attempted route violation: discord.com</span></div>
             <div className="flex gap-4"><span className="text-[#94A3B8]">11:45:01</span><span className="text-[#EF4444]">DENY</span> <span>Packet dropped. Integrity maintained.</span></div>
             <div className="flex gap-4"><span className="text-[#94A3B8]">12:00:00</span><span className="text-[#2563EB]">INFO</span> <span>Checkpoint Alpha reached. Score +5.</span></div>
             <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Right: Milestone Array */}
        <div className="w-full lg:w-[42%] rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E2E8F0]">
           <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-[16px] font-bold text-[#0F172A]">Milestone Array</h2>
              <p className="text-[11px] font-bold text-[#7C3AED] tracking-wider uppercase mt-1">UNLOCK PROGRESS</p>
            </div>
            <div className="bg-[#0F172A] text-white px-3 py-1 rounded-full text-[11px] font-bold">3 / 6</div>
          </div>

          <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
            {[
              { t: 'INITIALIZATION', desc: 'Complete your first 5 absolute focus sessions', target: '5 / 5', percent: 100, achieved: true, i: Target, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/30' }, 
              { t: 'SUSTAINED STATE', desc: 'Maintain 90%+ focus score for 2 continuous hours', target: '2 / 2', percent: 100, achieved: true, i: Flame, color: 'from-orange-500 to-rose-500', shadow: 'shadow-orange-500/30' },
              { t: 'DEEP FLOW', desc: 'Reach 10,000 Total Focus Points across all time', target: '10k / 10k', percent: 100, achieved: true, i: Zap, color: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/30' },
              { t: 'FLAWLESS EXE', desc: 'Zero network distractions logged in 10 sessions', target: '7 / 10', percent: 70, achieved: false, i: Award, color: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/30' },
              { t: 'RAPID RE-ENTRY', desc: 'Resume deep focus within 60s after break ends', target: '12 / 20', percent: 60, achieved: false, i: CircleDot, color: 'from-cyan-500 to-blue-500', shadow: 'shadow-cyan-500/30' },
              { t: 'NIGHT OPS', desc: 'Complete 5 late-night deep work sessions (11PM+)', target: '1 / 5', percent: 20, achieved: false, i: Moon, color: 'from-slate-800 to-indigo-900', shadow: 'shadow-indigo-500/30' }
            ].map((m, i) => (
              <div 
                key={i} 
                onClick={() => m.achieved && setSelectedMilestone(m)}
                className={`rounded-xl p-4 flex flex-col gap-3 transition-all ${m.achieved ? `bg-gradient-to-r ${m.color} shadow-lg ${m.shadow} hover:scale-[1.02] cursor-pointer hover:-translate-y-0.5` : 'bg-slate-50 border border-slate-200 hover:border-slate-300 cursor-default'} group`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${m.achieved ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'} transition-colors`}>
                      <m.i className="h-4 w-4" />
                    </div>
                    <div>
                       <h3 className={`text-[12px] font-bold tracking-widest uppercase ${m.achieved ? 'text-white' : 'text-slate-700'}`}>{m.t}</h3>
                       <p className={`text-[10px] mt-0.5 leading-tight ${m.achieved ? 'text-white/80' : 'text-slate-500'}`}>{m.desc}</p>
                    </div>
                  </div>
                  {m.achieved ? <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" /> : <Lock className="h-4 w-4 text-slate-400 flex-shrink-0" />}
                </div>
                
                {/* Progress Bar */}
                <div className="flex items-center gap-3 pl-[44px]">
                  <div className={`flex-1 h-1.5 rounded-full overflow-hidden relative ${m.achieved ? 'bg-black/20' : 'bg-slate-200'}`}>
                    <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${m.achieved ? 'bg-white' : 'bg-[#2563EB]'}`} style={{ width: `${m.percent}%` }}></div>
                  </div>
                  <span className={`text-[10px] font-mono font-medium ${m.achieved ? 'text-white' : 'text-slate-500'}`}>{m.target}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94A3B8; }
      `}} />

      {/* Achievement Modal */}
      {selectedMilestone && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in cursor-pointer" 
          onClick={() => setSelectedMilestone(null)}
        >
          <div 
            className="w-full max-w-[340px] rounded-3xl overflow-hidden shadow-2xl transform transition-all cursor-default bg-white border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`bg-gradient-to-br ${selectedMilestone.color} p-8 flex flex-col items-center text-center relative`}>
              <button 
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors bg-black/10 hover:bg-black/20 p-1.5 rounded-full"
                onClick={() => setSelectedMilestone(null)}
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md mb-5 shadow-lg border border-white/20 rotate-3 transition-transform hover:rotate-6">
                <selectedMilestone.i className="w-10 h-10 text-white drop-shadow-md" />
              </div>
              
              <h2 className="text-[20px] font-black text-white mb-2 tracking-wide uppercase drop-shadow-sm">{selectedMilestone.t}</h2>
              <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-white text-[10px] font-bold uppercase tracking-wider mb-4 border border-white/10 shadow-inner">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                Milestone Reached!
              </div>
              
              <p className="text-white/90 text-[13px] font-medium leading-relaxed max-w-[240px]">
                {selectedMilestone.desc}
              </p>
            </div>
            
            <div className="p-6 bg-white flex flex-col items-center text-center">
              <h3 className="text-[17px] font-black text-slate-800 mb-1.5">Stellar Work! 🎉</h3>
              <p className="text-[12px] text-slate-500 mb-6 max-w-[250px] leading-relaxed font-medium">
                You've successfully hit this milestone. Keep pushing your limits and maintaining that deep focus pace. The next level awaits!
              </p>
              <button 
                className={`w-full py-3.5 rounded-xl text-white text-[13px] font-bold transition-all shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r ${selectedMilestone.color}`}
                onClick={() => setSelectedMilestone(null)}
              >
                Acknowledge Reward
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

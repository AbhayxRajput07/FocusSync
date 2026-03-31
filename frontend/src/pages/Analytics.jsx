import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, AlertTriangle, Clock, ChevronDown, ChevronUp, Activity, PieChart, BarChart3,
  Zap, Flame, ShieldAlert, Sparkles, History
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Tooltip, Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Filler
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.08, delayChildren: 0.1 } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { 
    opacity: 1, y: 0, scale: 1, 
    transition: { type: 'spring', stiffness: 120, damping: 20 } 
  }
};

const useAnimatedCounter = (target, duration = 1500) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target <= 0) { setCount(0); return; }
    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);       
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return count;
};

const Analytics = () => {
  const [dateRange, setDateRange] = useState('week'); 
  const [sessions, setSessions] = useState([]);
  const [expandedSession, setExpandedSession] = useState(null);
  const [expandedDates, setExpandedDates] = useState({});
  const [streak, setStreak] = useState({ current: 0, longest: 0 });

  useEffect(() => {
    const savedSessions = JSON.parse(localStorage.getItem('fs_sessions') || '[]');
    setSessions(savedSessions);
    const savedStreak = JSON.parse(localStorage.getItem('fs_streak') || '{ "current": 0, "longest": 0 }');
    setStreak(savedStreak);
  }, []);

  const getFilteredSessions = () => {
    const now = Date.now();
    const dayMs = 86400000;
    return sessions.filter(s => {
      const sessionTime = s.startTime;
      if (dateRange === 'today') return new Date(sessionTime).toDateString() === new Date().toDateString();
      if (dateRange === 'week') return now - sessionTime < 7 * dayMs;
      if (dateRange === 'month') return now - sessionTime < 30 * dayMs;
      return true;
    });
  };

  const filteredSessions = getFilteredSessions();
  const totalFocusTime = filteredSessions.reduce((sum, s) => sum + (s.focusMinutes || 0), 0);
  const avgScore = filteredSessions.length > 0
    ? Math.round(filteredSessions.reduce((sum, s) => sum + s.finalScore, 0) / filteredSessions.length)
    : 0;
  const totalSessions = filteredSessions.length;

  const animatedFocusTime = useAnimatedCounter(totalFocusTime);
  const animatedScore = useAnimatedCounter(avgScore);
  const animatedSessionCount = useAnimatedCounter(totalSessions);
  const animatedStreak = useAnimatedCounter(streak.longest);

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));        
    }
    return days;
  };

  const last7DaysLabels = getLast7Days();
  const dailyScores = last7DaysLabels.map((_, idx) => {
    const date = new Date(Date.now() - (6 - idx) * 86400000);
    const daySessions = sessions.filter(s => new Date(s.startTime).toDateString() === date.toDateString());
    if (daySessions.length === 0) return null;
    return Math.round(daySessions.reduce((sum, s) => sum + s.finalScore, 0) / daySessions.length);
  });

  const chartGradientFill = (ctx, colorStart, colorEnd) => {
    const chartCtx = ctx.chart.ctx;
    const gradient = chartCtx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(1, colorEnd);
    return gradient;
  };

  const trendLineData = {
    labels: last7DaysLabels,
    datasets: [{
      label: 'Focus Score',
      data: dailyScores,
      borderColor: '#0ea5e9', // Sky 500
      backgroundColor: function(context) {
        const chart = context.chart;
        if (!chart.chartArea) return null;
        return chartGradientFill(context, 'rgba(14, 165, 233, 0.4)', 'rgba(14, 165, 233, 0.0)');
      },
      borderWidth: 5,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 8,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#0ea5e9',
      pointBorderWidth: 4,
      spanGaps: true
    }]
  };

  const stackedBarData = {
    labels: last7DaysLabels,
    datasets: [
      {
        label: 'Focus Mins',
        data: last7DaysLabels.map((_, idx) => {
          const date = new Date(Date.now() - (6 - idx) * 86400000);
          const daySessions = sessions.filter(s => new Date(s.startTime).toDateString() === date.toDateString());
          return daySessions.reduce((sum, s) => sum + (s.focusMinutes || 0), 0);
        }),
        backgroundColor: '#0ea5e9',
        borderRadius: { topLeft: 12, topRight: 12, bottomLeft: 12, bottomRight: 12 },
        borderSkipped: false,
        barPercentage: 0.4,
      },
      {
        label: 'Distraction Mins',
        data: last7DaysLabels.map((_, idx) => {
          const date = new Date(Date.now() - (6 - idx) * 86400000);
          const daySessions = sessions.filter(s => new Date(s.startTime).toDateString() === date.toDateString());
          return daySessions.reduce((sum, s) => sum + (s.distractionMinutes || 0), 0);
        }),
        backgroundColor: '#bae6fd',
        borderRadius: { topLeft: 12, topRight: 12, bottomLeft: 12, bottomRight: 12 },
        borderSkipped: false,
        barPercentage: 0.4,
      }
    ]
  };

  const subjectBreakdown = {};
  filteredSessions.forEach(s => {
    const subject = s.subject || 'Uncategorized';
    subjectBreakdown[subject] = (subjectBreakdown[subject] || 0) + (s.focusMinutes + s.distractionMinutes);
  });

  const donutData = {
    labels: Object.keys(subjectBreakdown),
    datasets: [{
      data: Object.values(subjectBreakdown),
      backgroundColor: ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e'],
      borderWidth: 0,
      hoverOffset: 6
    }]
  };

  const getDistractionHeatmap = () => {
    const heatmap = Array(7).fill(0).map(() => Array(24).fill(0));
    sessions.forEach(s => {
      const date = new Date(s.startTime);
      const day = date.getDay();
      const hour = date.getHours();
      heatmap[day][hour] += s.distractionCount || 0;
    });
    return heatmap;
  };

  const heatmapData = getDistractionHeatmap();
  const maxDistractions = Math.max(...heatmapData.flat());

  let highestRisk = { day: 0, hour: 0, count: 0 };
  heatmapData.forEach((dayData, dayIdx) => {
    dayData.forEach((count, hourIdx) => {
      if (count > highestRisk.count) {
        highestRisk = { day: dayIdx, hour: hourIdx, count };
      }
    });
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const highestRiskText = highestRisk.count > 0
    ? `${dayNames[highestRisk.day]}s at ${highestRisk.hour}:00`
    : 'No data yet';

  const tooltipStyles = {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    titleColor: '#0f172a',
    bodyColor: '#475569',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    padding: 16,
    cornerRadius: 16,
    boxPadding: 8,
    usePointStyle: true,
    bodyFont: { family: "'Inter', sans-serif", size: 14, weight: '500' },
    titleFont: { family: "'Inter', sans-serif", weight: 'bold', size: 15 },
    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)'
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { tooltip: tooltipStyles },
    scales: {
      x: { grid: { display: false, drawBorder: false }, ticks: { color: '#64748b', font: { family: "'Inter', sans-serif", weight: '600' }, padding: 16 } },
      y: { min: 0, max: 100, grid: { color: '#f1f5f9', drawBorder: false, borderDash: [6, 6] }, ticks: { color: '#94a3b8', font: { family: "'Inter', sans-serif", weight: '600' }, padding: 20, stepSize: 20 } }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { tooltip: tooltipStyles },
    scales: {
      x: { stacked: true, grid: { display: false, drawBorder: false }, ticks: { color: '#64748b', font: { family: "'Inter', sans-serif", weight: '600' }, padding: 16 } },
      y: { stacked: true, grid: { color: '#f1f5f9', drawBorder: false, borderDash: [6, 6] }, ticks: { color: '#94a3b8', font: { family: "'Inter', sans-serif", weight: '600' }, padding: 20 } }
    }
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '78%',
    plugins: { tooltip: tooltipStyles }
  };

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="w-full">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-10 pb-24 font-sans max-w-[1600px] mx-auto w-full"
      >
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/70 backdrop-blur-3xl px-8 py-7 rounded-[2.5rem] border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0 group cursor-pointer">
              <div className="absolute inset-0 bg-sky-500 blur-xl opacity-20 rounded-full group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 rounded-[1.25rem] flex items-center justify-center relative shadow-lg shadow-blue-500/30 ring-1 ring-white/50 group-hover:scale-105 transition-transform duration-500">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">Analytics</h1>
              <p className="text-sm sm:text-base font-semibold text-slate-500 mt-1.5 opacity-90">Decoding your cognitive velocity & output.</p>
            </div>
          </div>

          <div className="flex bg-slate-100/80 backdrop-blur-md p-1.5 rounded-[1rem] border border-slate-200/60 shadow-inner">
            {['today', 'week', 'month', 'all'].map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`relative px-6 py-3 rounded-xl text-sm font-bold capitalize transition-all duration-300 z-10 ${
                  dateRange === range ? 'text-blue-700' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {dateRange === range && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-slate-200/50"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                {range}
              </button>
            ))}
          </div>
        </motion.div>

        {/* 4 Premium Summary Cards - STRICTLY ONE LINE md:grid-cols-4 lg:grid-cols-4 */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-2xl p-7 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(14,165,233,0.08)] hover:-translate-y-1 transition-all duration-500 flex items-center justify-between group overflow-hidden relative">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-sky-400/5 rounded-full blur-3xl group-hover:bg-sky-400/10 transition-colors duration-500"></div>
            <div className="flex flex-col relative z-10">
              <div className="text-xs font-black tracking-widest text-sky-600 mb-2 uppercase flex items-center gap-2">
                <Clock className="w-4 h-4" /> Deep Work
              </div>
              <div className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter">{formatTime(animatedFocusTime)}</div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-2xl p-7 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.08)] hover:-translate-y-1 transition-all duration-500 flex items-center justify-between group overflow-hidden relative">
             <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-400/5 rounded-full blur-3xl group-hover:bg-emerald-400/10 transition-colors duration-500"></div>
            <div className="flex flex-col relative z-10">
              <div className="text-xs font-black tracking-widest text-emerald-600 mb-2 uppercase flex items-center gap-2">
                <Activity className="w-4 h-4" /> Quality
              </div>
              <div className="flex items-baseline gap-1">
                <div className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter">{animatedScore}</div>
                <span className="text-sm lg:text-base font-bold text-emerald-500">pts</span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-2xl p-7 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(59,130,246,0.08)] hover:-translate-y-1 transition-all duration-500 flex items-center justify-between group overflow-hidden relative">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-400/5 rounded-full blur-3xl group-hover:bg-blue-400/10 transition-colors duration-500"></div>
            <div className="flex flex-col relative z-10">
              <div className="text-xs font-black tracking-widest text-blue-600 mb-2 uppercase flex items-center gap-2">
                <Zap className="w-4 h-4" /> Sessions
              </div>
              <div className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter">{animatedSessionCount}</div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-2xl p-7 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(245,158,11,0.08)] hover:-translate-y-1 transition-all duration-500 flex items-center justify-between group overflow-hidden relative">
             <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl group-hover:bg-amber-400/10 transition-colors duration-500"></div>
            <div className="flex flex-col relative z-10">
               <div className="text-xs font-black tracking-widest text-amber-500 mb-2 uppercase flex items-center gap-2">
                <Flame className="w-4 h-4" /> Peak Streak
              </div>
              <div className="flex items-baseline gap-1">
                <div className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter">{animatedStreak}</div>
                <span className="text-sm lg:text-base font-bold text-amber-500">days</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* 2 Massive Charts */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <motion.div variants={itemVariants} className="p-8 sm:p-10 bg-white/70 backdrop-blur-3xl border border-white shadow-[0_8px_40px_rgb(0,0,0,0.03)] rounded-[2.5rem] hover:shadow-[0_20px_60px_rgba(14,165,233,0.06)] transition-shadow duration-500 flex flex-col">
            <div className="flex items-start justify-between mb-10 w-full">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">Focus Trajectory</h2>
                <p className="text-sm sm:text-base font-medium text-slate-500">Daily score fluctuations</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-sky-400 to-blue-600 rounded-[1.2rem] flex items-center justify-center shadow-xl shadow-sky-500/20 shrink-0">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="h-[400px] w-full relative -ml-2">
              <Line data={trendLineData} options={lineChartOptions} />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="p-8 sm:p-10 bg-white/70 backdrop-blur-3xl border border-white shadow-[0_8px_40px_rgb(0,0,0,0.03)] rounded-[2.5rem] hover:shadow-[0_20px_60px_rgba(14,165,233,0.06)] transition-shadow duration-500 flex flex-col">
            <div className="flex items-start justify-between mb-10 w-full">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">Output Volumes</h2>
                <p className="text-sm sm:text-base font-medium text-slate-500">Deep work intervals vs distractions</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-900 rounded-[1.2rem] flex items-center justify-center shadow-xl shadow-slate-900/20 shrink-0">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="h-[400px] w-full relative -ml-2">
              <Bar data={stackedBarData} options={barChartOptions} />
            </div>
          </motion.div>
        </motion.div>

        {/* Categories & Heatmap */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div variants={itemVariants} className="lg:col-span-1 p-8 sm:p-10 bg-white/70 backdrop-blur-3xl border border-white shadow-[0_8px_40px_rgb(0,0,0,0.03)] rounded-[2.5rem] flex flex-col hover:shadow-[0_20px_60px_rgba(14,165,233,0.06)] transition-shadow duration-500">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Tags</h2>
            </div>
            <div className="flex-1 flex items-center justify-center relative">
              {Object.keys(subjectBreakdown).length > 0 ? (
                <div className="h-[320px] w-full relative mt-4">
                   <Doughnut data={donutData} options={donutOptions} />
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-2">
                      <span className="text-6xl font-black text-slate-900 tracking-tighter">{Object.keys(subjectBreakdown).length}</span>
                      <span className="text-sm font-bold text-sky-500 uppercase tracking-widest mt-1">Found</span>
                   </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 gap-4 opacity-60">
                  <PieChart className="w-16 h-16" />
                  <span className="text-base font-bold">Uncategorized</span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-2 p-8 sm:p-10 bg-white/70 backdrop-blur-3xl border border-white shadow-[0_8px_40px_rgb(0,0,0,0.03)] rounded-[2.5rem] hover:shadow-[0_20px_60px_rgba(14,165,233,0.06)] transition-shadow duration-500">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">Vulnerability Map</h2>
                <p className="text-base font-medium text-slate-500">Hourly distraction frequency</p>
              </div>
              {highestRisk.count > 0 && (
                <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 px-5 py-3 rounded-2xl text-rose-700 font-bold text-sm shadow-sm self-start">
                  <ShieldAlert className="w-5 h-5" />
                  <span>Risk at {highestRiskText}</span>
                </div>
              )}
            </div>

            <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              <div className="min-w-max" style={{ display: 'grid', gridTemplateColumns: 'auto repeat(24, minmax(32px, 1fr))', gap: '8px' }}>
                <div className="col-span-1"></div>
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="text-[11px] font-bold text-slate-400 text-center">{i}h</div>
                ))}

                {dayNames.map((day, dayIdx) => (
                  <React.Fragment key={day}>
                    <div className="text-[13px] font-black text-slate-600 flex items-center pr-6 tracking-wide">{day}</div>
                    {Array.from({ length: 24 }, (_, hourIdx) => {
                      const count = heatmapData[dayIdx][hourIdx];
                      const intensity = maxDistractions > 0 ? count / maxDistractions : 0;

                      let cellColor = 'bg-slate-100/50 border-slate-200/50';
                      if (count > 0) {
                        if (intensity < 0.3) cellColor = 'bg-rose-200 border-rose-300';
                        else if (intensity < 0.6) cellColor = 'bg-rose-400 border-rose-500';
                        else if (intensity < 0.9) cellColor = 'bg-rose-500 border-rose-600 shadow-md shadow-rose-500/20';
                        else cellColor = 'bg-rose-600 border-rose-700 shadow-lg shadow-rose-600/30';
                      }

                      return (
                        <motion.div
                          whileHover={{ scale: 1.4, zIndex: 10, borderRadius: '8px' }}
                          key={hourIdx}
                          className={`w-full aspect-square min-w-[32px] rounded-[10px] border transition-colors cursor-pointer flex items-center justify-center ${cellColor}`}
                          title={`${day} ${hourIdx}:00 - ${count} interruptions`}
                        >
                           {count > 0 && intensity >= 0.8 && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                        </motion.div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Infinite Ledger */}
        <motion.div variants={itemVariants} className="p-8 sm:p-10 bg-white/70 backdrop-blur-3xl border border-white shadow-[0_8px_40px_rgb(0,0,0,0.03)] rounded-[2.5rem]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-5">
               <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[1.2rem] flex items-center justify-center shadow-xl shadow-indigo-500/20">
                <History className="w-8 h-8 text-white" />
              </div>
              <div>
                 <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Session Archives</h2>
                 <p className="text-base font-medium text-slate-500 mt-1">Historical productivity logs</p>
              </div>
            </div>
            <div className="px-5 py-2.5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold rounded-xl text-sm shadow-sm self-start sm:self-auto">
              {filteredSessions.length} Total Sessions
            </div>
          </div>

          {filteredSessions.length > 0 ? (
            <div className="space-y-6">
              {Object.entries(
                filteredSessions.slice().reverse().reduce((acc, session) => {
                  const d = new Date(session.startTime);
                  const dateKey = d.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' });
                  if (!acc[dateKey]) acc[dateKey] = [];
                  acc[dateKey].push(session);
                  return acc;
                }, {})
              ).map(([dateKey, daySessions]) => (
                <div key={dateKey} className="space-y-3">
                  <button 
                    onClick={() => setExpandedDates(prev => ({ ...prev, [dateKey]: !prev[dateKey] }))}
                    className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 rounded-[1.5rem] transition-colors border border-slate-200 shadow-sm"
                  >
                    <span className="text-lg font-black text-slate-800 tracking-tight">{dateKey}</span>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${expandedDates[dateKey] ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-slate-500 shadow-sm'}`}>
                      {expandedDates[dateKey] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {expandedDates[dateKey] && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }} 
                        className="space-y-4 overflow-hidden pt-1"
                      >
              {daySessions.map((session, idx) => {
                const totalMins = (session.focusMinutes || 0) + (session.distractionMinutes || 0);
                const scoreColor = session.finalScore >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                                   session.finalScore >= 60 ? 'text-amber-700 bg-amber-50 border-amber-200' :
                                   'text-rose-700 bg-rose-50 border-rose-200';

                return (
                <motion.div layout key={session.id || idx} className="rounded-[1.5rem] border border-slate-200/60 bg-white/80 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group">
                  <button
                    onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                    className="w-full p-6 flex flex-wrap sm:flex-nowrap items-center gap-6 text-left hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="w-16 text-center shrink-0 border-r border-slate-100 pr-6">
                       <span className="block text-2xl font-black text-slate-900 tracking-tighter leading-none mb-1">{new Date(session.startTime).getDate()}</span>
                       <span className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">{new Date(session.startTime).toLocaleString('default', { month: 'short' })}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-black text-slate-900 text-xl truncate mb-2 group-hover:text-blue-600 transition-colors">
                        {session.subject || 'Deep Session'}
                      </div>
                      <div className="flex items-center gap-5 text-sm font-bold text-slate-500">
                        <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> {formatTime(totalMins)}</span>
                        <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-500" /> {session.distractionCount || 0} alerts</span>   
                      </div>
                    </div>

                    <div className="hidden md:flex flex-col items-end px-6">
                      <span className={`px-5 py-2 rounded-xl text-sm font-black border tracking-wide shadow-sm ${scoreColor}`}>
                        {session.finalScore} PTS
                      </span>
                    </div>

                    <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center transition-all duration-300 shrink-0 ${expandedSession === session.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-700'}`}>
                      {expandedSession === session.id ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedSession === session.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="origin-top border-t border-slate-100">
                        <div className="p-8 bg-slate-50/50 backdrop-blur-sm">
                          <div className="flex flex-col lg:flex-row gap-10">       
                              <div className="flex-1">
                                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> Integrity Matrix
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {Array.from({ length: Math.min(60, session.pomodoroLength || Math.min(25, totalMins)) }, (_, i) => {
                                      const r = Math.random();
                                      let c = 'bg-emerald-400 shadow-emerald-400/20';
                                      if(r > 0.85) c = 'bg-rose-500 shadow-rose-500/20';
                                      else if(r > 0.7) c = 'bg-amber-400 shadow-amber-400/20';
                                      return (
                                        <motion.div whileHover={{ scale: 1.5 }} key={i} className={`w-5 h-5 rounded-md shadow-sm ${c}`} title={`Minute ${i + 1}`} />
                                      );
                                    })}
                                  </div>
                              </div>
                              <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm lg:w-72 flex flex-col justify-center space-y-6">
                                  <div>
                                      <span className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Output Purity</span>
                                      <span className="text-4xl font-black text-slate-900 tracking-tighter">
                                          {session.focusMinutes && totalMins > 0 ? Math.round((session.focusMinutes/totalMins)*100) : 0}%
                                      </span>
                                  </div>
                                  <div className="h-px w-full bg-slate-100"></div>
                                  <div>
                                      <span className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Session State</span>
                                      <span className={`text-lg font-black tracking-tight ${session.contractPassed ? 'text-emerald-600' : session.contractPassed === false ? 'text-rose-600' : 'text-slate-500'}`}>
                                        {session.contractPassed ? 'Successfully Honored' : session.contractPassed === false ? 'Violated' : 'Unsigned'}
                                      </span>
                                  </div>
                              </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )})}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white/50 backdrop-blur-md border-[3px] border-dashed border-slate-200 rounded-[2.5rem]">
              <div className="w-24 h-24 bg-white rounded-[1.5rem] flex items-center justify-center shadow-sm border border-slate-100 mb-8">
                <Sparkles className="w-12 h-12 text-sky-400" />
              </div>
              <h3 className="text-slate-900 font-black text-2xl tracking-tight mb-3">No Data Yet</h3>
              <p className="text-slate-500 font-medium text-lg max-w-md">
                Your neural network visualizers are idle. Initiate deep work to synthesize data points.
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Analytics;
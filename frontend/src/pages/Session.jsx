import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, StopCircle, Volume2, VolumeX, Shield, AlertTriangle, ArrowRight, Activity, Target } from 'lucide-react';
import { monitoringEngine } from '../services/monitoringEngine';
import { scoreCalculator } from '../services/focusScore';
import { soundEngine } from '../services/soundEngine';

// Animations
const pageVariants = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.3 } }
};

// Light Mode Card
const cardClasses = "bg-white border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-3xl text-slate-800 relative z-10";

const Session = () => {
  const navigate = useNavigate();
  
  // Session states
  const [sessionState, setSessionState] = useState('pre-session');
  const [currentStep, setCurrentStep] = useState(1);
  
  // Pre-session data
  const [readinessData, setReadinessData] = useState({ rested: 3, motivated: 3, hoursSinceBreak: 2 });
  const [readinessScore, setReadinessScore] = useState(0);
  const [contractData, setContractData] = useState({ goal: '', email: '', partnerEmail: '', threshold: 70, enabled: false });
  const [sessionConfig, setSessionConfig] = useState({ subject: '', pomodoroLength: 25, breakLength: 5 });
  
  // Active session data
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [focusScore, setFocusScore] = useState(100);
  const [eventLog, setEventLog] = useState([]);
  const [interventionLevel, setInterventionLevel] = useState(0);
  const [tabHiddenAt, setTabHiddenAt] = useState(null);
  
  // Audio state
  const [soundMode, setSoundMode] = useState('silent');
  const [volume, setVolume] = useState(0.5);
  
  // Break state
  const [breakTimeRemaining, setBreakTimeRemaining] = useState(0);
  const [isBreakAlarmPlaying, setIsBreakAlarmPlaying] = useState(false);
  
  // Session summary data
  const [summaryData, setSummaryData] = useState(null);
  
  // Refs
  const timerRef = useRef(null);
  const sessionStartTime = useRef(null);

  // Set up Sound Engine
  useEffect(() => {
    soundEngine.init();
    if (soundMode !== 'silent' && isRunning && sessionState === 'active') {
      soundEngine.resumeContext().then(() => {
        soundEngine.play(soundMode);
      });
    } else {
      soundEngine.stop();
    }
    
    return () => {
      soundEngine.stop();
    };
  }, [soundMode, isRunning, sessionState]);

  useEffect(() => {
    soundEngine.setVolume(volume);
  }, [volume]);
  
  // Calculate readiness score
  useEffect(() => {
    const { rested, motivated, hoursSinceBreak } = readinessData;
    const breakPenalty = Math.max(0, hoursSinceBreak - 2) * 5;
    const score = Math.max(0, Math.min(100, (rested * 10) + (motivated * 10) + 30 - breakPenalty));
    setReadinessScore(score);
  }, [readinessData]);

  // Break Timer Logic
  useEffect(() => {
    let interval = null;
    if (sessionState === 'break' && breakTimeRemaining > 0) {
      interval = setInterval(() => {
        setBreakTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            soundEngine.playBreakAlarm();
            setIsBreakAlarmPlaying(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionState, breakTimeRemaining]);
  
  const startSession = () => {
    const pomodoroSeconds = sessionConfig.pomodoroLength * 60;
    setTimeRemaining(pomodoroSeconds);
    setTotalTime(pomodoroSeconds);
    setIsRunning(true);
    setSessionState('active');
    sessionStartTime.current = Date.now();
    
    monitoringEngine.start({ inactivityThreshold: 60, interventionStrictness: 'standard' });
    scoreCalculator.reset();
    setFocusScore(100);
    
    monitoringEngine.on('TabHidden', () => {
      setTabHiddenAt(Date.now());
      addEventToLog('Tab switch detected', 'warning');
      const result = scoreCalculator.applyTabSwitchPenalty();
      setFocusScore(result.newScore);
      monitoringEngine.triggerTabSwitchIntervention();
    });
    
    monitoringEngine.on('TabReturned', () => {
      if (tabHiddenAt) {
        const awayTime = (Date.now() - tabHiddenAt) / 1000;
        if (awayTime < 30) {
          const result = scoreCalculator.applyRecoveryBonus();
          setFocusScore(result.newScore);
          addEventToLog('Returned quickly! +2 bonus', 'success');
        } else {
          addEventToLog('Returned to focus', 'info');
        }
        setTabHiddenAt(null);
      }
    });
    
    monitoringEngine.on('InterventionLevelChange', (data) => {
      setInterventionLevel(data.newLevel);
      if (data.newLevel > 0) {
        const result = scoreCalculator.applyInterventionPenalty(data.newLevel);
        setFocusScore(result.newScore);
        addEventToLog(`Level ${data.newLevel} intervention triggered`, 'danger');
      } else {
        addEventToLog('Intervention cleared', 'success');
      }
    });
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          endSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const addEventToLog = (message, type = 'info') => {
    const event = { time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}), message, type };
    setEventLog(prev => [event, ...prev].slice(0, 10));
  };
  
  const endSession = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    monitoringEngine.stop();
    const stats = monitoringEngine.getStats();
    const events = monitoringEngine.getEventLog();
    
    const duration = Math.floor((Date.now() - sessionStartTime.current) / 1000 / 60);
    const distractionCount = stats.tabSwitches + stats.interventions.level1 + stats.interventions.level2 + stats.interventions.level3;
    const finalScore = scoreCalculator.getScore();
    
    const summary = {
      subject: sessionConfig.subject || 'Study Session',
      duration,
      finalScore,
      distractionCount,
      tabSwitches: stats.tabSwitches,
      interventions: stats.interventions,
      contractPassed: contractData.enabled ? finalScore >= contractData.threshold : null,
      contractThreshold: contractData.threshold,
      events
    };
    
    setSummaryData(summary);
    
    const sessionRecord = {
      id: Date.now().toString(),
      subject: sessionConfig.subject || 'Study Session',
      startTime: sessionStartTime.current,
      endTime: Date.now(),
      finalScore,
      focusMinutes: Math.floor(duration * (finalScore / 100)),
      distractionMinutes: Math.floor(duration * ((100 - finalScore) / 100)),
      distractionCount,
      pomodoroLength: sessionConfig.pomodoroLength,
      contractGoal: contractData.goal,
      contractThreshold: contractData.threshold,
      contractPassed: contractData.enabled ? finalScore >= contractData.threshold : null,
      readinessScore,
      events
    };
    
    const existingSessions = JSON.parse(localStorage.getItem('fs_sessions') || '[]');
    existingSessions.push(sessionRecord);
    localStorage.setItem('fs_sessions', JSON.stringify(existingSessions));
    
    updateStreak();
    checkAchievements(sessionRecord);
    
    // Auto-stop music when timer finishes
    if (soundMode !== 'silent') {
      soundEngine.stop();
    }
    
    if (sessionConfig.breakLength > 0) {
      setBreakTimeRemaining(sessionConfig.breakLength * 60);
      setSessionState('break');
    } else {
      setSessionState('summary');
    }
  };
  
  const updateStreak = () => {
    const streak = JSON.parse(localStorage.getItem('fs_streak') || '{"current":0,"longest":0}');
    const today = new Date().toDateString();
    const lastSessionDate = streak.lastSessionDate ? new Date(streak.lastSessionDate).toDateString() : null;
    
    if (lastSessionDate === today) return;
    
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastSessionDate === yesterday || !lastSessionDate) {
      streak.current += 1;
      streak.longest = Math.max(streak.longest, streak.current);
    } else {
      streak.current = 1;
    }
    
    streak.lastSessionDate = new Date().toISOString();
    localStorage.setItem('fs_streak', JSON.stringify(streak));
  };
  
  const checkAchievements = (session) => {
    const achievements = JSON.parse(localStorage.getItem('fs_achievements') || '[]');
    const newAchievements = [];
    
    if (!achievements.includes('first-session')) newAchievements.push('first-session');
    if (session.finalScore === 100 && !achievements.includes('perfect-score')) newAchievements.push('perfect-score');
    
    if (newAchievements.length > 0) {
      localStorage.setItem('fs_achievements', JSON.stringify([...achievements, ...newAchievements]));
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getReadinessBanner = (score) => {
    if (score >= 80) return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', shadow: '', msg: 'Optimal Readiness. A 35-45 min session is perfect.' };
    if (score >= 50) return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', shadow: '', msg: 'Moderate Readiness. Try a standard 25 min break.' };
    return { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', shadow: '', msg: 'Low Energy. Keep it short, about 15 mins.' };
  };

  const readinessMeta = getReadinessBanner(readinessScore);

  return (
    <div className="relative min-h-screen bg-[#F0F9FF] font-sans text-slate-800 overflow-hidden">
      
      {/* BACKGROUND GLOW EFFECTS LIGHT MODE */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-200/40 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-sky-200/40 blur-[120px] pointer-events-none"></div>

      <InterventionOverlay level={interventionLevel} onDismiss={() => setInterventionLevel(0)} />

      <AnimatePresence mode="wait">
        
        {/* ======================================================== */}
        {/* PRE-SESSION SETUP */}
        {/* ======================================================== */}
        {sessionState === 'pre-session' && (
          <motion.div 
            key="pre-session"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center justify-center min-h-screen p-4 sm:p-8 relative z-10"
          >
            <div className={`max-w-2xl w-full p-8 sm:p-10 ${cardClasses}`}>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 relative">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                  <Activity className="w-6 h-6 text-blue-500" />
                  Session Protocol <span className="px-2 py-0.5 ml-2 bg-blue-100 text-blue-700 text-[10px] uppercase tracking-widest rounded-full font-black">V2</span>
                </h2>
                <button onClick={() => navigate('/dashboard')} className="p-2 bg-slate-50 rounded-full hover:bg-slate-200 hover:text-slate-900 transition-all border border-slate-200 text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center mb-10 space-x-3 bg-slate-50 p-3 rounded-full border border-slate-200 shadow-inner">
                {[1, 2, 3].map((step, idx) => (
                  <React.Fragment key={step}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                      currentStep === step ? 'bg-blue-600 text-white shadow-md border border-blue-500' 
                      : currentStep > step ? 'bg-white text-blue-500 shadow-sm border border-blue-200' 
                      : 'bg-white text-slate-400 border border-slate-200'
                    }`}>
                      {currentStep > step ? <Shield className="w-5 h-5" /> : step}
                    </div>
                    {idx < 2 && <div className={`h-1 w-12 sm:w-20 rounded-full transition-all duration-500 ${currentStep > step ? 'bg-blue-500 shadow-sm' : 'bg-slate-200'}`}></div>}
                  </React.Fragment>
                ))}
              </div>

              {/* Step 1: Readiness */}
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div key="s1" initial={{opacity:0, x:10}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-10}} className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">Condition Check</h3>
                      <p className="text-sm font-medium text-slate-500">Provide accurate diagnostics to correctly gauge target duration.</p>
                    </div>

                    <div className="space-y-5">
                      <div className="p-5 bg-white border border-slate-200 rounded-2xl relative overflow-hidden group hover:border-emerald-300 transition-colors shadow-sm">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                        <label className="block text-sm font-bold text-slate-700 mb-4">Energy Level (1-5)</label>
                        <input type="range" min="1" max="5" value={readinessData.rested} onChange={(e) => setReadinessData(prev => ({ ...prev, rested: parseInt(e.target.value) }))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                        <div className="flex justify-between text-xs font-semibold text-slate-400 mt-4 uppercase tracking-wider">
                          <span>Depleted</span><span className="text-emerald-700 font-bold px-3 py-1 bg-emerald-50 rounded-full">{readinessData.rested}</span><span>Optimal</span>
                        </div>
                      </div>

                      <div className="p-5 bg-white border border-slate-200 rounded-2xl relative overflow-hidden group hover:border-blue-300 transition-colors shadow-sm">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                        <label className="block text-sm font-bold text-slate-700 mb-4">Motivation Vector (1-5)</label>
                        <input type="range" min="1" max="5" value={readinessData.motivated} onChange={(e) => setReadinessData(prev => ({ ...prev, motivated: parseInt(e.target.value) }))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                        <div className="flex justify-between text-xs font-semibold text-slate-400 mt-4 uppercase tracking-wider">
                          <span>Unwilling</span><span className="text-blue-700 font-bold px-3 py-1 bg-blue-50 rounded-full">{readinessData.motivated}</span><span>Driven</span>
                        </div>
                      </div>

                      <div className="p-5 bg-white border border-slate-200 rounded-2xl relative overflow-hidden group hover:border-purple-300 transition-colors shadow-sm">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
                        <label className="block text-sm font-bold text-slate-700 mb-4">Fatigue Accumulation</label>
                        <input type="range" min="0" max="8" value={readinessData.hoursSinceBreak} onChange={(e) => setReadinessData(prev => ({ ...prev, hoursSinceBreak: parseInt(e.target.value) }))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                        <div className="flex justify-between text-xs font-semibold text-slate-400 mt-4 uppercase tracking-wider">
                          <span>0h</span><span className="text-purple-700 font-bold px-3 py-1 bg-purple-50 rounded-full">{readinessData.hoursSinceBreak}h</span><span>8h+</span>
                        </div>
                      </div>
                    </div>

                    <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${readinessMeta.bg} ${readinessMeta.border}`}>
                      <div>
                        <span className={`block font-bold text-lg mb-1 ${readinessMeta.text}`}>Calculated Variance: {readinessScore}/100</span>
                        <p className={`text-xs font-medium ${readinessMeta.text} opacity-90 uppercase tracking-wide`}>{readinessMeta.msg}</p>
                      </div>
                    </div>

                    <button onClick={() => setCurrentStep(2)} className="w-full mt-4 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-[0_4px_14px_rgba(37,99,235,0.3)] transition-all flex justify-center items-center gap-2">
                      Proceed <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                {/* Step 2: Contract */}
                {currentStep === 2 && (
                  <motion.div key="s2" initial={{opacity:0, x:10}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-10}} className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">Accountability Contract</h3>
                      <p className="text-sm font-medium text-slate-500">Enable an automated failure deterrent.</p>
                    </div>

                    <div className={`p-6 border rounded-2xl flex items-center justify-between transition-all ${contractData.enabled ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="font-bold text-slate-800 text-sm flex items-center gap-3">
                        <Shield className={`w-5 h-5 ${contractData.enabled ? 'text-blue-600' : 'text-slate-400'}`} />
                        Enforce Strict Accountability
                      </span>
                      <button onClick={() => setContractData(prev => ({ ...prev, enabled: !prev.enabled }))} className={`w-14 h-7 rounded-full p-1 transition-all duration-300 ${contractData.enabled ? 'bg-blue-600 shadow-sm' : 'bg-slate-300'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${contractData.enabled ? 'translate-x-7' : 'translate-x-0'}`}></div>
                      </button>
                    </div>

                    <AnimatePresence>
                    {contractData.enabled && (
                      <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="space-y-5 overflow-hidden">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Intent Statement</label>
                          <input type="text" placeholder="e.g., Complete Chapter 5 exercises" value={contractData.goal} onChange={(e) => setContractData(prev => ({ ...prev, goal: e.target.value }))}
                            className="w-full px-4 py-4 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-medium text-slate-900 placeholder-slate-400" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Primary Node (You)</label>
                            <input type="email" placeholder="you@company.com" value={contractData.email} onChange={(e) => setContractData(prev => ({ ...prev, email: e.target.value }))}
                              className="w-full px-4 py-4 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-medium text-slate-900 placeholder-slate-400" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Reporting Node (Partner)</label>
                            <input type="email" placeholder="partner@url.com" value={contractData.partnerEmail} onChange={(e) => setContractData(prev => ({ ...prev, partnerEmail: e.target.value }))}
                              className="w-full px-4 py-4 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-medium text-slate-900 placeholder-slate-400" />
                          </div>
                        </div>
                        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl mt-2">
                          <label className="block text-sm font-bold text-slate-800 mb-4">Minimum Acceptance Score</label>
                          <input type="range" min="50" max="95" step="5" value={contractData.threshold} onChange={(e) => setContractData(prev => ({ ...prev, threshold: parseInt(e.target.value) }))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                          <div className="flex justify-between text-xs font-bold text-slate-500 mt-4">
                            <span>50</span><span className="text-blue-700 text-sm px-3 py-1 bg-blue-100/50 rounded-full">{contractData.threshold} PTS</span><span>95</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    </AnimatePresence>

                    <div className="flex space-x-3 pt-3">
                      <button onClick={() => setCurrentStep(1)} className="px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors">
                        Back
                      </button>
                      <button onClick={() => setCurrentStep(3)} className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-[0_4px_14px_rgba(37,99,235,0.3)] transition-all flex justify-center items-center gap-2">
                        Configure <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Config */}
                {currentStep === 3 && (
                  <motion.div key="s3" initial={{opacity:0, x:10}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-10}} className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">Final Configuration</h3>
                      <p className="text-sm font-medium text-slate-500">Target locked. Set timer bounds.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Target Subject</label>
                      <input type="text" placeholder="e.g. Architecture Documentation" value={sessionConfig.subject} onChange={(e) => setSessionConfig(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full px-4 py-4 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] text-sm font-bold text-slate-900 placeholder-slate-400 transition-all" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide">Execution Baseline (Duration)</label>
                      <div className="grid grid-cols-4 gap-3">
                        {[15, 25, 35, 45].map(duration => (
                          <button key={duration} onClick={() => setSessionConfig(prev => ({ ...prev, pomodoroLength: duration }))}
                            className={`py-3 rounded-xl font-bold transition-all border text-sm ${
                              sessionConfig.pomodoroLength === duration ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {duration}m
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide">Rest Interval</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[5, 10, 15].map(duration => (
                          <button key={duration} onClick={() => setSessionConfig(prev => ({ ...prev, breakLength: duration }))}
                            className={`py-3 rounded-xl font-bold transition-all border text-sm ${
                              sessionConfig.breakLength === duration ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {duration}m
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-5 border-t border-slate-100">
                      <button onClick={() => setCurrentStep(2)} className="px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors">
                        Back
                      </button>
                      <button onClick={startSession} className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 shadow-[0_4px_14px_rgba(37,99,235,0.3)] transition-all flex justify-center items-center gap-3 text-lg tracking-wide uppercase">
                        <Play className="w-5 h-5 fill-white" /> Initiate Protocol
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* ACTIVE SESSION */}
        {/* ======================================================== */}
        {sessionState === 'active' && (
          <motion.div 
            key="active"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } }}
            exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 relative z-10 w-full"
            >
              {/* Top Score Pill */}
              <div className="absolute top-8 right-8 z-20 hidden md:block">
                <div className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl border bg-white shadow-sm ${
                  focusScore >= 80 ? 'border-emerald-200 text-emerald-600' : 
                  focusScore >= 60 ? 'border-blue-200 text-blue-600' : 'border-rose-200 text-rose-600'
                }`}>
                  <Target className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider opacity-70">Matrix Output</span>
                    <span className="text-2xl font-black leading-none">{focusScore}</span>
                  </div>
                </div>
              </div>

              {/* Main Content Layout */}
              <div className="w-full max-w-7xl mx-auto flex flex-col xl:flex-row items-center justify-center xl:items-end gap-6 sm:gap-8 mt-12 md:mt-0">
                
                {/* Event Log (Left) */}
                <div className={`w-full xl:w-80 h-[300px] xl:h-auto xl:max-h-[400px] overflow-y-auto p-5 order-2 xl:order-1 ${cardClasses}`}>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">System Log</h3>
                  <div className="space-y-3">
                    {eventLog.length === 0 ? <div className="text-sm text-slate-400 font-medium italic">Awaiting events...</div> : null}
                    <AnimatePresence>
                      {eventLog.map((event, idx) => (
                        <motion.div initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} key={idx} className={`p-3 rounded-xl border text-xs font-medium ${
                          event.type === 'danger' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                          event.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                          event.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                          'bg-slate-50 border-slate-100 text-slate-600'
                        }`}>
                          <span className="font-bold opacity-60 mr-2">{event.time}</span> {event.message}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Main Timer Display (Center) */}
                <div className={`relative p-8 sm:p-12 md:p-20 flex-1 flex flex-col items-center justify-center w-full max-w-2xl order-1 xl:order-2 ${cardClasses}`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent rounded-3xl pointer-events-none"></div>

                    <div className="relative mb-8 md:mb-10 scale-90 md:scale-100 origin-center">
                       <svg width="300" height="300" className="transform -rotate-90 filter drop-shadow-md">
                          <circle cx="150" cy="150" r="140" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                          <circle cx="150" cy="150" r="140" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 140}
                            strokeDashoffset={(2 * Math.PI * 140) - (((totalTime - timeRemaining) / totalTime) * 100 / 100) * (2 * Math.PI * 140)}
                            className="transition-all duration-1000 ease-linear" 
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#2563eb" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <div className="text-5xl md:text-7xl font-black tracking-tighter text-slate-800 mb-2">{formatTime(timeRemaining)}</div>
                          <div className="text-xs font-bold text-white bg-blue-600 px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">{sessionConfig.pomodoroLength}m Vector</div>
                        </div>
                    </div>
    
                    <div className="text-center mb-8 md:mb-10 px-4 md:px-6 relative z-10 w-full">
                      <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight truncate">{sessionConfig.subject || 'Deep Execution'}</h2>
                      <p className="text-xs md:text-sm font-bold text-blue-500 mt-2 md:mt-3 uppercase tracking-widest">System Active & Nominal</p>
                    </div>

                    <button onClick={endSession} className="px-6 md:px-8 py-3 md:py-4 bg-white text-slate-500 border border-slate-200 rounded-xl font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all flex items-center space-x-3 w-full max-w-xs justify-center group relative z-10">
                      <StopCircle className="w-5 h-5 group-hover:fill-current" />
                      <span className="tracking-wide uppercase text-sm md:text-base">Terminate</span>
                    </button>
                </div>

                {/* Audio Panel (Right) */}
                <div className={`w-full xl:w-80 p-5 order-3 ${cardClasses}`}>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Focus Audio Library</h3>
                  
                  <div className="flex flex-col gap-2 mb-5">
                    {[
                      { id: 'silent', name: 'Silent / Disabled' },
                      { id: 'wizard', name: 'Wizard Fantasy' },
                      { id: 'nature_melody', name: 'Melody of Nature' },
                      { id: 'piano', name: 'Simple Piano' },
                      { id: 'hiphop', name: 'No Sleep HipHop' },
                      { id: 'epic', name: 'Epic Focus' },
                      { id: 'forgiveness', name: 'Plea For Forgiveness' },
                      { id: 'cinematic', name: 'Inspiring Cinematic' }
                    ].map(track => (
                      <button 
                        key={track.id} 
                        onClick={() => {
                          setSoundMode(track.id);
                          if(sessionState === 'active' && isRunning && track.id !== 'silent') {
                             soundEngine.play(track.id);
                          } else if (track.id === 'silent') {
                             soundEngine.stop();
                          }
                        }}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        soundMode === track.id 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}>
                        <span>{track.name}</span>
                        {soundMode === track.id && track.id !== 'silent' && isRunning && (
                          <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mt-auto">
                    <VolumeX className="w-4 h-4 text-slate-400" />
                    <input type="range" min="0" max="100" value={volume * 100} onChange={(e) => setVolume(parseFloat(e.target.value) / 100)}
                      className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    <Volume2 className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* BREAK SCREEN */}
          {/* ======================================================== */}
          {sessionState === 'break' && (
            <motion.div
              key="break"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex items-center justify-center min-h-[80vh] p-4 relative z-10"
            >
              <div className={`max-w-xl w-full p-10 text-center ${cardClasses} border-t-4 ${isBreakAlarmPlaying ? 'border-t-rose-500' : 'border-t-emerald-500'}`}>
                
                {isBreakAlarmPlaying ? (
                 <>
                  <div className="inline-flex items-center justify-center p-6 bg-rose-100 text-rose-600 rounded-full mb-6 animate-pulse">
                    <AlertTriangle className="w-10 h-10" />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Break Time is Over!</h2>
                  <p className="text-slate-500 text-lg mb-10">Time to review your session stats and get back to work.</p>
                  
                  <button 
                    onClick={() => {
                      soundEngine.stopBreakAlarm();
                      setIsBreakAlarmPlaying(false);
                      setSessionState('summary');
                    }}
                    className="w-full py-5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-xl transition-all shadow-lg hover:shadow-rose-600/30"
                  >
                    Stop Alarm & View Summary
                  </button>
                 </>
                ) : (
                 <>
                  <div className="inline-flex items-center justify-center p-6 bg-emerald-100 text-emerald-600 rounded-full mb-6 relative">
                    <span className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin opacity-20"></span>
                    <Play className="w-10 h-10 ml-1" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Rest & Recharge</h2>
                  <p className="text-slate-500 mb-8">Take a moment away from the screen.</p>
                  
                  <div className="text-7xl font-black text-slate-800 tracking-tighter tabular-nums mb-10 font-mono">
                    {Math.floor(breakTimeRemaining / 60).toString().padStart(2, '0')}:
                    {(breakTimeRemaining % 60).toString().padStart(2, '0')}
                  </div>

                  <button 
                    onClick={() => {
                      setSessionState('summary');
                    }}
                    className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl font-bold text-lg transition-all"
                  >
                    Skip Break & View Summary
                  </button>
                 </>
                )}
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* SUMMARY SCREEN */}
          {/* ======================================================== */}
          {sessionState === 'summary' && summaryData && (
            <motion.div 
              key="summary"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            className="flex items-center justify-center min-h-screen p-4 sm:p-8 relative z-10"
          >
            <div className={`max-w-4xl w-full p-8 sm:p-14 ${cardClasses} border-t-4 border-t-blue-500`}>
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center p-5 bg-blue-50 text-blue-600 rounded-full mb-6">
                  <Target className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3 uppercase">Protocol Concluded</h1>
                <p className="text-slate-500 font-medium tracking-wide">Session metrics safely recorded to master matrix.</p>
              </div>
              
              <div className="flex justify-center mb-12">
                <div className={`p-10 rounded-3xl border text-center shadow-sm min-w-[240px] bg-slate-50 ${
                  summaryData.finalScore >= 80 ? 'border-emerald-200 text-emerald-600' :
                  summaryData.finalScore >= 60 ? 'border-blue-200 text-blue-600' : 'border-rose-200 text-rose-600'
                }`}>
                  <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-3">Final Output Score</div>
                  <div className="text-8xl font-black drop-shadow-sm">{summaryData.finalScore}</div>
                </div>
              </div>
              
              {summaryData.contractPassed !== null && (
                <div className={`p-6 rounded-2xl border flex flex-col items-center text-center shadow-sm mb-10 ${
                  summaryData.contractPassed ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}>
                  <div className="text-xl font-black tracking-widest mb-1">{summaryData.contractPassed ? 'CONTRACT FULFILLED' : 'CONTRACT VIOLATED'}</div>
                  <div className="text-sm font-medium opacity-80 mb-4 tracking-wide">
                    Target: {summaryData.contractThreshold} · Achieved: {summaryData.finalScore}
                  </div>
                  {!summaryData.contractPassed && contractData.partnerEmail && (
                    <a href={`mailto:${contractData.partnerEmail}?subject=Log Action Required&body=Execution fallback. Target: "${contractData.goal}". Actual Matrix Score: ${summaryData.finalScore}/${summaryData.contractThreshold}.`}
                      className="inline-block px-6 py-3 bg-white text-rose-600 border border-rose-200 rounded-xl text-sm font-black tracking-wide hover:shadow-md transition-shadow uppercase">
                      Dispatch Penalty Notice {'->'}
                    </a>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                  <div className="text-3xl font-black text-slate-800 mb-2">{summaryData.duration}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Minutes</div>
                </div>
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                  <div className="text-3xl font-black text-slate-800 mb-2">{summaryData.distractionCount}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deviations</div>
                </div>
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                  <div className="text-3xl font-black text-slate-800 mb-2">{summaryData.tabSwitches}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Breaches</div>
                </div>
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                  <div className="text-3xl font-black text-slate-800 mb-2">{summaryData.interventions.level1 + summaryData.interventions.level2 + summaryData.interventions.level3}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interventions</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 border-t border-slate-100 pt-8">
                <button onClick={() => navigate('/analytics')} className="flex-1 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors uppercase tracking-wider text-sm">
                  View Master Matrix
                </button>
                <button onClick={() => { setSessionState('pre-session'); setCurrentStep(1); setEventLog([]); setInterventionLevel(0); }}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-black hover:bg-slate-800 transition-colors uppercase tracking-wider text-sm">
                  Initialize Next Cycle
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Light Mode Intervention Overlay
const InterventionOverlay = ({ level, onDismiss }) => {
  const [countdown, setCountdown] = useState(0);
  
  useEffect(() => {
    if (level === 0) return;
    const duration = level === 1 ? 5 : level === 2 ? 10 : 60;
    setCountdown(duration);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); if (level > 1) onDismiss(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [level]);
  
  if (level === 0) return null;
  
  if (level === 1) {
    return (
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md border border-amber-200 text-amber-600 py-4 px-6 rounded-2xl flex items-center justify-between gap-6 shadow-lg z-50">
        <span className="font-bold flex items-center gap-3 text-sm uppercase tracking-wide"><AlertTriangle className="w-5 h-5 text-amber-500"/> Trajectory Deviation Recorded.</span>
        <button onClick={onDismiss} className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-black hover:bg-amber-600 transition-colors uppercase tracking-widest">
          Acknowledge
        </button>
      </div>
    );
  }
  
  if (level === 2) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center max-w-sm w-full shadow-2xl">
          <div className="w-20 h-20 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto mb-8">
            <Shield className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Focus Shield Engaged</h2>
          <p className="text-sm text-slate-500 font-medium mb-10">Return to target application immediately.</p>
          <div className="text-6xl font-black text-slate-800 mb-4">{countdown}s</div>
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-[0.3em]">Awaiting Re-entry</p>
        </div>
      </div>
    );
  }
  
  if (level === 3) {
    return (
      <div className="fixed inset-0 bg-white/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="text-center max-w-sm w-full">
          <AlertTriangle className="w-20 h-20 text-rose-600 mx-auto mb-8 drop-shadow-md" />
          <h2 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tighter">System Locked</h2>
          <p className="text-lg text-slate-500 font-medium mb-12">Critical protocol deviation. Cool-down enforced.</p>
          <div className="text-8xl font-black text-rose-600 mb-8 tabular-nums">{countdown}</div>
          <p className="text-xs font-bold text-rose-500 uppercase tracking-[0.25em] mb-12">Mandatory Reboot Wait Phase</p>
          
          <button 
            disabled={countdown > 0} 
            onClick={onDismiss} 
            className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
              countdown === 0 ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            {countdown === 0 ? 'Disengage Lock' : 'Awaiting Clearance'}
          </button>
        </div>
      </div>
    );
  }
  return null;
};

export default Session;
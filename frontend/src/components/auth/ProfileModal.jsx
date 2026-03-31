import React from 'react';
import { motion } from 'framer-motion';
import { X, Flame, Trophy, Star, Zap, Clock, CalendarDays, Activity } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function ProfileModal({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-8 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen py-8 flex items-center justify-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="relative w-full max-w-4xl rounded-[32px] bg-[#F8FAFC] border-2 border-[#E2E8F0] shadow-2xl overflow-hidden"
        >
          {/* Top Banner Area */}
          <div className="relative bg-gradient-to-br from-[#93C5FD] to-[#3B82F6] p-8 md:p-10 pointer-events-none overflow-hidden">
             {/* Decorative circles */}
             <div className="absolute top-[-50%] right-[-10%] w-[400px] h-[400px] rounded-full border-[1px] border-white/20" />
             <div className="absolute top-[-30%] right-[-5%] w-[300px] h-[300px] rounded-full border-[1px] border-white/20" />
             <div className="absolute top-[-10%] right-[0%] w-[200px] h-[200px] rounded-full border-[1px] border-white/20" />
             
             <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 pointer-events-auto">
                {/* Avatar */}
                <div className="relative">
                  <div className="h-32 w-32 rounded-3xl bg-[#FDE68A] border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                    {/* Cute Face icon matching requested style */}
                    <div className="flex justify-center items-center h-full w-full bg-[#E0E7FF] text-[#0F172A] relative">
                       {/* simplified smiley */}
                       <div className="absolute top-10 flex gap-4">
                         <div className="w-4 h-4 bg-black rounded-full shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3)]"></div>
                         <div className="w-4 h-4 bg-black rounded-full shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3)]"></div>
                       </div>
                       <div className="absolute bottom-8 w-14 h-6 border-b-4 border-black rounded-b-full"></div>
                    </div>
                  </div>
                  <button className="absolute -bottom-2 -right-2 h-10 w-10 bg-white rounded-full flex items-center justify-center border-2 border-[#E2E8F0] shadow-sm hover:bg-slate-50 transition-colors">
                     <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </button>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left text-white mt-2">
                   <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                     <h1 className="text-4xl font-black">{user.name}</h1>
                     <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-[10px] font-black text-yellow-900 border border-yellow-200">PRO</span>
                   </div>
                   <p className="text-white/80 font-medium mb-5">Ready to crush your goals!</p>

                   <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                     <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                       <Flame size={16} className="text-orange-400 fill-orange-400" />
                       <span className="text-[13px] font-bold">7-DAY STREAK</span>
                     </div>
                     <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                       <Trophy size={16} className="text-yellow-400 fill-yellow-400" />
                       <span className="text-[13px] font-bold">LEVEL 5</span>
                     </div>
                     <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                       <Star size={16} className="text-yellow-400 fill-yellow-400" />
                       <span className="text-[13px] font-bold">3 BADGES</span>
                     </div>
                   </div>
                </div>

                {/* XP Progress Card */}
                <div className="md:w-[240px] bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 text-white flex flex-col justify-center">
                  <p className="text-[10px] font-black uppercase tracking-wider mb-2 text-white/80">XP PROGRESS</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-black">2,480</span>
                    <span className="text-[12px] font-bold text-white/80">XP</span>
                  </div>
                  <p className="text-[11px] font-medium text-white/70 mb-4">OF 3,000 XP TO Lvl 6</p>
                  
                  <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden mb-2">
                    <div className="bg-white h-full rounded-full" style={{ width: '82%' }} />
                  </div>
                  <p className="text-right text-[10px] font-bold text-white/90">82% THERE!</p>
                </div>
             </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur border border-white/30 transition-colors"
          >
            <X size={20} strokeWidth={2.5} className="text-white" />
          </button>

          {/* Bottom Content Area */}
          <div className="p-8 md:p-10 pointer-events-auto">
            
            <div className="flex items-center gap-2 mb-6">
              <Activity className="text-blue-500" size={20} />
              <h2 className="text-[16px] font-bold text-[#0F172A]">Weekly Overview</h2>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
               {/* Stat 1 */}
               <div className="bg-white rounded-3xl p-6 flex flex-col items-center justify-center border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                 <div className="w-14 h-14 rounded-full bg-yellow-50 border-4 border-yellow-400 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                   <Zap size={20} className="text-yellow-500 fill-yellow-500" />
                 </div>
                 <h3 className="text-2xl font-black text-[#0F172A]">11</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 mb-2">SESSIONS</p>
                 <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">FOCUS TIME</p>
               </div>

               {/* Stat 2 */}
               <div className="bg-white rounded-3xl p-6 flex flex-col items-center justify-center border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                 <div className="w-14 h-14 rounded-full bg-red-50 border-4 border-red-400 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(248,113,113,0.3)]">
                   <Flame size={20} className="text-red-500" />
                 </div>
                 <h3 className="text-2xl font-black text-[#0F172A]">240</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 mb-2">MINUTES</p>
                 <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">TOTAL TIME</p>
               </div>

               {/* Stat 3 */}
               <div className="bg-white rounded-3xl p-6 flex flex-col items-center justify-center border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                 <div className="w-14 h-14 rounded-full bg-emerald-50 border-4 border-emerald-400 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                   <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                 </div>
                 <h3 className="text-2xl font-black text-[#0F172A]">85%</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 mb-2">AVERAGE</p>
                 <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">FOCUS SCORE</p>
               </div>

               {/* Stat 4 */}
               <div className="bg-white rounded-3xl p-6 flex flex-col items-center justify-center border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                 <div className="w-14 h-14 rounded-full bg-indigo-50 border-4 border-indigo-400 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(129,140,248,0.3)]">
                   <Clock size={20} className="text-indigo-500" />
                 </div>
                 <h3 className="text-2xl font-black text-[#0F172A]">12</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 mb-2">HOURS</p>
                 <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">DEEP WORK</p>
               </div>
            </div>

            {/* Health Snapshot equivalent for Focus */}
            <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
               <div className="flex items-center gap-2 mb-6">
                 <Activity className="text-blue-500" size={20} />
                 <h2 className="text-[16px] font-bold text-[#0F172A]">Productivity Snapshot</h2>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Programming', 'Reading', 'Writing', 'Planning'].map((task, i) => (
                     <div key={i} className="flex flex-col items-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mb-3">
                           <CalendarDays size={14} />
                        </div>
                        <span className="text-[11px] font-bold text-[#0F172A]">{task}</span>
                        <span className="text-[10px] font-medium text-slate-500 mt-1">{Math.floor(Math.random() * 10) + 1} sessions</span>
                     </div>
                  ))}
               </div>
            </div>

            <div className="mt-10 flex justify-end">
               <button 
                 onClick={() => {
                   logout();
                   onClose();
                 }}
                 className="px-6 py-2 rounded-xl text-red-500 font-bold hover:bg-red-50 transition-colors"
               >
                 Log Out
               </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
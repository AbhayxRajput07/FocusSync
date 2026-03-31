import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-6"      
    >
      <nav className="flex w-full max-w-4xl items-center justify-between rounded-full border border-white/60 bg-white/40 px-2 py-2 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.02]">
        
        <div className="flex items-center gap-8 pl-4">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}       
            className="group flex items-center gap-2 text-left transition-opacity hover:opacity-70"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-300" />
            </div>
            <span className="text-[14px] font-semibold tracking-tight text-slate-900">FocusSync</span>
          </button>
          
          <div className="hidden md:flex items-center gap-7 text-[13px] font-medium text-slate-500">
            <button onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-slate-900 transition-colors">Architecture</button>
            <button onClick={() => window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})} className="hover:text-slate-900 transition-colors">Systems</button>
          </div>
        </div>

        <div className="flex items-center gap-2 pr-1">
          <button
            type="button"
            className="hidden sm:block rounded-full px-5 py-2.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-white/50 hover:text-slate-900"
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="relative overflow-hidden rounded-full bg-slate-900 px-5 py-2.5 text-[13px] font-medium text-white transition-all hover:scale-[1.02] active:scale-[0.98] hover:bg-slate-800 shadow-sm"
          >
            <span className="relative z-10">Access System</span>
          </button>
        </div>
      </nav>
    </motion.header>
  );
};

export default Navbar;

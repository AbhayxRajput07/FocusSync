import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function AuthModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const [mode, setMode] = useState('signup'); // 'signup' | 'login'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    if (mode === 'signup' && !name) return;

    // Temporary mock login
    login({
      name: mode === 'signup' ? name : (email.split('@')[0] || 'User'),
      email
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="relative w-full max-w-sm rounded-[32px] bg-white border border-[#E2E8F0] shadow-[12px_12px_0px_#0F172A] p-8 text-[#0F172A]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0F172A] hover:bg-slate-100 transition-colors"
        >
          <X size={16} strokeWidth={3} className="text-[#0F172A]" />
        </button>

        <div className="flex justify-center mb-4">
          {/* A flower/lotus icon but let's make it a focus sync icon (blue) */}
          <div className="h-10 w-10 text-[#3B82F6]">
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM6 4C7.1 4 8 4.9 8 6C8 7.1 7.1 8 6 8C4.9 8 4 7.1 4 6C4 4.9 4.9 4 6 4ZM18 4C19.1 4 20 4.9 20 6C20 7.1 19.1 8 18 8C16.9 8 16 7.1 16 6C16 4.9 16.9 4 18 4ZM4 10C5.1 10 6 10.9 6 12C6 13.1 5.1 14 4 14C2.9 14 2 13.1 2 12C2 10.9 2.9 10 4 10ZM20 10C21.1 10 22 10.9 22 12C22 13.1 21.1 14 20 14C18.9 14 18 13.1 18 12C18 10.9 18.9 10 20 10ZM12 18C13.1 18 14 18.9 14 20C14 21.1 13.1 22 12 22C10.9 22 10 21.1 10 20C10 18.9 10.9 18 12 18ZM6 16C7.1 16 8 16.9 8 18C8 19.1 7.1 20 6 20C4.9 20 4 19.1 4 18C4 16.9 4.9 16 6 16ZM18 16C19.1 16 20 16.9 20 18C20 19.1 19.1 20 18 20C16.9 20 16 19.1 16 18C16 16.9 16.9 16 18 16Z"/>
            </svg>
          </div>
        </div>

        <h2 className="text-center text-2xl font-black mb-1">
          {mode === 'signup' ? 'Join FocusSync' : 'Welcome Back'}
        </h2>
        <p className="text-center text-[13px] font-medium text-slate-500 mb-6">
          {mode === 'signup' ? 'Create your free account today.' : 'Sign in to sync your focus.'}
        </p>

        {/* Toggle Nav */}
        <div className="flex border-2 border-[#0F172A] rounded-xl overflow-hidden mb-6">
          <button 
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-sm font-bold transition-colors ${mode === 'login' ? 'bg-[#93C5FD] text-[#0F172A]' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
          >
            Log In
          </button>
          <div className="w-0.5 bg-[#0F172A]" />
          <button 
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 text-sm font-bold transition-colors ${mode === 'signup' ? 'bg-[#93C5FD] text-[#0F172A]' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-[13px] font-bold text-[#0F172A] mb-1.5 ml-1">Your Name</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="User01"
                required={mode === 'signup'}
                className="w-full h-11 px-4 rounded-xl border-2 border-[#0F172A] bg-white text-[#0F172A] font-medium outline-none focus:ring-2 focus:ring-[#3B82F6]/30 transition-all font-inter"
              />
            </div>
          )}
          
          <div>
            <label className="block text-[13px] font-bold text-[#0F172A] mb-1.5 ml-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@gmail.com"
              required
              className="w-full h-11 px-4 rounded-xl border-2 border-[#0F172A] bg-white text-[#0F172A] font-medium outline-none focus:ring-2 focus:ring-[#3B82F6]/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-[#0F172A] mb-1.5 ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••"
              required
              className="w-full h-11 px-4 rounded-xl border-2 border-[#0F172A] bg-white text-[#0F172A] text-lg font-bold outline-none focus:ring-2 focus:ring-[#3B82F6]/30 transition-all tracking-[0.2em]"
            />
          </div>

          {/* Fake error block */}
          {mode === 'signup' && false && (
            <div className="p-3 mt-4 rounded-xl border border-red-200 bg-red-50 text-[12px] font-bold text-red-600 flex items-start gap-2">
              <span>⚠️</span> Database unavailable. Please try again in a moment.
            </div>
          )}

          <button 
            type="submit"
            className="w-full mt-6 py-3 rounded-xl border-2 border-[#0F172A] bg-[#93C5FD] text-[#0F172A] font-black text-[15px] hover:bg-[#60A5FA] active:translate-y-0.5 active:shadow-[10px_10px_0px_#0F172A] shadow-[8px_8px_0px_#0F172A] transition-all"
          >
            {mode === 'signup' ? 'Create Account 🌸' : 'Log In 🌸'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[13px] font-medium text-slate-500">
            {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <span 
              onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
              className="font-bold text-[#2563EB] cursor-pointer hover:underline"
            >
              {mode === 'signup' ? 'Log In' : 'Sign Up'}
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
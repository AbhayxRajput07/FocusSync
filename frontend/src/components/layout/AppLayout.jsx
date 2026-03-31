import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Play, BarChart3, Settings, Bell, Flame, Menu, X, ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { AuthModal } from '../auth/AuthModal';

export function AppLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();

  const fakeNotifications = [
    { id: 1, title: 'Session Completed', message: 'You successfully completed a 30m focus session.', time: '2m ago', read: false },
    { id: 2, title: 'Achievement Unlocked', message: 'Deep Work Master! 10 sessions completed.', time: '1h ago', read: false },
    { id: 3, title: 'Daily Goal Met', message: 'You reached your 2-hour daily focus goal. Great job!', time: '3h ago', read: true },
  ];

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Your Tasks', path: '/tasks', icon: ClipboardList },
    { name: 'New Session', path: '/session', icon: Play },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  /* Add Inter dynamically */
  React.useEffect(() => {
    if (!document.getElementById('font-inter')) {
      const link = document.createElement('link');
      link.id = 'font-inter';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="flex h-screen w-full flex-col md:flex-row overflow-hidden bg-[#F0F4F8] text-[#0F172A] selection:bg-[#2563EB]/20 selection:text-[#2563EB]" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Mobile Header / Hamburger */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 z-50">
        <div className="flex items-center gap-2">
           <div className="h-6 w-6 rounded-full bg-[#2563EB] flex items-center justify-center">
             <div className="h-2 w-2 bg-white rounded-full" />
           </div>
           <span className="font-bold tracking-wider text-[#0F172A]">FOCUSSYNC</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-slate-500">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-40 flex h-full ${collapsed ? 'w-[80px]' : 'w-[240px]'} flex-col bg-white border-r border-[#E2E8F0] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all duration-300`}>
        <div className={`flex-1 overflow-y-auto py-6 ${collapsed ? 'px-3' : 'px-4'} hidden-scrollbar`}>
          {/* Logo & Toggle */}
          <div className={`mb-10 flex items-center justify-between ${collapsed ? 'justify-center mx-auto' : 'pl-2'} gap-3`}>
             {!collapsed && (
               <div className="flex items-center gap-3">
                 <div className="h-8 w-8 rounded-full bg-[#2563EB] flex items-center justify-center shadow-sm shrink-0">
                   <div className="h-3 w-3 bg-white rounded-full" />
                 </div>
                 <span className="text-[15px] font-[800] tracking-[0.05em] text-[#0F172A]">FOCUSSYNC</span>
               </div>
             )}
             {collapsed && (
                <div className="h-8 w-8 rounded-full bg-[#2563EB] flex items-center justify-center shadow-sm shrink-0">
                   <div className="h-3 w-3 bg-white rounded-full" />
                 </div>
             )}
             <button 
               onClick={() => setCollapsed(!collapsed)} 
               className={`hidden md:flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors ${collapsed ? 'absolute -right-3 top-7 border border-slate-200 shadow-sm z-50' : ''}`}
             >
               {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
             </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.name : ""}
                  className={`group relative flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-4'} rounded-xl py-3 text-[14px] font-medium transition-colors outline-none ${isActive ? 'text-[#2563EB] bg-[#EFF6FF]' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'}`}
                >
                  <item.icon className={`h-5 w-5 shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />      
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom */}
        <div className={`p-4 border-t border-[#E2E8F0] ${collapsed ? 'flex flex-col items-center' : ''}`}>
          {/* Streak */}
          <div className={`mb-4 flex items-center ${collapsed ? 'justify-center' : 'gap-2 px-2'} text-[#64748B]`} title={collapsed ? "7 DAY STREAK" : ""}>
             <Flame className="h-4 w-4 shrink-0 text-[#EA580C]" />
             {!collapsed && <span className="text-[12px] font-bold">7 DAY STREAK</span>}
          </div>

          {/* Account Tab - Always shown above Auth if specifically requested */}
          {user && (
            <NavLink 
              to="/account"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `flex items-center mb-3 ${collapsed ? 'justify-center w-10 h-10 p-0 rounded-full' : 'gap-3 rounded-xl p-3'} ${isActive ? 'bg-[#EFF6FF] border-[#2563EB]/30' : 'bg-white border-[#E2E8F0] hover:bg-slate-50'} border shadow-sm cursor-pointer transition-colors`} 
              title={collapsed ? "Account" : ""}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-white text-[13px] font-bold overflow-hidden uppercase">
                {user.name.charAt(0)}
              </div>
              {!collapsed && (
                <div className="overflow-hidden flex-1 text-left">
                  <p className="truncate text-[13px] font-bold text-[#0F172A]">Account</p>
                  <p className="truncate text-[11px] font-medium text-[#10B981] uppercase tracking-wide">SYSTEM ONLINE</p>
                </div>
              )}
            </NavLink>
          )}

          {!user && (
            <div 
              onClick={() => setShowAuthModal(true)}
              className={`flex items-center mb-3 ${collapsed ? 'justify-center w-10 h-10 p-0 rounded-full' : 'gap-3 rounded-xl p-3'} bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors opacity-70`} 
              title={collapsed ? "Account" : ""}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 text-[13px] font-bold overflow-hidden">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              {!collapsed && (
                <div className="overflow-hidden flex-1 text-left">
                  <p className="truncate text-[13px] font-bold text-slate-500">Account</p>
                  <p className="truncate text-[11px] font-medium text-slate-400 uppercase tracking-wide">OFFLINE</p>
                </div>
              )}
            </div>
          )}

          {/* Login / Sign Up */}
          {!user && (
            <div 
              onClick={() => setShowAuthModal(true)}
              className={`flex items-center ${collapsed ? 'justify-center w-10 h-10 p-0 rounded-full' : 'justify-center rounded-xl p-3'} bg-[#3B82F6] border border-[#2563EB] cursor-pointer hover:bg-[#2563EB] transition-colors`} 
              title={collapsed ? "Sign In" : ""}
            >
              {!collapsed && (
                <p className="truncate text-[13px] font-bold text-white">Sign In / Sign Up</p>
              )}
              {collapsed && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main Column */}
      <main className="flex-1 flex flex-col min-w-0 max-h-screen z-0 overflow-hidden relative">
        <div className="w-full h-1 bg-slate-200 shrink-0">
          <div className="h-full bg-[#2563EB] w-[45%] relative transition-all duration-1000 ease-out">
            <div className="absolute -top-6 right-0 -mr-14 text-[10px] font-bold text-[#2563EB] whitespace-nowrap">Goal: 45%</div>
          </div>
        </div>

        {/* Scrollable Container containing Header and Canvas */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto layout-scrollbar flex flex-col">
          {/* Header (Now scrolls away) */}
          <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white px-6 md:px-8 relative">
            <div>
              <p className="text-[11px] font-[800] uppercase tracking-wider text-[#2563EB]">FOCUS CORE</p>
              <p className="mt-0.5 text-[14px] font-bold text-[#0F172A]">{today}</p>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:text-[#0F172A] hover:bg-slate-200 ${showNotifications ? 'bg-slate-200 text-[#0F172A]' : 'bg-slate-100 text-[#64748B]'}`}
              >
                <Bell className="h-[18px] w-[18px]" />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full border-2 border-white bg-[#EF4444]" />
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-[340px] bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-[100]"
                  >
                    <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                      <h3 className="font-bold text-[14px] text-slate-800">Notifications</h3>
                      <button 
                        className="text-[12px] text-blue-600 font-semibold hover:text-blue-700 transition"
                        onClick={() => setShowNotifications(false)}
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-[350px] overflow-y-auto layout-scrollbar bg-white">
                      {fakeNotifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition cursor-pointer flex gap-4 ${!notification.read ? 'bg-blue-50/30' : ''}`}
                          onClick={() => setShowNotifications(false)}
                        >
                          <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!notification.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                          <div>
                            <p className="text-[13px] font-bold text-slate-800 mb-1">{notification.title}</p>
                            <p className="text-[12px] text-slate-500 leading-snug mb-2">{notification.message}</p>
                            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">{notification.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-slate-50 text-center border-t border-slate-50">
                      <button className="text-[12px] font-bold text-slate-500 hover:text-slate-800 transition">
                        View All
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </header>

          {/* Scrollable Canvas */}
          <div className={`flex-1 px-4 py-6 md:px-8 md:py-8 transition-colors duration-300 ${location.pathname === '/analytics' ? 'bg-sky-100' : ''}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showAuthModal && <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        .layout-scrollbar::-webkit-scrollbar { width: 6px; }
        .layout-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .layout-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 6px; }
        .layout-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
        .hidden-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}

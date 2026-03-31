import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, badge }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { type: 'spring', damping: 20, stiffness: 100 }
        }
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/40 bg-white/70 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all hover:border-blue-200/60 hover:bg-white/90 hover:shadow-[0_20px_40px_rgba(14,165,233,0.15)]"
    >
      {/* Subtle top inner gradient */}
      <div className="absolute inset-x-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>
      
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-sky-100 text-blue-600 shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md">
            <Icon className="h-7 w-7 transition-colors group-hover:text-blue-700" />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-blue-500/10 transition-all group-hover:ring-blue-500/20"></div>
          </div>
          
          {badge && (
            <span className="inline-flex items-center rounded-full bg-blue-100/50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200/50">
              {badge}
            </span>
          )}
        </div>
        
        <h3 className="mb-3 text-xl font-bold tracking-tight text-slate-800 transition-colors group-hover:text-blue-950">
          {title}
        </h3>
        <p className="text-[15px] leading-relaxed text-slate-500 transition-colors group-hover:text-slate-600">
          {description}
        </p>
      </div>
      
      <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-blue-600 opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
        Explore detailed view
        <ArrowUpRight className="h-4 w-4" />
      </div>
    </motion.div>
  );
};

export default FeatureCard;

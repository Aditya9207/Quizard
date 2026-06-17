import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ title, message }) => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-8 sm:p-12 text-center max-w-sm mx-auto"
    >
      <div className="mb-6 flex justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#7C3AED]/20 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(124,58,237,0.3)]" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-[#1E1B4B] mb-2">
        {title || 'Just one second'}
      </h2>
      <p className="text-sm font-medium text-slate-500">
        {message || 'We are fetching that content for you.'}
      </p>
    </motion.div>
  </div>
);

export default Loader;

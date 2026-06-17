import React from 'react';
import { WifiOff } from 'lucide-react';

const Offline = () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => window.location.reload());
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="glass-card p-12 text-center max-w-md mx-auto bg-[#24243e]">
        <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-10 h-10 text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">
          You're Offline
        </h1>
        <p className="text-slate-400 font-medium leading-relaxed">
          There is no Internet connection. We'll try to reload automatically
          once you're back online!
        </p>
      </div>
    </div>
  );
};

export default Offline;

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Trophy, BarChart2, Menu, X, LogOut, Brain, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSound } from '../../contexts/SoundContext';

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart2 },
];

const Header = () => {
  const { user, signOut } = useAuth();
  const { soundEnabled, toggleSound } = useSound();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-[#1E1B4B]"
          >
            <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-white shadow-md shadow-violet-500/25">
              <Brain className="w-5 h-5" />
            </span>
            <span className="text-xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">
              Quizard
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => {
              const active = location.pathname === link.to;
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative py-5 text-sm font-medium transition-colors ${
                    active
                      ? 'text-[#7C3AED]'
                      : 'text-slate-500 hover:text-[#1E1B4B]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </div>
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED] rounded-t-full shadow-[0_0_8px_rgba(124,58,237,0.6)]"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Sound toggle */}
            <button
              onClick={toggleSound}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#7C3AED] hover:bg-violet-50 transition-colors"
              title={soundEnabled ? 'Sound on — click to mute' : 'Sound off — click to enable'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* User avatar */}
            {user && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=7c3aed&color=fff`}
                    alt={user.displayName || 'User'}
                    className="w-9 h-9 rounded-full border-2 border-[#7C3AED]/20 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  {/* Online indicator */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
                <button
                  onClick={signOut}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-[#1E1B4B] hover:bg-slate-100 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-slate-200/60 bg-white/90 backdrop-blur-xl"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => {
                const active = location.pathname === link.to;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? 'bg-violet-50 text-[#7C3AED] border-l-2 border-[#7C3AED]'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-[#1E1B4B]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
              {user && (
                <button
                  onClick={() => {
                    signOut();
                    setMobileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Header;

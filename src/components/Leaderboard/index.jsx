import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Inbox, Brain } from 'lucide-react';

import { CATEGORIES } from '../../constants';
import { getLeaderboard } from '../../services/firestoreService';
import { calculateGrade } from '../../utils';

const PODIUM_COLORS = [
  'from-yellow-300 to-amber-400 border-yellow-400',
  'from-slate-200 to-slate-300 border-slate-300',
  'from-amber-500 to-amber-600 border-amber-500',
];
const PODIUM_GLOW = [
  'shadow-[0_0_25px_rgba(251,191,36,0.35)]',
  'shadow-[0_0_20px_rgba(148,163,184,0.25)]',
  'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
];
const PODIUM_TEXT = [
  'text-yellow-500',
  'text-slate-400',
  'text-amber-600',
];

const inputClasses = "w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-2.5 text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all appearance-none font-medium text-sm";

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const results = await getLeaderboard(
          categoryFilter !== '' ? categoryFilter : undefined,
          difficultyFilter !== 'all' ? difficultyFilter : undefined
        );
        setData(results);
      } catch (err) {
        console.error('Leaderboard fetch error:', err);
        setData([]);
      }
      setLoading(false);
    };
    fetch();
  }, [categoryFilter, difficultyFilter]);

  const top3 = data.slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#1E1B4B] mb-8 flex items-center gap-3">
        <Trophy className="w-8 h-8 text-yellow-500" />
        Leaderboard
      </h1>

      {/* Filters */}
      <div className="glass-card p-5 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
              Category
            </label>
            <select
              className={inputClasses}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.filter((c) => c.value !== '0').map((c, i) => (
                <option key={c.key} value={i}>
                  {c.text}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
              Difficulty
            </label>
            <select
              className={inputClasses}
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-10 h-10 border-4 border-[#7C3AED]/20 border-t-[#7C3AED] rounded-full animate-spin" />
          <p className="mt-4 text-sm font-medium text-slate-400">
            Loading leaderboard…
          </p>
        </div>
      ) : data.length === 0 ? (
        /* Enhanced empty state */
        <div className="glass-card p-16 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-violet-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-200/40">
            <Brain className="w-12 h-12 text-[#7C3AED]" />
          </div>
          <p className="text-xl font-bold text-[#1E1B4B] mb-2">
            Be the first to top the board!
          </p>
          <p className="text-sm font-medium text-slate-400 max-w-sm mx-auto">
            No scores yet for this category. Play a quiz and your score will appear here!
          </p>
        </div>
      ) : (
        <>
          {/* Podium for top 3 — spring drop-in animation */}
          {top3.length > 0 && (
            <div className="flex justify-center items-end gap-3 sm:gap-6 mb-12 px-4 mt-8">
              {/* 2nd place */}
              {top3[1] && (
                <motion.div
                  initial={{ opacity: 0, y: -80 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, type: 'spring', damping: 10, stiffness: 100 }}
                  className="flex-1 max-w-[180px]"
                >
                  <div className="text-center mb-4">
                    <img
                      src={top3[1].photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(top3[1].displayName)}&background=94a3b8&color=fff`}
                      alt={top3[1].displayName}
                      className={`w-14 h-14 rounded-full mx-auto border-2 border-slate-300 ${PODIUM_GLOW[1]}`}
                      referrerPolicy="no-referrer"
                    />
                    <p className="text-sm font-semibold text-[#1E1B4B] mt-3 truncate px-2">
                      {top3[1].displayName}
                    </p>
                    <p className="text-xl font-black text-slate-500">{Math.round(top3[1].score)}%</p>
                  </div>
                  <div className={`h-28 rounded-t-2xl bg-gradient-to-b ${PODIUM_COLORS[1]} flex items-start justify-center border-t-2 pt-4 ${PODIUM_GLOW[1]}`}>
                    <Medal className={`w-8 h-8 ${PODIUM_TEXT[1]}`} />
                  </div>
                </motion.div>
              )}

              {/* 1st place */}
              {top3[0] && (
                <motion.div
                  initial={{ opacity: 0, y: -100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, type: 'spring', damping: 10, stiffness: 100 }}
                  className="flex-1 max-w-[180px]"
                >
                  <div className="text-center mb-4">
                    <img
                      src={top3[0].photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(top3[0].displayName)}&background=eab308&color=fff`}
                      alt={top3[0].displayName}
                      className={`w-20 h-20 rounded-full mx-auto border-4 border-yellow-400 ${PODIUM_GLOW[0]}`}
                      referrerPolicy="no-referrer"
                    />
                    <p className="text-base font-bold text-[#1E1B4B] mt-4 truncate px-2">
                      {top3[0].displayName}
                    </p>
                    <p className="text-2xl font-black text-yellow-500">{Math.round(top3[0].score)}%</p>
                  </div>
                  <div className={`h-40 rounded-t-2xl bg-gradient-to-b ${PODIUM_COLORS[0]} flex items-start justify-center border-t-2 pt-5 ${PODIUM_GLOW[0]}`}>
                    <Trophy className={`w-10 h-10 ${PODIUM_TEXT[0]}`} />
                  </div>
                </motion.div>
              )}

              {/* 3rd place */}
              {top3[2] && (
                <motion.div
                  initial={{ opacity: 0, y: -60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, type: 'spring', damping: 10, stiffness: 100 }}
                  className="flex-1 max-w-[180px]"
                >
                  <div className="text-center mb-4">
                    <img
                      src={top3[2].photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(top3[2].displayName)}&background=d97706&color=fff`}
                      alt={top3[2].displayName}
                      className={`w-12 h-12 rounded-full mx-auto border-2 border-amber-600 ${PODIUM_GLOW[2]}`}
                      referrerPolicy="no-referrer"
                    />
                    <p className="text-sm font-semibold text-[#1E1B4B] mt-3 truncate px-2">
                      {top3[2].displayName}
                    </p>
                    <p className="text-lg font-black text-amber-600">{Math.round(top3[2].score)}%</p>
                  </div>
                  <div className={`h-20 rounded-t-2xl bg-gradient-to-b ${PODIUM_COLORS[2]} flex items-start justify-center border-t-2 pt-3 ${PODIUM_GLOW[2]}`}>
                    <Award className={`w-7 h-7 ${PODIUM_TEXT[2]}`} />
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Full table */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="text-left p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider w-16">
                      Rank
                    </th>
                    <th className="text-left p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="text-left p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                      Category
                    </th>
                    <th className="text-center p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="text-center p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                      Grade
                    </th>
                    <th className="text-right p-5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((entry, i) => {
                    const { grade: g } = calculateGrade(entry.score) || {};
                    return (
                      <motion.tr
                        key={entry.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className={`border-b border-slate-100 hover:bg-violet-50/40 transition-colors ${
                          i % 2 === 0 ? 'bg-white/60' : 'bg-violet-50/15'
                        }`}
                      >
                        <td className="p-5 font-bold font-mono text-slate-400">
                          {entry.rank <= 3 ? (
                            <span className={PODIUM_TEXT[entry.rank - 1]}>#{entry.rank}</span>
                          ) : (
                            `#${entry.rank}`
                          )}
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={entry.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.displayName)}&size=32&background=7c3aed&color=fff`}
                              alt={entry.displayName}
                              className="w-8 h-8 rounded-full"
                              referrerPolicy="no-referrer"
                            />
                            <span className="font-semibold text-[#1E1B4B] truncate max-w-[120px] sm:max-w-none">
                              {entry.displayName}
                            </span>
                          </div>
                        </td>
                        <td className="p-5 text-slate-500 hidden sm:table-cell text-sm font-medium">
                          {entry.category}
                        </td>
                        <td className="p-5 text-center font-black text-[#7C3AED]">
                          {Math.round(entry.score)}%
                        </td>
                        <td className="p-5 text-center hidden sm:table-cell">
                          <span className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-[#1E1B4B] text-xs font-bold">
                            {g || entry.grade || '—'}
                          </span>
                        </td>
                        <td className="p-5 text-right text-xs font-medium text-slate-400 hidden md:table-cell">
                          {entry.timestamp instanceof Date
                            ? entry.timestamp.toLocaleDateString()
                            : '—'}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;

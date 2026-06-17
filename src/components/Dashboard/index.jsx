import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { 
  BarChart3, 
  Flame, 
  Target, 
  FolderOpen, 
  Brain,
  Hash,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { getUserStats } from '../../services/firestoreService';

/* ---- Count-up animation ---- */
const AnimatedCounter = ({ target, suffix = '' }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);

  return <span>{display}{suffix}</span>;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserStats(user.uid)
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block w-10 h-10 border-4 border-[#7C3AED]/20 border-t-[#7C3AED] rounded-full animate-spin" />
        <p className="mt-4 text-sm font-medium text-slate-400">
          Loading dashboard…
        </p>
      </div>
    );
  }

  if (!stats || stats.totalQuizzes === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1E1B4B] mb-6 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-[#7C3AED]" />
          Analytics Dashboard
        </h1>
        <div className="glass-card p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-200/40">
            <FolderOpen className="w-10 h-10 text-[#7C3AED]" />
          </div>
          <p className="text-xl font-bold text-[#1E1B4B]">
            No data yet
          </p>
          <p className="text-sm font-medium text-slate-400 mt-2">
            Complete some quizzes to see your analytics here.
          </p>
        </div>
      </div>
    );
  }

  /* Chart data */
  const categoryData = Object.entries(stats.categoryAccuracy).map(
    ([name, accuracy]) => ({
      name: name.length > 22 ? name.slice(0, 20) + '…' : name,
      fullName: name,
      accuracy,
    })
  );

  const timeData = stats.recentQuizzes.map((q, i) => ({
    quiz: `Q${i + 1}`,
    avgTime: Math.round(q.avgTimePerQuestion * 10) / 10,
  }));

  /* Chart colors — light theme */
  const axisColor = '#64748b';
  const gridColor = 'rgba(0,0,0,0.06)';

  const customTooltipStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '8px 12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    color: '#1E1B4B',
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#1E1B4B] mb-8 flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-[#7C3AED]" />
        Analytics Dashboard
      </h1>

      {/* Summary Cards — white glass with colored icon backgrounds + count-up */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="glass-card p-6 flex flex-col items-center justify-center"
        >
          <div className="w-10 h-10 rounded-full bg-[#7C3AED] flex items-center justify-center text-white mb-3 shadow-md shadow-violet-400/25">
            <Hash className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-[#1E1B4B]">
            <AnimatedCounter target={stats.totalQuizzes} />
          </p>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
            Total Quizzes
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-6 flex flex-col items-center justify-center"
        >
          <div className="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center text-white mb-3 shadow-md shadow-emerald-400/25">
            <Target className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-[#1E1B4B]">
            <AnimatedCounter target={stats.averageScore} suffix="%" />
          </p>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
            Average Score
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 flex flex-col items-center justify-center"
        >
          <div className="w-10 h-10 rounded-full bg-[#06B6D4] flex items-center justify-center text-white mb-3 shadow-md shadow-cyan-400/25">
            <BarChart3 className="w-5 h-5" />
          </div>
          <p className="text-base font-bold text-[#1E1B4B] text-center w-full break-words leading-tight">
            {stats.bestCategory || '—'}
          </p>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
            Best Category
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-6 flex flex-col items-center justify-center"
        >
          <div className="w-10 h-10 rounded-full bg-[#F59E0B] flex items-center justify-center text-white mb-3 shadow-md shadow-amber-400/25">
            <Flame className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-[#1E1B4B]">
            <AnimatedCounter target={stats.currentStreak} />
          </p>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
            Current Streak
          </p>
        </motion.div>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Bar chart: category accuracy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 sm:p-8"
        >
          <h2 className="text-lg font-bold text-[#1E1B4B] mb-6">
            Accuracy by Category
          </h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={categoryData} margin={{ top: 5, right: 10, left: -10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: axisColor, fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tick={{ fill: axisColor, fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip
                  contentStyle={customTooltipStyle}
                  labelStyle={{ color: axisColor, fontWeight: 600 }}
                  formatter={(val) => [`${val}%`, 'Accuracy']}
                />
                <Bar
                  dataKey="accuracy"
                  fill="url(#barGradientLight)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
                <defs>
                  <linearGradient id="barGradientLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm font-medium text-slate-400 text-center py-10">
              No category data yet.
            </p>
          )}
        </motion.div>

        {/* Line chart: avg time trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-6 sm:p-8"
        >
          <h2 className="text-lg font-bold text-[#1E1B4B] mb-6">
            Avg Time per Question (Last 10)
          </h2>
          {timeData.length > 1 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={timeData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="quiz"
                  tick={{ fill: axisColor, fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                />
                <YAxis
                  tick={{ fill: axisColor, fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                  unit="s"
                />
                <Tooltip
                  contentStyle={customTooltipStyle}
                  labelStyle={{ color: axisColor, fontWeight: 600 }}
                  formatter={(val) => [`${val}s`, 'Avg Time']}
                />
                <Line
                  type="monotone"
                  dataKey="avgTime"
                  stroke="#7C3AED"
                  strokeWidth={3}
                  dot={{ fill: '#7C3AED', strokeWidth: 0, r: 5 }}
                  activeDot={{ r: 7, fill: '#06B6D4' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm font-medium text-slate-400 text-center py-10">
              Need at least 2 quizzes for trend data.
            </p>
          )}
        </motion.div>
      </div>

      {/* ML Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6 sm:p-8"
      >
        <h2 className="text-lg font-bold text-[#1E1B4B] mb-6 flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#7C3AED]" />
          ML Insights
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/80 border border-slate-200 text-center shadow-sm">
            <p className="text-3xl font-black text-[#1E1B4B]">
              <AnimatedCounter target={stats.mlSuggestionCount} />
            </p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-2">
              Suggestions Made
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-center shadow-sm">
            <p className="text-3xl font-black text-emerald-600">
              <AnimatedCounter target={stats.mlAcceptedCount} />
            </p>
            <p className="text-xs font-semibold text-emerald-500/70 uppercase tracking-widest mt-2">
              Suggestions Accepted
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-violet-50/80 border border-violet-200 text-center shadow-sm">
            <p className="text-3xl font-black text-[#7C3AED]">
              <AnimatedCounter target={stats.mlAcceptanceRate} suffix="%" />
            </p>
            <p className="text-xs font-semibold text-violet-400/70 uppercase tracking-widest mt-2">
              Acceptance Rate
            </p>
          </div>
        </div>
        
        {stats.totalQuizzes < 10 && (
          <div className="mt-8 text-sm font-medium text-amber-700 text-center bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-center gap-2">
            <Lightbulb className="w-5 h-5 shrink-0" />
            <span>Currently in <strong>rule-based</strong> phase. Complete {10 - stats.totalQuizzes} more quizzes to activate the ML model.</span>
          </div>
        )}
        {stats.totalQuizzes >= 10 && (
          <div className="mt-8 text-sm font-medium text-emerald-700 text-center bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span><strong>ML model active</strong> — logistic regression trained on {stats.totalQuizzes} attempts.</span>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;

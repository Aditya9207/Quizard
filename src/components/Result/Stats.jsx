import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Trophy, Target, Clock, RotateCcw, Home, Share2, Copy, CheckCircle2 } from 'lucide-react';

import { timeConverter } from '../../utils';

/* ---- Count-up animation component ---- */
const AnimatedValue = ({ target, suffix = '', prefix = '' }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1500;
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

  return <span>{prefix}{display}{suffix}</span>;
};

/* ---- Grade color helpers ---- */
const getGradeColor = (grade) => {
  if (!grade) return '#94a3b8';
  const g = grade.charAt(0);
  switch (g) {
    case 'A': return '#10B981';
    case 'B': return '#10B981';
    case 'C': return '#F59E0B';
    case 'D': return '#EF4444';
    case 'F': return '#EF4444';
    default: return '#94a3b8';
  }
};

/* ---- Remarks by score range ---- */
const getRemarksByScore = (score) => {
  if (score >= 90) return { text: 'Outstanding!', color: 'text-[#10B981]' };
  if (score >= 70) return { text: 'Well done!', color: 'text-[#06B6D4]' };
  if (score >= 50) return { text: 'Keep pushing!', color: 'text-[#F59E0B]' };
  return { text: 'Learning is a journey. Keep going.', color: 'text-red-400' };
};

/* ---- Canvas Confetti ---- */
const useConfetti = (shouldFire) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!shouldFire) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#3B82F6'];
    const particles = [];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: -Math.random() * 18 - 5,
        size: Math.random() * 8 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.3,
        opacity: 1,
      });
    }

    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach((p) => {
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.008;

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      });

      if (alive) {
        animId = requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    };

    animId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animId);
      canvas.remove();
    };
  }, [shouldFire]);
};

/* ---- Stats Component ---- */
const Stats = ({
  totalQuestions,
  correctAnswers,
  timeTaken,
  score,
  grade,
  remarks,
  replayQuiz,
  resetQuiz,
}) => {
  const { hours, minutes, seconds } = timeConverter(timeTaken);
  const displayScore = score ?? 0;
  const displayGrade = grade ?? 'N/A';
  const passed = displayScore >= 70;

  const gradeColorHex = getGradeColor(displayGrade);
  const strokeDashoffset = 339.292 - (339.292 * displayScore) / 100;
  const remarksInfo = getRemarksByScore(displayScore);

  // Mount animation for the SVG circle
  const [offset, setOffset] = useState(339.292);
  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(strokeDashoffset);
    }, 100);
    return () => clearTimeout(timer);
  }, [strokeDashoffset]);

  // Confetti for high scores
  useConfetti(displayScore >= 70);

  // Copy score to clipboard
  const [copied, setCopied] = useState(false);
  const handleCopyScore = useCallback(() => {
    const text = `🧠 Quizard Score: ${displayScore}% (Grade: ${displayGrade})\n✅ ${correctAnswers}/${totalQuestions} correct\nPlay now: ${window.location.origin}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }, [displayScore, displayGrade, correctAnswers, totalQuestions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="glass-card p-6 sm:p-10 text-center">
        {/* Remarks banner — color-coded */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-block px-6 py-2.5 rounded-full bg-white shadow-sm border border-slate-100 mb-10"
        >
          <p className={`text-lg font-bold tracking-wide ${remarksInfo.color}`}>
            {remarksInfo.text}
          </p>
        </motion.div>

        {/* Stats grid — white glass cards with count-up */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {/* Score Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-md border border-[#7C3AED]/15 rounded-2xl p-6 flex flex-col items-center relative overflow-hidden shadow-lg"
          >
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-[#7C3AED]/10 rounded-full blur-2xl" />
            <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 flex items-center justify-center text-[#7C3AED] mb-3 border border-[#7C3AED]/20">
              <Trophy className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black text-[#1E1B4B] mb-1">
              <AnimatedValue target={displayScore} suffix="%" />
            </p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Final Score</p>
          </motion.div>

          {/* Correct Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-md border border-emerald-200 rounded-2xl p-6 flex flex-col items-center relative overflow-hidden shadow-lg"
          >
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-emerald-400/10 rounded-full blur-2xl" />
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-3 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black text-[#1E1B4B] mb-1">
              <AnimatedValue target={correctAnswers} /> <span className="text-xl text-slate-400 font-bold">/ {totalQuestions}</span>
            </p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Correct</p>
          </motion.div>

          {/* Time Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-md border border-cyan-200 rounded-2xl p-6 flex flex-col items-center relative overflow-hidden shadow-lg"
          >
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-cyan-400/10 rounded-full blur-2xl" />
            <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-500 mb-3 border border-cyan-200">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black text-[#1E1B4B] mb-1">
              {Number(hours) > 0 && `${Number(hours)}h `}{Number(minutes) > 0 && `${Number(minutes)}m `}{Number(seconds)}s
            </p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Time Taken</p>
          </motion.div>
        </div>

        {/* Grade circle with SVG (De-emphasized) */}
        <div className="flex justify-center mb-10">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="rgba(0, 0, 0, 0.05)"
                strokeWidth="10"
              />
              <circle
                className="circle-progress drop-shadow-sm"
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={gradeColorHex}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="339.292"
                strokeDashoffset={offset}
              />
            </svg>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="relative z-10 flex flex-col items-center"
            >
              <p className="text-3xl font-black text-[#1E1B4B]" style={{ textShadow: `0 0 10px ${gradeColorHex}30` }}>
                {displayGrade}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Grade</p>
            </motion.div>
          </div>
        </div>

        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          {/* Play Again — most prominent CTA */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={replayQuiz} 
            className={`px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-bold text-lg shadow-lg shadow-[#7C3AED]/20 transition-all flex items-center gap-2 ${!passed ? 'animate-nudge-bounce' : ''}`}
          >
            <RotateCcw className="w-5 h-5" /> Play Again
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetQuiz} 
            className="px-6 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-medium shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Home className="w-4 h-4" /> Back to Home
          </motion.button>

          {/* Copy score to clipboard */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyScore}
            className="px-6 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-medium shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2 relative"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Share Score
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

Stats.propTypes = {
  totalQuestions: PropTypes.number.isRequired,
  correctAnswers: PropTypes.number.isRequired,
  timeTaken: PropTypes.number.isRequired,
  score: PropTypes.number,
  grade: PropTypes.string,
  remarks: PropTypes.string,
  replayQuiz: PropTypes.func.isRequired,
  resetQuiz: PropTypes.func.isRequired,
};

export default Stats;

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Play, AlertTriangle, CheckCircle2 } from 'lucide-react';

import wizardHatImg from '../../images/wizard-hat.svg';
import {
  CATEGORIES,
  NUM_OF_QUESTIONS,
  DIFFICULTY,
  QUESTIONS_TYPE,
  COUNTDOWN_TIME,
} from '../../constants';
import { shuffle } from '../../utils';
import {
  encodeCategoryValue,
  getCategoryNameByValue,
} from '../../services/firestoreService';
import Offline from '../Offline';
import DocumentUpload from '../DocumentUpload';

const inputClasses = "w-full h-12 bg-white/80 border border-slate-200 rounded-xl px-4 text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent focus:border-l-4 focus:border-l-[#7C3AED] transition-all appearance-none font-medium text-base";
const labelClasses = "block text-xs uppercase tracking-widest text-slate-500 mb-2.5 font-bold";

/* Mappings for live preview */
const CATEGORY_META = {
  '0': { emoji: '🎲', title: 'Surprise Me', sample: 'Your questions will be a mix of all categories' },
  9: { emoji: '🧠', sample: 'What is the capital of France?' },
  10: { emoji: '📚', sample: 'Who wrote the Harry Potter series?' },
  11: { emoji: '🎬', sample: 'Which movie won the Oscar for Best Picture in 1994?' },
  12: { emoji: '🎵', sample: 'Who is known as the King of Pop?' },
  13: { emoji: '🎭', sample: 'Which musical features the song "Defying Gravity"?' },
  14: { emoji: '📺', sample: 'What is the name of the fictional town in Stranger Things?' },
  15: { emoji: '🎮', sample: 'What is the best-selling video game console of all time?' },
  16: { emoji: '🎲', sample: 'In chess, which piece can only move diagonally?' },
  17: { emoji: '🔬', sample: 'What is the chemical symbol for gold?' },
  18: { emoji: '💻', sample: 'What does CPU stand for?' },
  19: { emoji: '📐', sample: 'What is the square root of 144?' },
  20: { emoji: '🏛️', sample: 'Who is the Greek god of the sea?' },
  21: { emoji: '⚽', sample: 'How many players are on a standard soccer team?' },
  22: { emoji: '🌍', sample: 'What is the longest river in the world?' },
  23: { emoji: '📜', sample: 'In what year did World War II end?' },
  24: { emoji: '🗳️', sample: 'Who was the 16th President of the United States?' },
  25: { emoji: '🎨', sample: 'Who painted the Mona Lisa?' },
  26: { emoji: '🌟', sample: 'Which celebrity is known as "The Rock"?' },
  27: { emoji: '🐾', sample: 'What is the fastest land animal?' },
  28: { emoji: '🚗', sample: 'Which car manufacturer produces the Mustang?' },
  29: { emoji: '🦸', sample: 'What is the alter ego of Batman?' },
  30: { emoji: '📱', sample: 'When was the first iPhone released?' },
  31: { emoji: '🌸', sample: 'In Naruto, what is the name of the Nine-Tailed Fox?' },
  32: { emoji: '📺', sample: 'What is the name of Mickey Mouse\'s dog?' }
};

const DIFFICULTY_META = {
  '0': { color: 'from-purple-500 to-indigo-500', label: 'Mixed', desc: 'Anything goes' },
  'easy': { color: 'from-emerald-400 to-emerald-600', label: 'Easy', desc: 'Straightforward questions, good for warm-up' },
  'medium': { color: 'from-amber-400 to-amber-600', label: 'Medium', desc: 'A balanced challenge' },
  'hard': { color: 'from-rose-500 to-rose-600', label: 'Hard', desc: 'Expect to be stumped' }
};

/* Stagger animation variants */
const containerStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const fieldVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const Main = ({ startQuiz, predictForCategory, mlPhase }) => {
  const [mode, setMode] = useState('classic');
  const [category, setCategory] = useState('0');
  const [numOfQuestions, setNumOfQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('0');
  const [questionsType, setQuestionsType] = useState('0');
  const [countdownTime, setCountdownTime] = useState({
    hours: 0,
    minutes: 120,
    seconds: 0,
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(false);

  /* ML recommendation state */
  const [mlRec, setMlRec] = useState(null);
  const [mlAccepted, setMlAccepted] = useState(null);

  /* Re-predict when category changes */
  useEffect(() => {
    if (!predictForCategory) return;
    const encoded = encodeCategoryValue(category);
    const prediction = predictForCategory(encoded);
    setMlRec(prediction);
    setMlAccepted(null);
  }, [category, predictForCategory]);

  const handleAcceptRecommendation = () => {
    if (mlRec?.difficulty) {
      setDifficulty(mlRec.difficulty);
      setMlAccepted(true);
    }
  };

  const handleTimeChange = (name, value) => {
    setCountdownTime({ ...countdownTime, [name]: Number(value) });
  };

  const allFieldsSelected =
    category &&
    numOfQuestions &&
    difficulty &&
    questionsType &&
    (countdownTime.hours || countdownTime.minutes || countdownTime.seconds);

  const fetchData = () => {
    setProcessing(true);
    if (error) setError(null);

    const API = `https://opentdb.com/api.php?amount=${numOfQuestions}&category=${category}&difficulty=${difficulty}&type=${questionsType}`;

    fetch(API)
      .then((r) => r.json())
      .then((data) =>
        setTimeout(() => {
          const { response_code, results } = data;

          if (response_code === 1) {
            setProcessing(false);
            setError(
              "The API doesn't have enough questions for your query. Try fewer questions, a different difficulty, or question type."
            );
            return;
          }

          results.forEach((el) => {
            el.options = shuffle([
              el.correct_answer,
              ...el.incorrect_answers,
            ]);
          });

          const categoryEncoded = encodeCategoryValue(category);
          const categoryName = getCategoryNameByValue(category);

          const meta = {
            categoryName,
            categoryEncoded,
            difficulty,
            questionsType,
            mlSuggestion: mlRec?.difficulty || null,
            mlAccepted:
              mlRec?.difficulty != null
                ? mlAccepted === true ||
                  (mlAccepted === null && difficulty === mlRec.difficulty)
                : null,
          };

          setProcessing(false);
          startQuiz(
            results,
            countdownTime.hours + countdownTime.minutes + countdownTime.seconds,
            meta
          );
        }, 800)
      )
      .catch(() =>
        setTimeout(() => {
          if (!navigator.onLine) {
            setOffline(true);
          } else {
            setProcessing(false);
            setError('Something went wrong. Please try again.');
          }
        }, 800)
      );
  };

  const handleQuestionsGenerated = (questions) => {
    questions.forEach((el) => {
      el.options = shuffle([
        el.correct_answer,
        ...el.incorrect_answers,
      ]);
    });

    const meta = {
      mode: 'document',
      categoryName: 'Document Quiz',
      difficulty: 'mixed',
      questionsType: 'multiple',
      mlSuggestion: null,
      mlAccepted: null,
    };

    startQuiz(
      questions,
      countdownTime.hours * 3600 + countdownTime.minutes * 60 + countdownTime.seconds,
      meta
    );
  };

  if (offline) return <Offline />;

  const currentCategory = CATEGORIES.find(c => String(c.value) === String(category));
  const catMeta = CATEGORY_META[category] || CATEGORY_META['0'];
  const diffMeta = DIFFICULTY_META[difficulty] || DIFFICULTY_META['0'];
  
  const totalSeconds = countdownTime.hours * 3600 + countdownTime.minutes * 60 + countdownTime.seconds;
  const timeString = totalSeconds > 0 
    ? (totalSeconds >= 60 ? `${Math.floor(totalSeconds/60)} min timer` : `${totalSeconds} sec timer`)
    : 'no timer';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto w-full flex-1 flex flex-col justify-center min-h-[calc(100vh-140px)]"
    >
      <div className="flex justify-center mb-8">
        <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-full border border-slate-200/50 shadow-sm">
          <button
            onClick={() => setMode('classic')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${mode === 'classic' ? 'bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <span>🎯</span> Classic Quiz
          </button>
          <button
            onClick={() => setMode('document')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${mode === 'document' ? 'bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <span>📄</span> From Document
          </button>
        </div>
      </div>

      {mode === 'classic' ? (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch w-full min-h-[560px]">
        {/* Left Side: Live Preview */}
        <div className="lg:col-span-2 hidden lg:flex flex-col justify-between h-full glass-panel p-8 relative overflow-hidden bg-white/60">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-8">Live Preview</h2>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-5xl">{catMeta.emoji}</span>
              <h1 className="text-3xl font-black text-[#1E1B4B] leading-tight">
                {category === '0' ? catMeta.title : currentCategory?.text}
              </h1>
            </div>

            <div className="mb-8">
              <div className={`inline-block px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider bg-gradient-to-r ${diffMeta.color} mb-2 shadow-sm`}>
                {diffMeta.label}
              </div>
              <p className="text-sm text-slate-500 font-medium">{diffMeta.desc}</p>
            </div>

            <div className="bg-white/50 border border-slate-200/60 rounded-2xl p-5 shadow-sm">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-2">Sample Question</span>
              <p className="text-[#1E1B4B] font-medium mb-4 line-clamp-2">{catMeta.sample}</p>
              {category !== '0' && (
                <div className="space-y-2 blur-[4px] opacity-70 select-none">
                  <div className="h-8 bg-slate-200/80 rounded-lg w-full"></div>
                  <div className="h-8 bg-slate-200/80 rounded-lg w-5/6"></div>
                  <div className="h-8 bg-slate-200/80 rounded-lg w-full"></div>
                  <div className="h-8 bg-slate-200/80 rounded-lg w-4/5"></div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200/60">
            <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7C3AED]" />
              {numOfQuestions} {diffMeta.label.toLowerCase()} questions from {category === '0' ? 'all categories' : currentCategory?.text} · {timeString}
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-3 glass-card p-8 sm:p-12 relative overflow-hidden flex flex-col justify-center">
          
          {/* Mobile Header (hidden on desktop) */}
          <div className="lg:hidden flex flex-col items-center text-center mb-8">
            <div className="animate-bob">
              <img src={wizardHatImg} alt="Quizard" className="w-24 h-24 drop-shadow-lg mb-4" />
            </div>
            <h1 className="text-2xl font-bold text-[#1E1B4B]">Quizard</h1>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-3 overflow-hidden"
              >
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">{error}</p>
                  <button onClick={() => setError(null)} className="mt-2 text-xs underline hover:no-underline font-normal">
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ML Recommendation Card */}
          <AnimatePresence>
            {mlRec && mlRec.difficulty && mlRec.phase !== 'none' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-8 p-5 rounded-2xl border bg-gradient-to-br from-violet-50 to-indigo-50 border-[#7C3AED]/20 relative overflow-hidden"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#7C3AED]/10 rounded-full blur-2xl" />
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-[#7C3AED]/10 flex items-center justify-center border border-[#7C3AED]/20 text-[#7C3AED]">
                    {mlRec.phase === 'ml' ? <Brain className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-widest text-[#7C3AED] font-semibold mb-1">
                      {mlRec.phase === 'ml' ? 'AI Recommendation' : 'Suggestion'}
                    </p>
                    <p className="text-sm font-normal text-slate-600">
                      {mlRec.message}
                    </p>
                    
                    {mlRec.phase === 'ml' && mlRec.confidence != null && (
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.round(mlRec.confidence * 100)}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-full"
                          />
                        </div>
                        <span className="text-xs font-mono font-medium text-[#7C3AED] w-10 text-right">
                          {Math.round(mlRec.confidence * 100)}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                    {difficulty !== mlRec.difficulty ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAcceptRecommendation}
                        className="w-full sm:w-auto text-xs font-semibold px-4 py-2.5 rounded-xl bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/25 hover:bg-violet-600 transition-colors"
                      >
                        Accept {mlRec.difficulty}
                      </motion.button>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 w-full sm:w-auto">
                        <CheckCircle2 className="w-4 h-4" /> Applied
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Fields — staggered animation */}
          <motion.div
            variants={containerStagger}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            <motion.div variants={fieldVariant} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Category */}
              <motion.div variants={fieldVariant}>
                <label className={labelClasses}>Category</label>
                <div className="relative">
                  <select
                    className={inputClasses}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={processing}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.key} value={c.value}>
                        {c.text}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>

              {/* Number of Questions */}
              <motion.div variants={fieldVariant}>
                <label className={labelClasses}>No. of Questions</label>
                <select
                  className={inputClasses}
                  value={numOfQuestions}
                  onChange={(e) => setNumOfQuestions(Number(e.target.value))}
                  disabled={processing}
                >
                  {NUM_OF_QUESTIONS.map((n) => (
                    <option key={n.key} value={n.value}>
                      {n.text}
                    </option>
                  ))}
                </select>
              </motion.div>

              {/* Difficulty */}
              <motion.div variants={fieldVariant}>
                <label className={labelClasses}>Difficulty</label>
                <select
                  className={inputClasses}
                  value={difficulty}
                  onChange={(e) => {
                    setDifficulty(e.target.value);
                    if (mlRec?.difficulty && e.target.value !== mlRec.difficulty) {
                      setMlAccepted(false);
                    } else if (mlRec?.difficulty && e.target.value === mlRec.difficulty) {
                      setMlAccepted(true);
                    }
                  }}
                  disabled={processing}
                >
                  {DIFFICULTY.map((d) => (
                    <option key={d.key} value={d.value}>
                      {d.text}
                    </option>
                  ))}
                </select>
              </motion.div>

              {/* Question Type */}
              <motion.div variants={fieldVariant}>
                <label className={labelClasses}>Question Type</label>
                <select
                  className={inputClasses}
                  value={questionsType}
                  onChange={(e) => setQuestionsType(e.target.value)}
                  disabled={processing}
                >
                  {QUESTIONS_TYPE.map((q) => (
                    <option key={q.key} value={q.value}>
                      {q.text}
                    </option>
                  ))}
                </select>
              </motion.div>
            </motion.div>

            {/* Countdown Time */}
            <motion.div variants={fieldVariant}>
              <label className={labelClasses}>Countdown Timer</label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider font-semibold">Hours</label>
                  <select
                    className={inputClasses}
                    value={countdownTime.hours}
                    onChange={(e) => handleTimeChange('hours', e.target.value)}
                    disabled={processing}
                  >
                    {COUNTDOWN_TIME.hours.slice(0, 24).map((h) => (
                      <option key={h.key} value={h.value}>{h.text}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider font-semibold">Minutes</label>
                  <select
                    className={inputClasses}
                    value={countdownTime.minutes}
                    onChange={(e) => handleTimeChange('minutes', e.target.value)}
                    disabled={processing}
                  >
                    {COUNTDOWN_TIME.minutes.map((m) => (
                      <option key={m.key} value={m.value}>{m.text}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider font-semibold">Seconds</label>
                  <select
                    className={inputClasses}
                    value={countdownTime.seconds}
                    onChange={(e) => handleTimeChange('seconds', e.target.value)}
                    disabled={processing}
                  >
                    {COUNTDOWN_TIME.seconds.map((s) => (
                      <option key={s.key} value={s.value}>{s.text}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Play Button */}
          <div className="mt-12">
            <motion.button
              whileHover={!processing && allFieldsSelected ? { scale: 1.02 } : {}}
              whileTap={!processing && allFieldsSelected ? { scale: 0.98 } : {}}
              className={`w-full text-lg font-bold py-4 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white shadow-lg hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none ${!processing && allFieldsSelected ? 'animate-pulse-glow' : ''}`}
              onClick={fetchData}
              disabled={!allFieldsSelected || processing}
            >
              {processing ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing…
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  Play Now
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
      ) : (
        <div className="w-full max-w-4xl mx-auto">
          <DocumentUpload onQuestionsGenerated={handleQuestionsGenerated} />
        </div>
      )}

      {/* Footer Tagline */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.6 }}
        className="mt-12 text-center text-sm font-medium text-slate-400 flex flex-wrap items-center justify-center gap-4 sm:gap-8"
      >
        <span className="flex items-center gap-1.5 text-[#1E1B4B] font-bold">Play free forever</span>
      </motion.div>
    </motion.div>
  );
};

Main.propTypes = {
  startQuiz: PropTypes.func.isRequired,
  predictForCategory: PropTypes.func,
  mlPhase: PropTypes.string,
};

export default Main;

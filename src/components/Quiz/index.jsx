import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';
import he from 'he';

import Countdown from '../Countdown';
import { useSound } from '../../contexts/SoundContext';
import { getLetter } from '../../utils';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: 30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } }
};

const Quiz = ({ data, countdownTime, endQuiz }) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [userSelectedAns, setUserSelectedAns] = useState(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [questionsAndAnswers, setQuestionsAndAnswers] = useState([]);
  const [timeTaken, setTimeTaken] = useState(null);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [rippleIdx, setRippleIdx] = useState(null);

  const { playCorrect, playWrong } = useSound();

  useEffect(() => {
    if (questionIndex > 0) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [questionIndex]);

  /* Keyboard navigation: 1-4 selects options */
  const handleKeyNav = useCallback((e) => {
    if (isAnswerLocked) return;
    const key = parseInt(e.key, 10);
    if (key >= 1 && key <= 4 && currentQuestion.options[key - 1]) {
      const decoded = he.decode(currentQuestion.options[key - 1]);
      setUserSelectedAns(decoded);
      setRippleIdx(key - 1);
      setTimeout(() => setRippleIdx(null), 600);
    }
  }, [isAnswerLocked]);

  const currentQuestion = data[questionIndex];

  useEffect(() => {
    window.addEventListener('keydown', handleKeyNav);
    return () => window.removeEventListener('keydown', handleKeyNav);
  }, [handleKeyNav]);

  const handleOptionClick = (option, idx) => {
    if (isAnswerLocked) return;
    setUserSelectedAns(option);
    setRippleIdx(idx);
    setTimeout(() => setRippleIdx(null), 600);
  };

  const handleCheckAnswer = () => {
    setIsAnswerLocked(true);
    const correctAnswer = he.decode(data[questionIndex].correct_answer);
    if (userSelectedAns === correctAnswer) {
      playCorrect();
    } else {
      playWrong();
      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 500);
    }
  };

  const handleNext = () => {
    const correctAnswer = he.decode(data[questionIndex].correct_answer);
    let point = 0;
    if (userSelectedAns === correctAnswer) {
      point = 1;
    }

    const qna = [
      ...questionsAndAnswers,
      {
        question: he.decode(data[questionIndex].question),
        user_answer: userSelectedAns,
        correct_answer: correctAnswer,
        point,
      },
    ];

    if (questionIndex === data.length - 1) {
      return endQuiz({
        totalQuestions: data.length,
        correctAnswers: correctAnswers + point,
        timeTaken,
        questionsAndAnswers: qna,
      });
    }

    setCorrectAnswers(correctAnswers + point);
    setQuestionIndex(questionIndex + 1);
    setUserSelectedAns(null);
    setIsAnswerLocked(false);
    setQuestionsAndAnswers(qna);
  };

  const timeOver = (elapsed) => {
    endQuiz({
      totalQuestions: data.length,
      correctAnswers,
      timeTaken: elapsed,
      questionsAndAnswers,
    });
  };

  const decodedCorrectAnswer = he.decode(currentQuestion.correct_answer);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto"
    >
      <div className="glass-card p-6 sm:p-10">
        {/* Top bar: question counter + countdown */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-[#7C3AED]/10 flex items-center justify-center text-[#7C3AED] font-bold text-lg border border-[#7C3AED]/20">
              {questionIndex + 1}
            </span>
            <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">
              of <span className="text-[#1E1B4B] font-bold">{data.length}</span> questions
            </span>
          </div>
          <Countdown
            countdownTime={countdownTime}
            timeOver={timeOver}
            setTimeTaken={setTimeTaken}
          />
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
            <motion.div
              className="h-full progress-shimmer rounded-full"
              initial={{ width: `${((questionIndex) / data.length) * 100}%` }}
              animate={{ width: `${((questionIndex + 1) / data.length) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <span className="text-xs font-bold text-slate-400 w-8 text-right">
            {Math.round(((questionIndex + 1) / data.length) * 100)}%
          </span>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={questionIndex}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35 }}
          >
            <div className="p-6 bg-white shadow-sm border-l-4 border-[#7C3AED] rounded-r-2xl mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-[#1E1B4B] leading-relaxed">
                {he.decode(currentQuestion.question)}
              </h2>
            </div>

            {/* Options */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              {currentQuestion.options.map((option, i) => {
                const letter = getLetter(i);
                const decoded = he.decode(option);
                const isSelected = userSelectedAns === decoded;
                const isCorrect = decoded === decodedCorrectAnswer;

                // Determine styles based on state
                let containerClasses = 'bg-white border-slate-200 text-[#1E1B4B] hover:border-[#7C3AED]/50 hover:bg-violet-50/50 cursor-pointer';
                let letterClasses = 'bg-slate-100 text-slate-500';
                let textClasses = 'text-[#1E1B4B]';
                let extraClasses = '';
                
                if (isAnswerLocked) {
                  if (isCorrect) {
                    containerClasses = 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.15)]';
                    letterClasses = 'bg-emerald-500 text-white';
                    textClasses = 'text-emerald-700 font-semibold';
                  } else if (isSelected && !isCorrect) {
                    containerClasses = 'bg-red-50 border-red-500 text-red-700 shadow-[0_0_15px_rgba(239,68,68,0.15)]';
                    letterClasses = 'bg-red-500 text-white';
                    textClasses = 'text-red-700 font-semibold';
                    if (shakeWrong) extraClasses = 'animate-shake';
                  } else {
                    containerClasses = 'bg-white/50 border-slate-100 text-slate-400 opacity-50';
                  }
                } else {
                  if (isSelected) {
                    containerClasses = 'bg-violet-50 border-[#7C3AED] shadow-[0_0_15px_rgba(124,58,237,0.15)]';
                    letterClasses = 'bg-[#7C3AED] text-white';
                    textClasses = 'text-[#7C3AED] font-semibold';
                  }
                }

                return (
                  <motion.button
                    variants={itemVariants}
                    key={decoded}
                    whileHover={!isAnswerLocked && !isSelected ? { scale: 1.01 } : {}}
                    whileTap={!isAnswerLocked ? { scale: 0.99 } : {}}
                    onClick={() => handleOptionClick(decoded, i)}
                    disabled={isAnswerLocked}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between gap-4 relative overflow-hidden ${containerClasses} ${extraClasses}`}
                  >
                    {/* Ripple effect */}
                    {rippleIdx === i && (
                      <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="w-0 h-0 rounded-full bg-[#7C3AED]/10 animate-ripple" />
                      </span>
                    )}
                    
                    <div className="flex items-center gap-4 relative z-10">
                      <span
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${letterClasses}`}
                      >
                        {letter}
                      </span>
                      <span className={`text-base sm:text-lg transition-colors ${textClasses}`}>
                        {decoded}
                      </span>
                    </div>
                    
                    {/* Status icon (Check/Cross) */}
                    <div className="shrink-0 w-6 h-6 flex items-center justify-center relative z-10">
                      <AnimatePresence>
                        {isSelected && !isAnswerLocked && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="w-6 h-6 rounded-full bg-[#7C3AED] flex items-center justify-center"
                          >
                            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                        {isAnswerLocked && isCorrect && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"
                          >
                            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                        {isAnswerLocked && isSelected && !isCorrect && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"
                          >
                            <X className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Keyboard hint */}
        <div className="mt-4 text-center">
          <span className="text-xs text-slate-400 font-medium">
            💡 Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono font-bold">1</kbd>–<kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono font-bold">4</kbd> to select
          </span>
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex justify-end">
          {!isAnswerLocked ? (
            <motion.button
              whileHover={userSelectedAns ? { scale: 1.02 } : {}}
              whileTap={userSelectedAns ? { scale: 0.98 } : {}}
              className="px-8 py-3.5 rounded-xl text-white font-semibold bg-[#7C3AED] hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#7C3AED]/20 transition-all flex items-center gap-2"
              onClick={handleCheckAnswer}
              disabled={!userSelectedAns}
            >
              Check Answer
            </motion.button>
          ) : (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] shadow-lg shadow-[#7C3AED]/20 transition-all flex items-center gap-2"
              onClick={handleNext}
            >
              {questionIndex === data.length - 1 ? 'Finish Quiz' : 'Next Question'}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

Quiz.propTypes = {
  data: PropTypes.array.isRequired,
  countdownTime: PropTypes.number.isRequired,
  endQuiz: PropTypes.func.isRequired,
};

export default Quiz;

import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { useAuth } from '../../contexts/AuthContext';
import { shuffle, calculateScore, calculateGrade } from '../../utils';
import {
  getUserHistory,
  saveQuizAttempt,
  saveToLeaderboard,
} from '../../services/firestoreService';
import useAdaptiveDifficulty from '../../hooks/useAdaptiveDifficulty';

import Layout from '../Layout';
import Login from '../Auth/Login';
import Loader from '../Loader';
import Main from '../Main';
import Quiz from '../Quiz';
import Result from '../Result';
import Leaderboard from '../Leaderboard';
import Dashboard from '../Dashboard';

const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

/* ================================================================== */
/*  QuizFlow — the original 3-screen state machine                    */
/*  Main → Loader → Quiz → Loader → Result                           */
/* ================================================================== */
const QuizFlow = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(null);
  const [data, setData] = useState(null);
  const [countdownTime, setCountdownTime] = useState(null);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [userHistory, setUserHistory] = useState(null);
  const [quizMeta, setQuizMeta] = useState(null);

  const { predictForCategory, retrain, phase: mlPhase } =
    useAdaptiveDifficulty(userHistory);

  /* Load history once on mount */
  useEffect(() => {
    if (user) {
      getUserHistory(user.uid)
        .then(setUserHistory)
        .catch(() => setUserHistory([]));
    }
  }, [user]);

  /* ---- Start Quiz ---- */
  const startQuiz = useCallback((quizData, countdown, meta) => {
    setLoading(true);
    setLoadingMessage({
      title: 'Loading your quiz…',
      message: "It won't be long!",
    });
    setCountdownTime(countdown);
    setQuizMeta(meta);

    setTimeout(() => {
      setData(quizData);
      setIsQuizStarted(true);
      setLoading(false);
    }, 1000);
  }, []);

  /* ---- End Quiz ---- */
  const endQuiz = useCallback(
    (result) => {
      setLoading(true);
      setLoadingMessage({
        title: 'Fetching your results…',
        message: 'Just a moment!',
      });

      const score = calculateScore(result.totalQuestions, result.correctAnswers);
      const { grade, remarks } = calculateGrade(score);
      const accuracy =
        result.totalQuestions > 0
          ? result.correctAnswers / result.totalQuestions
          : 0;
      const avgTimePerQuestion =
        result.timeTaken && result.totalQuestions > 0
          ? result.timeTaken / 1000 / result.totalQuestions
          : 0;

      // Transition UI quickly so the user isn't stuck waiting
      setTimeout(() => {
        setIsQuizStarted(false);
        setIsQuizCompleted(true);
        setResultData({ ...result, score, grade, remarks });
        setLoading(false);
      }, 500);

      if (user && quizMeta) {
        const attemptData = {
          category: quizMeta.categoryName,
          categoryEncoded: quizMeta.categoryEncoded,
          difficulty: quizMeta.difficulty,
          score,
          accuracy,
          avgTimePerQuestion,
          questionCount: result.totalQuestions,
          mlSuggestion: quizMeta.mlSuggestion || null,
          mlAccepted: quizMeta.mlAccepted ?? null,
        };

        // Run Firestore saving and ML retraining in the background!
        (async () => {
          try {
            await saveQuizAttempt(user.uid, attemptData);
            await saveToLeaderboard(
              user.uid,
              user.displayName,
              user.photoURL,
              { ...attemptData, grade }
            );
            // Fire retraining only if not document mode
            if (quizMeta.mode !== 'document') {
              await retrain(attemptData);
            }
            // Refresh history for the dashboard
            const updated = await getUserHistory(user.uid);
            setUserHistory(updated);
          } catch (err) {
            console.error('Background task error:', err);
          }
        })();
      }
    },
    [user, quizMeta, retrain]
  );

  /* ---- Replay (reshuffle same questions) ---- */
  const replayQuiz = useCallback(() => {
    setLoading(true);
    setLoadingMessage({
      title: 'Getting ready for round two.',
      message: "It won't take long!",
    });
    const shuffled = shuffle(data);
    shuffled.forEach((el) => {
      el.options = shuffle(el.options);
    });
    setData(shuffled);
    setTimeout(() => {
      setIsQuizStarted(true);
      setIsQuizCompleted(false);
      setResultData(null);
      setLoading(false);
    }, 1000);
  }, [data]);

  /* ---- Reset to home ---- */
  const resetQuiz = useCallback(() => {
    setLoading(true);
    setLoadingMessage({
      title: 'Loading the home screen.',
      message: 'Thank you for playing!',
    });
    setTimeout(() => {
      setData(null);
      setCountdownTime(null);
      setIsQuizStarted(false);
      setIsQuizCompleted(false);
      setResultData(null);
      setQuizMeta(null);
      setLoading(false);
    }, 1000);
  }, []);

  /* ---- Render ---- */
  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div key="loader" {...pageTransition}>
          <Loader {...loadingMessage} />
        </motion.div>
      )}

      {!loading && !isQuizStarted && !isQuizCompleted && (
        <motion.div key="main" {...pageTransition}>
          <Main
            startQuiz={startQuiz}
            predictForCategory={predictForCategory}
            mlPhase={mlPhase}
          />
        </motion.div>
      )}

      {!loading && isQuizStarted && (
        <motion.div key="quiz" {...pageTransition}>
          <Quiz data={data} countdownTime={countdownTime} endQuiz={endQuiz} meta={quizMeta} />
        </motion.div>
      )}

      {!loading && isQuizCompleted && (
        <motion.div key="result" {...pageTransition}>
          <Result
            {...resultData}
            replayQuiz={replayQuiz}
            resetQuiz={resetQuiz}
            meta={quizMeta}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ================================================================== */
/*  App — auth gate + router shell                                     */
/* ================================================================== */
const App = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0F4FF] to-[#FAF0FF]">
        <Loader title="Loading…" message="Please wait" />
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<QuizFlow />} />
          <Route
            path="/leaderboard"
            element={
              <motion.div {...pageTransition}>
                <Leaderboard />
              </motion.div>
            }
          />
          <Route
            path="/dashboard"
            element={
              <motion.div {...pageTransition}>
                <Dashboard />
              </motion.div>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
};

export default App;

import { useState, useEffect, useCallback, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const DIFFICULTY_MAP = { easy: 0, medium: 1, hard: 2 };
const DIFFICULTY_LABELS = ['easy', 'medium', 'hard'];
const MIN_ATTEMPTS_FOR_ML = 10;

/* ------------------------------------------------------------------ */
/*  Justification for logistic regression:                             */
/*  - 4 features, tiny per-user dataset (<1000 rows)                  */
/*  - Interpretable linear coefficients                                */
/*  - A single Dense(3, softmax) IS multinomial logistic regression    */
/*  - Neural networks are unjustifiable at this scale                  */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Helper: derive the label (recommended next difficulty) from a      */
/*  completed attempt's outcome.                                       */
/*                                                                     */
/*  score >= 80%  → suggest one level harder (clamped to 2)            */
/*  score <= 40%  → suggest one level easier (clamped to 0)            */
/*  otherwise     → suggest same difficulty                            */
/* ------------------------------------------------------------------ */
const deriveLabel = (attempt) => {
  const currentDiffNum = DIFFICULTY_MAP[attempt.difficulty] ?? 1;
  if (attempt.accuracy >= 0.8) return Math.min(currentDiffNum + 1, 2);
  if (attempt.accuracy <= 0.4) return Math.max(currentDiffNum - 1, 0);
  return currentDiffNum;
};

/* ------------------------------------------------------------------ */
/*  Helper: build feature vector for one data point.                   */
/*  Features: [categoryEncoded_norm, pastAccuracy, avgTime_norm,       */
/*             attemptsCount_norm]                                     */
/*  All normalised to approximately [0, 1].                            */
/* ------------------------------------------------------------------ */
const buildFeatures = (categoryEncoded, pastAccuracy, avgTime, attemptsCount, maxTime, maxAttempts) => [
  categoryEncoded / 23,
  pastAccuracy,
  maxTime > 0 ? Math.min(avgTime / maxTime, 1) : 0.5,
  maxAttempts > 0 ? Math.min(attemptsCount / maxAttempts, 1) : 0,
];

/* ------------------------------------------------------------------ */
/*  Helper: generate training data from full history.                  */
/*  For each attempt i:                                                */
/*    features = state known *before* attempt i                        */
/*    label    = derived from the *outcome* of attempt i               */
/* ------------------------------------------------------------------ */
const buildTrainingData = (history) => {
  if (!history || history.length === 0) return { xs: [], ys: [] };

  const maxTime = Math.max(...history.map((h) => h.avgTimePerQuestion), 30);
  const maxAttempts = Math.max(history.length, 1);

  const xs = [];
  const ys = [];

  for (let i = 0; i < history.length; i++) {
    const past = history.slice(0, i);
    const pastAccuracy =
      past.length > 0
        ? past.reduce((s, a) => s + a.accuracy, 0) / past.length
        : 0.5;
    const avgTime =
      past.length > 0
        ? past.reduce((s, a) => s + a.avgTimePerQuestion, 0) / past.length
        : 15;

    xs.push(
      buildFeatures(
        history[i].categoryEncoded,
        pastAccuracy,
        avgTime,
        i,
        maxTime,
        maxAttempts
      )
    );
    ys.push(deriveLabel(history[i]));
  }

  return { xs, ys };
};

/* ================================================================== */
/*  HOOK                                                               */
/* ================================================================== */
const useAdaptiveDifficulty = (userHistory) => {
  const [isModelReady, setIsModelReady] = useState(false);
  const [phase, setPhase] = useState('none'); // 'none' | 'rule-based' | 'ml'
  const modelRef = useRef(null);
  const historySnapshotRef = useRef([]);

  /* ---------------------------------------------------------------- */
  /*  Create and train the logistic regression model.                  */
  /*  Architecture: Dense(3, softmax) — true multinomial logreg.       */
  /* ---------------------------------------------------------------- */
  const trainModel = useCallback(async (xs, ys) => {
    if (xs.length === 0) return null;

    if (modelRef.current) {
      modelRef.current.dispose();
      modelRef.current = null;
    }

    const model = tf.sequential();
    model.add(
      tf.layers.dense({
        inputShape: [4],
        units: 3,
        activation: 'softmax',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.01 }),
      })
    );

    model.compile({
      optimizer: tf.train.adam(0.01),
      loss: 'sparseCategoricalCrossentropy',
      metrics: ['accuracy'],
    });

    const xsTensor = tf.tensor2d(xs);
    const ysTensor = tf.tensor1d(ys, 'int32');

    await model.fit(xsTensor, ysTensor, {
      epochs: 50,
      batchSize: Math.min(xs.length, 32),
      shuffle: true,
      verbose: 0,
    });

    xsTensor.dispose();
    ysTensor.dispose();

    modelRef.current = model;
    return model;
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Run ML prediction for a given category.                          */
  /* ---------------------------------------------------------------- */
  const mlPredict = useCallback(
    (categoryEncoded, history) => {
      if (!modelRef.current || !history || history.length === 0) return null;

      const pastAccuracy =
        history.reduce((s, a) => s + a.accuracy, 0) / history.length;
      const avgTime =
        history.reduce((s, a) => s + a.avgTimePerQuestion, 0) / history.length;
      const maxTime = Math.max(
        ...history.map((h) => h.avgTimePerQuestion),
        30
      );

      const features = buildFeatures(
        categoryEncoded,
        pastAccuracy,
        avgTime,
        history.length,
        maxTime,
        Math.max(history.length, 1)
      );

      const input = tf.tensor2d([features]);
      const prediction = modelRef.current.predict(input);
      const probs = prediction.dataSync();
      input.dispose();
      prediction.dispose();

      const maxProb = Math.max(...probs);
      const idx = Array.from(probs).indexOf(maxProb);

      return {
        difficulty: DIFFICULTY_LABELS[idx],
        confidence: maxProb,
      };
    },
    []
  );

  /* ---------------------------------------------------------------- */
  /*  Rule-based suggestion (cold start: 1–9 attempts).                */
  /*  Looks at the LAST attempt's accuracy to nudge difficulty.        */
  /* ---------------------------------------------------------------- */
  const getRuleBasedSuggestion = useCallback((history) => {
    if (!history || history.length === 0) return null;

    const last = history[history.length - 1];
    const currentNum = DIFFICULTY_MAP[last.difficulty] ?? 1;
    let suggested;

    if (last.accuracy >= 0.8) {
      suggested = Math.min(currentNum + 1, 2);
    } else if (last.accuracy <= 0.4) {
      suggested = Math.max(currentNum - 1, 0);
    } else {
      suggested = currentNum;
    }

    return { difficulty: DIFFICULTY_LABELS[suggested], confidence: null };
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Initialize / retrain whenever userHistory changes.               */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!userHistory) return;

    historySnapshotRef.current = userHistory;

    const run = async () => {
      /* Tier 1 — zero history: no suggestion */
      if (userHistory.length === 0) {
        setPhase('none');
        setIsModelReady(false);
        return;
      }

      /* Tier 2 — 1-9 attempts: rule-based */
      if (userHistory.length < MIN_ATTEMPTS_FOR_ML) {
        setPhase('rule-based');
        setIsModelReady(false);
        return;
      }

      /* Tier 3 — 10+ attempts: train ML model */
      setPhase('ml');
      const { xs, ys } = buildTrainingData(userHistory);
      await trainModel(xs, ys);
      setIsModelReady(true);
    };

    run();
  }, [userHistory, trainModel]);

  /* ---------------------------------------------------------------- */
  /*  Public API: predict difficulty for a chosen category.            */
  /*  Returns an object with difficulty, confidence, phase, message.   */
  /* ---------------------------------------------------------------- */
  const predictForCategory = useCallback(
    (categoryEncoded) => {
      const history = historySnapshotRef.current;

      /* Tier 1: zero history */
      if (!history || history.length === 0) {
        return {
          difficulty: null,
          confidence: null,
          phase: 'none',
          message: null,
        };
      }

      /* Tier 2: rule-based (1–9 attempts) */
      if (history.length < MIN_ATTEMPTS_FOR_ML) {
        const suggestion = getRuleBasedSuggestion(history);
        return {
          difficulty: suggestion?.difficulty ?? null,
          confidence: null,
          phase: 'rule-based',
          message:
            'Not enough data for ML yet \u2014 based on your last attempt',
        };
      }

      /* Tier 3: ML prediction (10+ attempts) */
      if (!modelRef.current) {
        return {
          difficulty: null,
          confidence: null,
          phase: 'ml',
          message: 'Model is training\u2026',
        };
      }

      const result = mlPredict(categoryEncoded, history);
      if (!result) {
        return {
          difficulty: null,
          confidence: null,
          phase: 'ml',
          message: 'Prediction unavailable',
        };
      }

      return {
        difficulty: result.difficulty,
        confidence: result.confidence,
        phase: 'ml',
        message: `AI recommends ${result.difficulty} with ${Math.round(
          result.confidence * 100
        )}% confidence`,
      };
    },
    [mlPredict, getRuleBasedSuggestion]
  );

  /* ---------------------------------------------------------------- */
  /*  Public API: retrain after a new quiz attempt.                    */
  /*  Appends the new data point and refits the entire model.          */
  /* ---------------------------------------------------------------- */
  const retrain = useCallback(
    async (newAttempt) => {
      const updated = [...historySnapshotRef.current, newAttempt];
      historySnapshotRef.current = updated;

      if (updated.length < MIN_ATTEMPTS_FOR_ML) {
        setPhase('rule-based');
        setIsModelReady(false);
        return;
      }

      setPhase('ml');
      const { xs, ys } = buildTrainingData(updated);
      await trainModel(xs, ys);
      setIsModelReady(true);
    },
    [trainModel]
  );

  /* ---------------------------------------------------------------- */
  /*  Cleanup: dispose TF model on unmount.                            */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    return () => {
      if (modelRef.current) {
        modelRef.current.dispose();
        modelRef.current = null;
      }
    };
  }, []);

  return {
    isModelReady,
    phase,
    predictForCategory,
    retrain,
  };
};

export default useAdaptiveDifficulty;

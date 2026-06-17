import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { CATEGORIES } from '../constants';

const withTimeout = (promise, ms, rejectMessage) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(rejectMessage)), ms))
  ]);
};

/* ------------------------------------------------------------------ */
/*  Category encoding helper                                           */
/* ------------------------------------------------------------------ */
export const encodeCategoryValue = (value) => {
  const numVal = Number(value);
  if (numVal >= 9 && numVal <= 32) return numVal - 9;
  return 0;
};

export const getCategoryNameByValue = (value) => {
  const found = CATEGORIES.find(
    (c) => String(c.value) === String(value)
  );
  return found ? found.text : 'Any Category';
};

export const encodeCategoryName = (name) => {
  const found = CATEGORIES.findIndex((c) => c.text === name);
  return found > 0 ? found - 1 : 0;
};

/* ------------------------------------------------------------------ */
/*  Quiz Attempts                                                      */
/* ------------------------------------------------------------------ */
export const saveQuizAttempt = async (userId, attemptData) => {
  const docRef = await addDoc(collection(db, 'quizAttempts'), {
    userId,
    ...attemptData,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
};

export const getUserHistory = async (userId) => {
  const q = query(
    collection(db, 'quizAttempts'),
    where('userId', '==', userId)
  );
  try {
    const snapshot = await withTimeout(getDocs(q), 5000, "Firestore connection timeout");
    const docs = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || new Date(0),
      };
    });
    
    // Sort in memory to avoid needing a Firestore composite index
    return docs.sort((a, b) => a.timestamp - b.timestamp);
  } catch (err) {
    console.error('getUserHistory error:', err);
    throw err;
  }
};

/* ------------------------------------------------------------------ */
/*  Leaderboard                                                        */
/* ------------------------------------------------------------------ */
export const saveToLeaderboard = async (
  userId,
  displayName,
  photoURL,
  attemptData
) => {
  const docId = `${userId}_${attemptData.categoryEncoded}_${attemptData.difficulty}`;
  const docRef = doc(db, 'leaderboard', docId);
  const existing = await getDoc(docRef);

  if (!existing.exists() || existing.data().score < attemptData.score) {
    await setDoc(docRef, {
      userId,
      displayName: displayName || 'Anonymous',
      photoURL: photoURL || '',
      category: attemptData.category,
      categoryEncoded: attemptData.categoryEncoded,
      difficulty: attemptData.difficulty,
      score: attemptData.score,
      accuracy: attemptData.accuracy,
      grade: attemptData.grade,
      timestamp: serverTimestamp(),
    });
  }
};

export const getLeaderboard = async (categoryEncoded, difficulty) => {
  const constraints = [];

  if (
    categoryEncoded !== undefined &&
    categoryEncoded !== null &&
    categoryEncoded !== ''
  ) {
    constraints.push(where('categoryEncoded', '==', Number(categoryEncoded)));
  }

  if (difficulty && difficulty !== '0' && difficulty !== 'all') {
    constraints.push(where('difficulty', '==', difficulty));
  }

  // Removing orderBy('score') to bypass the need for a composite index in Firebase
  const q = query(collection(db, 'leaderboard'), ...constraints);
  
  try {
    const snapshot = await withTimeout(getDocs(q), 5000, "Firestore connection timeout");
    
    const docs = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      timestamp: d.data().timestamp?.toDate?.() || new Date(0),
    }));

    // Sort descending by score in memory, then slice top 50
    docs.sort((a, b) => b.score - a.score);
    
    return docs.slice(0, 50).map((d, index) => ({
      ...d,
      rank: index + 1,
    }));
  } catch (err) {
    console.error('getLeaderboard error:', err);
    throw err;
  }
};

/* ------------------------------------------------------------------ */
/*  User Stats (Dashboard)                                             */
/* ------------------------------------------------------------------ */
export const getUserStats = async (userId) => {
  const history = await getUserHistory(userId);

  if (history.length === 0) {
    return {
      totalQuizzes: 0,
      averageScore: 0,
      bestCategory: null,
      currentStreak: 0,
      categoryAccuracy: {},
      recentQuizzes: [],
      mlAcceptanceRate: 0,
      mlSuggestionCount: 0,
      mlAcceptedCount: 0,
    };
  }

  const categoryAccuracy = {};
  history.forEach((a) => {
    const cat = a.category || 'Unknown';
    if (!categoryAccuracy[cat]) categoryAccuracy[cat] = { total: 0, sumAcc: 0 };
    categoryAccuracy[cat].total += 1;
    categoryAccuracy[cat].sumAcc += a.accuracy;
  });

  const categoryAccuracyFinal = {};
  Object.entries(categoryAccuracy).forEach(([cat, { total, sumAcc }]) => {
    categoryAccuracyFinal[cat] = Math.round((sumAcc / total) * 100);
  });

  const averageScore =
    Math.round(
      (history.reduce((s, a) => s + a.score, 0) / history.length) * 100
    ) / 100;

  let bestCategory = null;
  let bestAcc = -1;
  Object.entries(categoryAccuracyFinal).forEach(([cat, acc]) => {
    if (acc > bestAcc) {
      bestAcc = acc;
      bestCategory = cat;
    }
  });

  let streak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].score >= 60) streak++;
    else break;
  }

  const mlAttempts = history.filter((a) => a.mlSuggestion != null);
  const mlAccepted = mlAttempts.filter((a) => a.mlAccepted === true);

  return {
    totalQuizzes: history.length,
    averageScore,
    bestCategory,
    currentStreak: streak,
    categoryAccuracy: categoryAccuracyFinal,
    recentQuizzes: history.slice(-10),
    mlAcceptanceRate:
      mlAttempts.length > 0
        ? Math.round((mlAccepted.length / mlAttempts.length) * 100)
        : 0,
    mlSuggestionCount: mlAttempts.length,
    mlAcceptedCount: mlAccepted.length,
  };
};

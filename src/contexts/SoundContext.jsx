import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const SoundContext = createContext(null);

export const useSound = () => {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSound must be used within SoundProvider');
  return ctx;
};

const createAudioContext = () => {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  return new AudioCtx();
};

export const SoundProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const stored = localStorage.getItem('quizard-sound');
    return stored !== null ? stored === 'true' : true;
  });

  const audioCtxRef = useRef(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = createAudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback((frequencies, duration, type = 'sine') => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + (i * duration) / frequencies.length);
        osc.connect(gainNode);
        osc.start(ctx.currentTime + (i * duration) / frequencies.length);
        osc.stop(ctx.currentTime + duration);
      });
    } catch (e) {
      // Silently fail if audio not available
    }
  }, [soundEnabled, getAudioContext]);

  const playCorrect = useCallback(() => {
    playTone([523.25, 659.25, 783.99], 0.2, 'sine'); // C5 → E5 → G5
  }, [playTone]);

  const playWrong = useCallback(() => {
    playTone([329.63, 261.63], 0.25, 'triangle'); // E4 → C4
  }, [playTone]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('quizard-sound', String(next));
      return next;
    });
  }, []);

  return (
    <SoundContext.Provider value={{ soundEnabled, toggleSound, playCorrect, playWrong }}>
      {children}
    </SoundContext.Provider>
  );
};

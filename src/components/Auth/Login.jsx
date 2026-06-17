import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const { signInWithGoogle, signUpWithEmail, loginWithEmail, resetPassword } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [signingIn, setSigningIn] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [resetMessage, setResetMessage] = useState(null);

  const clearErrors = () => {
    setGlobalError(null);
    setEmailError(null);
    setPasswordError(null);
    setResetMessage(null);
  };

  const parseFirebaseError = (err) => {
    const code = err.code || '';
    if (code.includes('invalid-email')) setEmailError('Please enter a valid email address.');
    else if (code.includes('user-not-found')) setEmailError('No account found with this email.');
    else if (code.includes('email-already-in-use')) setEmailError('An account already exists with this email.');
    else if (code.includes('wrong-password') || code.includes('invalid-credential')) setPasswordError('Incorrect password. Please try again.');
    else if (code.includes('weak-password')) setPasswordError('Password must be at least 6 characters.');
    else if (code.includes('missing-password')) setPasswordError('Please enter a password.');
    else setGlobalError(err.message || 'An unexpected error occurred. Please try again.');
  };

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    clearErrors();
    try {
      await signInWithGoogle();
    } catch (err) {
      setGlobalError(err.message || 'Failed to sign in with Google.');
    } finally {
      setSigningIn(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email) {
      setEmailError('Please enter your email.');
      return;
    }
    if (!password) {
      setPasswordError('Please enter your password.');
      return;
    }
    
    setSigningIn(true);
    clearErrors();
    
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      parseFirebaseError(err);
    } finally {
      setSigningIn(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setEmailError('Please enter your email address to reset password.');
      return;
    }
    clearErrors();
    setSigningIn(true);
    try {
      await resetPassword(email);
      setResetMessage('Password reset link sent! Check your inbox.');
    } catch (err) {
      parseFirebaseError(err);
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0F4FF] via-[#EDE9FE] to-[#FAF0FF] relative overflow-hidden">
      {/* Decorative Orbs — soft light versions */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#7C3AED]/15 rounded-full blur-3xl orb-1" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#06B6D4]/15 rounded-full blur-3xl orb-2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7C3AED]/5 rounded-full blur-3xl orb-3" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-white/70 backdrop-blur-md border border-white/40 rounded-3xl p-10 shadow-xl text-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-[#7C3AED]/25"
          >
            <Brain className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent mb-2">
            Quizard
          </h1>
          <p className="text-slate-500 mb-8 text-sm font-normal leading-relaxed">
            The ultimate AI-powered trivia quiz.
            <br />
            Sign in to track your progress and compete.
          </p>

          {globalError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-500 text-sm font-medium flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              {globalError}
            </motion.div>
          )}
          
          {resetMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm font-medium flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {resetMessage}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleSignIn}
            disabled={signingIn}
            className="w-full flex items-center justify-center gap-3 bg-white text-[#1E1B4B] font-medium py-4 px-6 rounded-xl transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-slate-100"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {signingIn ? 'Signing in…' : 'Continue with Google'}
          </motion.button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-slate-400 font-medium">or</span>
            </div>
          </div>

          {/* Toggle Login/Signup */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => { setIsSignUp(false); clearErrors(); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isSignUp ? 'bg-white text-[#1E1B4B] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Log In
            </button>
            <button
              onClick={() => { setIsSignUp(true); clearErrors(); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isSignUp ? 'bg-white text-[#1E1B4B] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleEmailAuth} className="text-left mb-2">
            <div className="mb-4 relative">
              <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2 font-bold ml-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                  placeholder="you@example.com"
                  className={`w-full h-12 bg-white/80 border ${emailError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-[#7C3AED] focus:border-[#7C3AED]'} rounded-xl pl-11 pr-4 text-[#1E1B4B] focus:outline-none focus:ring-2 transition-all font-medium`}
                />
              </div>
              <AnimatePresence>
                {emailError && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-xs font-medium mt-1.5 ml-1">
                    {emailError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="mb-6 relative">
              <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2 font-bold ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(null); }}
                  placeholder="••••••••"
                  className={`w-full h-12 bg-white/80 border ${passwordError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-[#7C3AED] focus:border-[#7C3AED]'} rounded-xl pl-11 pr-4 text-[#1E1B4B] focus:outline-none focus:ring-2 transition-all font-medium`}
                />
              </div>
              <AnimatePresence>
                {passwordError && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-xs font-medium mt-1.5 ml-1">
                    {passwordError}
                  </motion.p>
                )}
              </AnimatePresence>
              
              {!isSignUp && (
                <div className="flex justify-end mt-2">
                  <button type="button" onClick={handlePasswordReset} className="text-xs font-bold text-[#7C3AED] hover:text-[#06B6D4] transition-colors">
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={signingIn}
              className="w-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-bold py-3.5 px-6 rounded-xl transition-all hover:shadow-lg hover:shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {signingIn ? 'Please wait…' : (isSignUp ? 'Create Account' : 'Continue with Email')}
            </motion.button>
          </form>

          <p className="mt-6 text-xs text-slate-400 font-normal">
            By signing in, you agree to our terms of service.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

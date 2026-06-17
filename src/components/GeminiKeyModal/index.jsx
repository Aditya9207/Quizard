import { getGeminiKey, removeGeminiKey, saveGeminiKey } from '../../services/geminiService';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Key, AlertTriangle } from 'lucide-react';

const GeminiKeyModal = ({ onKeySaved, errorMessage }) => {
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSave = () => {
    if (!keyInput.trim()) {
      setLocalError('API Key cannot be empty');
      return;
    }
    saveGeminiKey(keyInput.trim());
    onKeySaved();
  };

  const displayError = errorMessage || localError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#7C3AED]/20 to-[#06B6D4]/20 rounded-full blur-3xl -mr-16 -mt-16" />
        
        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-[#7C3AED]/20 mb-6">
            <Key className="w-6 h-6 text-white" />
          </div>

          <h2 className="text-2xl font-black text-[#1E1B4B] mb-2">Enter Your Gemini API Key</h2>
          <p className="text-slate-500 text-sm mb-1">
            Your key is stored locally in your browser and never sent to our servers.
          </p>
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#7C3AED] hover:text-violet-700 underline mb-6 inline-block"
          >
            Get a free key at aistudio.google.com
          </a>

          <div className="mb-6 relative">
            <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value);
                  setLocalError('');
                }}
                className="w-full h-12 bg-white border border-slate-200 rounded-xl pl-4 pr-12 text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent font-medium"
                placeholder="AIza..."
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {displayError && (
              <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-500">
                <AlertTriangle className="w-3.5 h-3.5" />
                {displayError}
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            className="w-full text-base font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white shadow-lg hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all"
          >
            Save & Continue
          </button>
          
          <p className="text-center text-[11px] text-slate-400 mt-5 font-medium">
            Want to use a different key? You can reset it in settings.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

GeminiKeyModal.propTypes = {
  onKeySaved: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
};

export default GeminiKeyModal;

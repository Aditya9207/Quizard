import React, { Fragment, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X } from 'lucide-react';

const ShareButton = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleNativeShare = () => {
    navigator
      .share({
        title: document.title,
        text: 'Check out Quizard — it rocks!',
        url: window.location.origin,
      })
      .catch(() => {});
  };

  if (typeof navigator !== 'undefined' && navigator.share) {
    return (
      <button
        onClick={handleNativeShare}
        className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-medium shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
        title="Share"
      >
        <Share2 className="w-4 h-4" /> Share
      </button>
    );
  }

  return (
    <Fragment>
      <button
        onClick={() => setModalOpen(true)}
        className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-medium shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
        title="Share"
      >
        <Share2 className="w-4 h-4" /> Share
      </button>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 w-full max-w-xs text-center relative"
            >
              <button 
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-[#1E1B4B] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-bold text-[#1E1B4B] mb-6">
                Share Quizard
              </h3>
              <div className="flex flex-col gap-3">
                <a
                  href={`https://www.facebook.com/sharer.php?u=${encodeURIComponent(window.location.origin)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1877F2] text-white font-medium hover:bg-opacity-90 transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg> Facebook
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent('Check out Quizard — it rocks!')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1DA1F2] text-white font-medium hover:bg-opacity-90 transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg> Twitter
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.origin)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0A66C2] text-white font-medium hover:bg-opacity-90 transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg> LinkedIn
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Fragment>
  );
};

export default ShareButton;

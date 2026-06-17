import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, Type, AlertTriangle, CheckCircle2, Play } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { generateQuestionsFromText } from '../../services/geminiService';

import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const DocumentUpload = ({ onQuestionsGenerated }) => {
  const [activeTab, setActiveTab] = useState('pdf'); // 'pdf' or 'text'
  const [pdfText, setPdfText] = useState('');
  const [pdfMeta, setPdfMeta] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  


  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setPdfText('');
    setPdfMeta(null);

    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be 5MB or less.');
      return;
    }

    setIsExtracting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      let fullText = '';

      for (let i = 1; i <= numPages; i++) {
        setExtractProgress(`Extracting text... page ${i} of ${numPages}`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + ' ';
      }

      setPdfText(fullText.trim());
      setPdfMeta({
        name: file.name,
        pages: numPages,
        chars: fullText.trim().length,
      });
    } catch (err) {
      console.error(err);
      setError('Failed to extract text from PDF. It might be scanned or encrypted.');
    } finally {
      setIsExtracting(false);
      setExtractProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    setError('');
    
    const content = activeTab === 'pdf' ? pdfText : pastedText;
    if (content.length < 200) {
      setError('Please provide at least 200 characters of text to generate a meaningful quiz.');
      return;
    }



    setIsGenerating(true);
    try {
      const questions = await generateQuestionsFromText(content, questionCount);
      onQuestionsGenerated(questions);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while generating questions.');
    } finally {
      setIsGenerating(false);
    }
  };

  const hasValidContent = activeTab === 'pdf' ? pdfText.length >= 200 : pastedText.length >= 200;

  return (
    <div className="glass-card p-8 sm:p-12 relative flex flex-col min-h-[560px]">
      
      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl mb-8 self-center w-full max-w-sm">
        <button
          onClick={() => { setActiveTab('pdf'); setError(''); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'pdf' ? 'bg-white text-[#1E1B4B] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <FileText className="w-4 h-4" /> Upload PDF
        </button>
        <button
          onClick={() => { setActiveTab('text'); setError(''); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'text' ? 'bg-white text-[#1E1B4B] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Type className="w-4 h-4" /> Paste Text
        </button>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-3 overflow-hidden"
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="font-medium flex-1">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Area */}
      <div className="flex-1">
        {activeTab === 'pdf' ? (
          <div>
            {!pdfMeta && !isExtracting && (
              <label className="border-2 border-dashed border-slate-300 rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:border-[#7C3AED] transition-colors group">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#7C3AED]/10 transition-colors">
                  <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-[#7C3AED] transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-[#1E1B4B] mb-2">Upload your PDF</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                  Drag and drop your file here, or click to browse. Maximum size: 5MB.
                </p>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                />
              </label>
            )}

            {isExtracting && (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                <svg className="animate-spin w-8 h-8 text-[#7C3AED] mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-[#1E1B4B] font-semibold">{extractProgress}</p>
              </div>
            )}

            {pdfMeta && !isExtracting && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1E1B4B] truncate max-w-[200px] sm:max-w-xs" title={pdfMeta.name}>
                        {pdfMeta.name}
                      </h4>
                      <p className="text-xs font-medium text-slate-500">
                        {pdfMeta.pages} pages • {pdfMeta.chars.toLocaleString()} characters
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setPdfMeta(null); setPdfText(''); }}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 underline"
                  >
                    Remove
                  </button>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Preview</p>
                  <p className="text-sm text-slate-600 line-clamp-3">
                    {pdfText.substring(0, 300)}...
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <textarea
              className="w-full h-48 bg-white/80 border border-slate-200 rounded-2xl p-4 text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent resize-none"
              placeholder="Paste your notes, article, or any text here..."
              value={pastedText}
              onChange={(e) => {
                setPastedText(e.target.value);
                if (error) setError('');
              }}
            />
            <div className="mt-2 text-right text-xs font-medium text-slate-400">
              {pastedText.length} characters
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="mt-8 pt-8 border-t border-slate-200/60">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-1/3">
            <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">
              Questions
            </label>
            <select
              className="w-full h-12 bg-white/80 border border-slate-200 rounded-xl px-4 text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent appearance-none font-medium text-base"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              disabled={isGenerating}
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
            </select>
          </div>
          <div className="w-full sm:w-2/3 self-end">
            <motion.button
              whileHover={hasValidContent && !isGenerating ? { scale: 1.02 } : {}}
              whileTap={hasValidContent && !isGenerating ? { scale: 0.98 } : {}}
              onClick={handleGenerate}
              disabled={!hasValidContent || isGenerating}
              className={`w-full h-12 rounded-xl flex items-center justify-center gap-2 text-white font-bold shadow-lg transition-all
                ${hasValidContent && !isGenerating 
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] animate-pulse-glow' 
                  : 'bg-slate-300 shadow-none cursor-not-allowed'
                }`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  Generate Quiz
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>


    </div>
  );
};

DocumentUpload.propTypes = {
  onQuestionsGenerated: PropTypes.func.isRequired,
};

export default DocumentUpload;

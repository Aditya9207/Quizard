import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const QNA = ({ questionsAndAnswers }) => {
  return (
    <div className="glass-card overflow-hidden">
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-16">
                #
              </th>
              <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Question
              </th>
              <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Your Answer
              </th>
              <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Correct Answer
              </th>
              <th className="text-center p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-24">
                Result
              </th>
            </tr>
          </thead>
          <tbody>
            {questionsAndAnswers.map((item, i) => {
              const isCorrect = item.point === 1;
              return (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`border-b border-slate-100 ${
                    isCorrect
                      ? 'bg-emerald-50/50 border-l-4 border-l-emerald-500'
                      : 'bg-red-50/50 border-l-4 border-l-red-400'
                  }`}
                >
                  <td className="p-4 font-mono font-medium text-slate-400 pl-6">{i + 1}</td>
                  <td className="p-4 text-[#1E1B4B] font-medium max-w-md">
                    {item.question}
                  </td>
                  <td className={`p-4 font-medium ${isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={3} />
                      ) : (
                        <X className="w-4 h-4 text-red-400 shrink-0" strokeWidth={3} />
                      )}
                      <span>{item.user_answer}</span>
                    </div>
                  </td>
                  <td className="p-4 text-emerald-600 font-bold">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={3} />
                      <span>{item.correct_answer}</span>
                    </div>
                  </td>
                  <td className="p-4 flex justify-center">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {isCorrect ? '✓ Correct' : '✗ Wrong'}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <div className="sm:hidden divide-y divide-slate-100">
        {questionsAndAnswers.map((item, i) => {
          const isCorrect = item.point === 1;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-5 border-l-4 ${
                isCorrect ? 'bg-emerald-50/50 border-l-emerald-500' : 'bg-red-50/50 border-l-red-400'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Q{i + 1}</span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                  }`}
                >
                  {isCorrect ? '✓ Correct' : '✗ Wrong'}
                </span>
              </div>
              <p className="text-base font-semibold text-[#1E1B4B] mb-4 leading-relaxed">
                {item.question}
              </p>
              <div className="text-sm space-y-2 bg-white/80 p-3 rounded-xl border border-slate-100">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold shrink-0">Your Answer</span>
                  <span
                    className={`font-medium text-right flex items-center gap-1 ${
                      isCorrect ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {isCorrect ? <Check className="w-3 h-3 shrink-0" strokeWidth={3} /> : <X className="w-3 h-3 shrink-0" strokeWidth={3} />}
                    {item.user_answer}
                  </span>
                </div>
                {!isCorrect && (
                  <div className="flex justify-between items-start gap-4 pt-2 border-t border-slate-100">
                    <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold shrink-0">Correct</span>
                    <span className="text-emerald-600 font-bold text-right flex items-center gap-1">
                      <Check className="w-3 h-3 shrink-0" strokeWidth={3} />
                      {item.correct_answer}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

QNA.propTypes = {
  questionsAndAnswers: PropTypes.array.isRequired,
};

export default QNA;

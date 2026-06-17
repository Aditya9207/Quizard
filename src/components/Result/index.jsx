import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { BarChart3, ListChecks } from 'lucide-react';

import Stats from './Stats';
import QNA from './QNA';

const Result = ({
  totalQuestions,
  correctAnswers,
  timeTaken,
  questionsAndAnswers,
  score,
  grade,
  remarks,
  replayQuiz,
  resetQuiz,
}) => {
  const [activeTab, setActiveTab] = useState('Stats');

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tab bar */}
      <div className="flex bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl p-1.5 mb-8 shadow-lg">
        {[
          { id: 'Stats', label: 'Statistics', icon: BarChart3 },
          { id: 'QNA', label: 'Review Answers', icon: ListChecks }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === tab.id
                ? 'bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white shadow-lg shadow-[#7C3AED]/20'
                : 'text-slate-500 hover:text-[#1E1B4B] hover:bg-white/50'
                }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'Stats' && (
        <Stats
          totalQuestions={totalQuestions}
          correctAnswers={correctAnswers}
          timeTaken={timeTaken}
          score={score}
          grade={grade}
          remarks={remarks}
          replayQuiz={replayQuiz}
          resetQuiz={resetQuiz}
        />
      )}
      {activeTab === 'QNA' && <QNA questionsAndAnswers={questionsAndAnswers} />}
    </div>
  );
};

Result.propTypes = {
  totalQuestions: PropTypes.number.isRequired,
  correctAnswers: PropTypes.number.isRequired,
  timeTaken: PropTypes.number.isRequired,
  questionsAndAnswers: PropTypes.array.isRequired,
  score: PropTypes.number,
  grade: PropTypes.string,
  remarks: PropTypes.string,
  replayQuiz: PropTypes.func.isRequired,
  resetQuiz: PropTypes.func.isRequired,
};

export default Result;

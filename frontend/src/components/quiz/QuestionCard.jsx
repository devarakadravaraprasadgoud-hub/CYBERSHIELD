import React from 'react';
import { Flag, CheckCircle, XCircle, Info } from 'lucide-react';

export const QuestionCard = ({
  question,
  questionIndex,
  totalQuestions,
  selectedOptionId,
  onSelectOption,
  isFlagged,
  onToggleFlag,
  isReviewMode = false,
  reviewResult = null
}) => {
  if (!question) return null;

  return (
    <div className="cyber-card rounded-2xl p-6 sm:p-8 bg-white border border-[#E5E7EB]">
      {/* Header with question count and flag */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-lg bg-[#EDE9FE] border border-[#DDD6FE] text-[#6D28D9] font-mono text-xs font-bold">
            QUESTION {questionIndex + 1} OF {totalQuestions}
          </span>
          <span className="text-xs font-medium text-[#64748B]">
            {question.points || 1} {(question.points || 1) === 1 ? 'Point' : 'Points'}
          </span>
        </div>

        {!isReviewMode && onToggleFlag && (
          <button
            type="button"
            onClick={onToggleFlag}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              isFlagged
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'border-[#E5E7EB] text-[#64748B] hover:text-[#1E1B4B] hover:border-[#DDD6FE]'
            }`}
          >
            <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-500 text-amber-500' : ''}`} />
            {isFlagged ? 'Flagged for Review' : 'Flag'}
          </button>
        )}
      </div>

      {/* Question Text */}
      <h3 className="text-lg sm:text-xl font-bold text-[#1E1B4B] mb-6 leading-relaxed">
        {question.questionText}
      </h3>

      {/* Answer Options */}
      <div className="space-y-3 mb-6">
        {question.options?.map((option, idx) => {
          const isSelected = selectedOptionId === option.id;
          const letter = String.fromCharCode(65 + idx);

          let optionStyle =
            'border-[#E5E7EB] bg-white hover:border-[#DDD6FE] hover:bg-[#FAF8FF] text-[#1E1B4B]';

          if (isReviewMode) {
            const isCorrectAnswer = reviewResult?.correctOptionId === option.id;
            const isUserWrongChoice = isSelected && !isCorrectAnswer;

            if (isCorrectAnswer) {
              optionStyle =
                'border-emerald-300 bg-emerald-50 text-emerald-900 shadow-xs';
            } else if (isUserWrongChoice) {
              optionStyle =
                'border-rose-300 bg-rose-50 text-rose-900 shadow-xs';
            } else {
              optionStyle = 'border-[#E5E7EB] bg-slate-50 text-slate-400 opacity-60';
            }
          } else if (isSelected) {
            optionStyle =
              'border-[#8B5CF6] bg-[#EDE9FE] text-[#1E1B4B] shadow-xs ring-1 ring-[#8B5CF6]';
          }

          return (
            <button
              key={option.id}
              type="button"
              disabled={isReviewMode}
              onClick={() => onSelectOption && onSelectOption(option.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-150 ${optionStyle}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-colors ${
                  isReviewMode
                    ? reviewResult?.correctOptionId === option.id
                      ? 'bg-emerald-200 text-emerald-800 border border-emerald-300 font-extrabold'
                      : isSelected
                      ? 'bg-rose-200 text-rose-800 border border-rose-300 font-extrabold'
                      : 'bg-slate-100 text-slate-400'
                    : isSelected
                    ? 'bg-[#6D28D9] text-white font-extrabold'
                    : 'bg-slate-100 text-[#475569] border border-slate-200'
                }`}
              >
                {letter}
              </div>
              <span className="text-sm sm:text-base font-medium flex-1 leading-snug">
                {option.text}
              </span>
              {isReviewMode && reviewResult?.correctOptionId === option.id && (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              {isReviewMode && isSelected && reviewResult?.correctOptionId !== option.id && (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Review Mode Explanation Box */}
      {isReviewMode && reviewResult && (
        <div className="mt-6 p-4 sm:p-5 rounded-xl border border-[#DDD6FE] bg-[#F5F3FF]">
          <div className="flex items-center gap-2 text-[#6D28D9] font-bold text-sm mb-2 font-mono">
            <Info className="w-4 h-4" />
            <span>EXPLANATION & ANALYSIS</span>
          </div>
          <p className="text-sm text-[#475569] leading-relaxed">{reviewResult.explanation}</p>
        </div>
      )}
    </div>
  );
};

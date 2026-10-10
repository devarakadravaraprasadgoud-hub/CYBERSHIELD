import React from 'react';

export const QuizNavGrid = ({
  questions = [],
  currentIndex = 0,
  answers = {},
  flaggedIndices = new Set(),
  onSelectIndex
}) => {
  return (
    <div className="cyber-card rounded-2xl p-5 bg-white border border-[#E5E7EB]">
      <h4 className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-bold mb-3">
        Question Matrix
      </h4>
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, idx) => {
          const isCurrent = currentIndex === idx;
          const isAnswered = !!answers[q._id];
          const isFlagged = flaggedIndices.has(idx);

          let btnClass = 'bg-slate-50 border-[#E5E7EB] text-[#64748B] hover:border-[#DDD6FE] hover:bg-[#FAF8FF]';
          if (isCurrent) {
            btnClass = 'bg-[#6D28D9] border-[#5B21B6] text-white ring-2 ring-[#DDD6FE] font-bold';
          } else if (isAnswered) {
            btnClass = 'bg-[#EDE9FE] border-[#C4B5FD] text-[#6D28D9] font-medium';
          }

          return (
            <button
              key={q._id || idx}
              type="button"
              onClick={() => onSelectIndex(idx)}
              className={`relative h-10 rounded-xl border flex items-center justify-center font-mono text-xs transition active:scale-95 ${btnClass}`}
            >
              <span>{idx + 1}</span>
              {isFlagged && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-[#E5E7EB] flex flex-wrap gap-3 text-[11px] text-[#64748B]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-[#EDE9FE] border border-[#C4B5FD]" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-slate-50 border border-[#E5E7EB]" />
          <span>Unanswered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Flagged</span>
        </div>
      </div>
    </div>
  );
};

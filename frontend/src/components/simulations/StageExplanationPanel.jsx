import React, { useState } from 'react';
import {
  HelpCircle,
  AlertTriangle,
  Eye,
  Zap,
  ShieldCheck,
  Award,
  ChevronDown,
  ChevronUp,
  Terminal,
  Info,
  CheckCircle2
} from 'lucide-react';

export const StageExplanationPanel = ({ stage, mode = 'attack' }) => {
  const [showTechnical, setShowTechnical] = useState(false);

  if (!stage) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs text-center text-[#64748B]">
        <Info className="w-6 h-6 mx-auto mb-2 text-[#8B5CF6]" />
        <p className="text-sm font-medium">Select a stage node to inspect in-depth explanations.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden flex flex-col">
      {/* Panel Header */}
      <div className="bg-[#FAF8FF] px-6 py-4 border-b border-[#DDD6FE] flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase border ${
                mode === 'attack'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              Stage {stage.stageNumber} • {mode === 'attack' ? 'Attack Vector' : 'Defense Action'}
            </span>
          </div>
          <h3 className="text-base font-extrabold text-[#1E1B4B]">{stage.title}</h3>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="p-6 space-y-5 overflow-y-auto max-h-[620px] text-xs leading-relaxed">
        {/* 1. What is happening? */}
        <div className="p-4 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] space-y-1.5">
          <h4 className="font-bold text-[#6D28D9] flex items-center gap-1.5 uppercase font-mono text-[11px] tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-[#6D28D9]" />
            <span>What is happening?</span>
          </h4>
          <p className="text-[#1E1B4B] font-medium leading-relaxed">
            {stage.whatIsHappening || stage.description}
          </p>
        </div>

        {/* 2. Why can this happen? */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
          <h4 className="font-bold text-amber-900 flex items-center gap-1.5 uppercase font-mono text-[11px] tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Why can this happen?</span>
          </h4>
          <p className="text-amber-950 leading-relaxed">
            {stage.whyCanThisHappen}
          </p>
        </div>

        {/* 3. What should you notice? */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
          <h4 className="font-bold text-blue-900 flex items-center gap-1.5 uppercase font-mono text-[11px] tracking-wider">
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>What should you notice?</span>
          </h4>
          <p className="text-blue-950 leading-relaxed">
            {stage.whatShouldYouNotice}
          </p>
          {stage.warningSigns?.length > 0 && (
            <ul className="space-y-1 pt-1 border-t border-blue-200/60">
              {stage.warningSigns.map((sign, idx) => (
                <li key={idx} className="flex items-center gap-1.5 text-blue-900 font-mono text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>{sign}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 4. What could be the impact? */}
        <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1.5">
          <h4 className="font-bold text-rose-900 flex items-center gap-1.5 uppercase font-mono text-[11px] tracking-wider">
            <Zap className="w-3.5 h-3.5 text-rose-600" />
            <span>What could be the impact?</span>
          </h4>
          <p className="text-rose-950 leading-relaxed">
            {stage.whatCouldBeImpact}
          </p>
        </div>

        {/* 5. How can it be prevented? */}
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
          <h4 className="font-bold text-emerald-900 flex items-center gap-1.5 uppercase font-mono text-[11px] tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>How can it be prevented?</span>
          </h4>
          <p className="text-emerald-950 leading-relaxed">
            {stage.howCanItBePrevented}
          </p>
        </div>

        {/* 6. Real-World Lesson */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#EDE9FE] to-[#FAF8FF] border border-[#DDD6FE] space-y-1.5">
          <h4 className="font-bold text-[#6D28D9] flex items-center gap-1.5 uppercase font-mono text-[11px] tracking-wider">
            <Award className="w-3.5 h-3.5 text-[#6D28D9]" />
            <span>Real-World Lesson</span>
          </h4>
          <p className="text-[#1E1B4B] font-semibold leading-relaxed">
            {stage.realWorldLesson}
          </p>
        </div>

        {/* Optional Collapsible Technical Details */}
        {stage.technicalDetails && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowTechnical(!showTechnical)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900 text-white font-mono text-[11px] hover:bg-slate-800 transition"
            >
              <span className="flex items-center gap-2 text-cyan-400">
                <Terminal className="w-3.5 h-3.5" />
                <span>Technical Implementation & Payload Protocol</span>
              </span>
              {showTechnical ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showTechnical && (
              <div className="mt-2 p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-emerald-400 font-mono text-[11px] leading-relaxed break-all animate-fadeIn">
                {stage.technicalDetails}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

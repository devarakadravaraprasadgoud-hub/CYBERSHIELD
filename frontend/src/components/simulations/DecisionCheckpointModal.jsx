import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Shield,
  ShieldCheck,
  XCircle
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const DecisionCheckpointModal = ({
  isOpen,
  checkpoint,
  onSubmitDecision,
  onContinue
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  if (!isOpen || !checkpoint) return null;

  const selectedOption = checkpoint.options?.find((o) => o.id === selectedOptionId);

  const handleSubmit = () => {
    if (!selectedOption) return;
    setHasSubmitted(true);
    if (onSubmitDecision) {
      onSubmitDecision({
        question: checkpoint.question,
        selectedOptionId: selectedOption.id,
        isCorrect: selectedOption.isCorrect,
        explanation: selectedOption.explanation
      });
    }
  };

  const handleRetry = () => {
    setSelectedOptionId('');
    setHasSubmitted(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      title="Decision Checkpoint: Action Required"
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Checkpoint Question Header */}
        <div className="p-4 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#EDE9FE] text-[#6D28D9] shrink-0 mt-0.5">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6D28D9]">
              Interactive Security Decision
            </span>
            <h4 className="text-sm font-bold text-[#1E1B4B] mt-0.5 leading-snug">
              {checkpoint.question}
            </h4>
          </div>
        </div>

        {/* Options List */}
        {!hasSubmitted ? (
          <div className="space-y-2.5">
            <label className="block text-xs font-mono font-bold uppercase text-[#64748B]">
              Select your defensive reaction:
            </label>
            {checkpoint.options?.map((opt) => (
              <div
                key={opt.id}
                onClick={() => setSelectedOptionId(opt.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  selectedOptionId === opt.id
                    ? 'bg-[#EDE9FE] border-[#8B5CF6] shadow-xs ring-2 ring-[#8B5CF6]/30'
                    : 'bg-white border-[#E5E7EB] hover:bg-[#FAF8FF]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    selectedOptionId === opt.id
                      ? 'border-[#6D28D9] bg-[#6D28D9]'
                      : 'border-slate-300'
                  }`}
                >
                  {selectedOptionId === opt.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <p className="text-xs font-medium text-[#1E1B4B] leading-relaxed">
                  {opt.text}
                </p>
              </div>
            ))}

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                disabled={!selectedOptionId}
                onClick={handleSubmit}
                className="px-5 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold transition shadow-md shadow-purple-500/20 active:scale-95"
              >
                Confirm Decision
              </button>
            </div>
          </div>
        ) : (
          /* Consequence & Educational Feedback */
          <div className="space-y-4 animate-fadeIn">
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                selectedOption?.isCorrect
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              {selectedOption?.isCorrect ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <h5 className="text-xs font-bold font-mono uppercase tracking-wider">
                  {selectedOption?.isCorrect
                    ? 'Recommended Defensive Practice'
                    : 'Risky Decision — Security Consequence'}
                </h5>
                <p className="text-xs leading-relaxed font-medium">
                  {selectedOption?.explanation}
                </p>
                {selectedOption?.consequence && (
                  <p className="text-[11px] pt-1 opacity-90 italic">
                    <strong>Simulated Consequence:</strong> {selectedOption.consequence}
                  </p>
                )}
              </div>
            </div>

            {/* Decision Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
              {!selectedOption?.isCorrect ? (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-[#475569] text-xs font-semibold hover:bg-[#F5F3FF] transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Different Response</span>
                </button>
              ) : (
                <span className="text-[11px] text-[#15803D] font-mono font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Points Awarded (+25 XP)</span>
                </span>
              )}

              <button
                type="button"
                onClick={onContinue}
                className="px-5 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-500/20 active:scale-95"
              >
                <span>Continue Simulation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const SimulationSummaryModal = ({
  isOpen,
  simulation,
  mode = 'attack',
  score = 100,
  onReplayMode,
  onClose
}) => {
  if (!isOpen || !simulation) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Simulation Complete: Threat Analyzed"
      maxWidth="max-w-lg"
    >
      <div className="space-y-6 text-center">
        {/* Badge & Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-500/25">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-[#1E1B4B]">
            {mode === 'attack' ? 'Attack Execution Analyzed!' : 'Defensive Controls Mastered!'}
          </h3>
          <p className="text-xs text-[#475569] mt-1.5 max-w-sm mx-auto leading-relaxed">
            You investigated all stages of <strong className="text-[#1E1B4B]">{simulation.title}</strong> and discovered how architectural weaknesses enable threats.
          </p>
        </div>

        {/* Telemetry Stats Card */}
        <div className="grid grid-cols-2 gap-3 bg-[#FAF8FF] p-4 rounded-2xl border border-[#DDD6FE]">
          <div className="p-3 bg-white rounded-xl border border-[#E5E7EB]">
            <span className="text-[10px] font-mono uppercase text-[#64748B] font-bold block">
              Simulation Score
            </span>
            <span className="text-xl font-mono font-extrabold text-[#6D28D9]">
              {score}%
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-[#E5E7EB]">
            <span className="text-[10px] font-mono uppercase text-[#64748B] font-bold block">
              Mitigation Status
            </span>
            <span className="text-xl font-mono font-extrabold text-[#15803D]">
              Verified
            </span>
          </div>
        </div>

        {/* Learning Objectives Checkmarks */}
        {simulation.learningObjectives?.length > 0 && (
          <div className="text-left space-y-2">
            <span className="text-[11px] font-mono uppercase font-bold text-[#64748B]">
              Mastered Objectives:
            </span>
            <div className="space-y-1.5">
              {simulation.learningObjectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[#475569]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-4 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3">
          {mode === 'attack' ? (
            <button
              type="button"
              onClick={() => onReplayMode && onReplayMode('defense')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#DDD6FE] bg-[#FAF8FF] hover:bg-[#EDE9FE] text-[#6D28D9] text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Replay in Defense Mode</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onReplayMode && onReplayMode('attack')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#DDD6FE] bg-[#FAF8FF] hover:bg-[#EDE9FE] text-[#6D28D9] text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Replay Attack Vector</span>
            </button>
          )}

          <Link
            to="/learner/watch-how-it-happens"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/20 active:scale-95"
          >
            <span>Explore More Attacks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </Modal>
  );
};

import React from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  FastForward,
  Sliders,
  Sparkles
} from 'lucide-react';

export const SimulationPlaybackControls = ({
  isPlaying = false,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onRestart,
  canPrev = false,
  canNext = false,
  currentStageIndex = 0,
  totalStages = 1,
  speed = 1,
  onSpeedChange,
  mode = 'attack', // 'attack' | 'defense'
  onToggleMode,
  reducedMotion = false,
  onToggleReducedMotion
}) => {
  const speeds = [0.5, 1, 1.5, 2];
  const progressPercent =
    totalStages > 0
      ? Math.round(((currentStageIndex + 1) / totalStages) * 100)
      : 0;

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs space-y-3">
      {/* Upper Bar: Mode Toggle + Stage Indicator + Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        {/* Attack vs Defense Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF8FF] border border-[#DDD6FE] rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onToggleMode && onToggleMode('attack')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'attack'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#1E1B4B] hover:bg-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Attack Mode</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleMode && onToggleMode('defense')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'defense'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#1E1B4B] hover:bg-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Defense Mode</span>
          </button>
        </div>

        {/* Progress Counter & Bar */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] font-mono font-bold text-[#64748B] block">
              Stage {Math.min(currentStageIndex + 1, totalStages)} of {totalStages}
            </span>
            <span className="text-[10px] text-[#94A3B8] font-mono">
              {progressPercent}% Complete
            </span>
          </div>

          <div className="w-28 sm:w-36 h-2.5 rounded-full bg-[#EDE9FE] overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                mode === 'attack' ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lower Bar: Playback Buttons + Speed Options */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Main Transport Buttons */}
        <div className="flex items-center gap-2">
          {/* Restart */}
          <button
            type="button"
            onClick={onRestart}
            className="p-2 rounded-xl border border-[#E5E7EB] text-[#64748B] hover:text-[#1E1B4B] hover:bg-[#F5F3FF] transition active:scale-95"
            title="Restart to Stage 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Previous Step */}
          <button
            type="button"
            onClick={onPrev}
            disabled={!canPrev}
            className="px-3 py-2 rounded-xl border border-[#E5E7EB] text-[#475569] text-xs font-bold hover:bg-[#F5F3FF] disabled:opacity-40 disabled:pointer-events-none transition flex items-center gap-1 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev Stage</span>
          </button>

          {/* Play / Pause Primary Button */}
          <button
            type="button"
            onClick={isPlaying ? onPause : onPlay}
            className={`px-5 py-2 rounded-xl text-white text-xs font-bold transition flex items-center gap-2 active:scale-95 shadow-sm ${
              mode === 'attack'
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Play Simulation</span>
              </>
            )}
          </button>

          {/* Next Step */}
          <button
            type="button"
            onClick={onNext}
            disabled={!canNext}
            className="px-3 py-2 rounded-xl border border-[#E5E7EB] text-[#475569] text-xs font-bold hover:bg-[#F5F3FF] disabled:opacity-40 disabled:pointer-events-none transition flex items-center gap-1 active:scale-95"
          >
            <span className="hidden sm:inline">Next Stage</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector & Reduced Motion */}
        <div className="flex items-center gap-3">
          {/* Speed Pills */}
          <div className="flex items-center gap-1 bg-[#FAF8FF] border border-[#DDD6FE] p-1 rounded-xl">
            <span className="text-[10px] font-mono text-[#64748B] px-1 font-bold">Speed:</span>
            {speeds.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSpeedChange && onSpeedChange(s)}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition ${
                  speed === s
                    ? 'bg-[#6D28D9] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#1E1B4B]'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Reduced Motion Toggle */}
          <button
            type="button"
            onClick={onToggleReducedMotion}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono font-medium transition ${
              reducedMotion
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-white text-[#64748B] border-[#E5E7EB] hover:bg-[#F5F3FF]'
            }`}
            title="Toggle reduced motion for accessibility"
          >
            {reducedMotion ? 'Static Mode' : 'Animated'}
          </button>
        </div>
      </div>
    </div>
  );
};

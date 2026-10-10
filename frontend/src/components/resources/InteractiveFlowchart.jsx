import React, { useState } from 'react';
import {
  GitBranch,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  Check,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  Terminal,
  ShieldAlert,
  ShieldCheck,
  List
} from 'lucide-react';
import { DifficultyBadge } from '../common/Badge';

export const InteractiveFlowchart = ({ resource = {}, flowchartData, onMarkComplete, completing = false }) => {
  const flowchart = flowchartData || resource.flowchartData || {
    workflowTitle: resource.title || 'Interactive Security Workflow',
    overview: resource.description || 'Step-by-step process walkthrough.',
    steps: [],
    connections: []
  };

  const steps = flowchart.steps || [];
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [selectedStep, setSelectedStep] = useState(steps[0] || null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [viewMode, setViewMode] = useState('diagram'); // 'diagram' | 'outline'

  const isCompleted = Boolean(resource.progress?.isCompleted);
  const activeStep = steps[activeStepIndex] || selectedStep;

  const handleNextStep = () => {
    if (activeStepIndex < steps.length - 1) {
      const nextIndex = activeStepIndex + 1;
      setActiveStepIndex(nextIndex);
      setSelectedStep(steps[nextIndex]);
    }
  };

  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      const prevIndex = activeStepIndex - 1;
      setActiveStepIndex(prevIndex);
      setSelectedStep(steps[prevIndex]);
    }
  };

  const handleReset = () => {
    setActiveStepIndex(0);
    setSelectedStep(steps[0] || null);
    setZoomLevel(100);
  };

  return (
    <div className="space-y-6">
      {/* Flowchart Title & Controls Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-mono font-bold">
              <GitBranch className="w-3.5 h-3.5" />
              <span>Interactive Workflow</span>
            </span>
            <DifficultyBadge level={resource.difficulty || 'intermediate'} />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B]">
            {flowchart.workflowTitle || resource.title}
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">{flowchart.overview || resource.description}</p>
        </div>

        {/* Action Controls & Mark Complete */}
        <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
          <div className="flex items-center bg-[#FAF8FF] border border-slate-200 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'diagram' ? 'outline' : 'diagram')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'outline'
                  ? 'bg-white shadow-xs text-[#6D28D9]'
                  : 'text-slate-600 hover:text-[#1E1B4B]'
              }`}
              title="Toggle accessible outline view"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List View</span>
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.max(75, prev - 15))}
              className="p-2 rounded-lg text-slate-600 hover:text-[#1E1B4B]"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-slate-500 px-1">{zoomLevel}%</span>
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.min(140, prev + 15))}
              className="p-2 rounded-lg text-slate-600 hover:text-[#1E1B4B]"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-lg text-slate-600 hover:text-[#1E1B4B]"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onMarkComplete && onMarkComplete(resource._id)}
            disabled={completing}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 active:scale-95 ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-[#6D28D9] hover:bg-[#5B21B6] text-white shadow-sm'
            }`}
          >
            {isCompleted ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Flowchart Mastered</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{completing ? 'Saving...' : 'Mark as Mastered'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {viewMode === 'diagram' ? (
        <div className="space-y-6">
          {/* Step Progress Navigation Strip */}
          <div className="bg-[#FAF8FF] p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={activeStepIndex === 0}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Stepper Dots / Labels */}
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {steps.map((st, i) => (
                <button
                  key={st.stepId || i}
                  type="button"
                  onClick={() => {
                    setActiveStepIndex(i);
                    setSelectedStep(st);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeStepIndex === i
                      ? 'bg-[#6D28D9] text-white shadow-sm ring-2 ring-purple-300'
                      : i < activeStepIndex
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-purple-50'
                  }`}
                >
                  <span>Step {st.stepNumber || i + 1}</span>
                  {i < activeStepIndex && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleNextStep}
              disabled={activeStepIndex === steps.length - 1}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Flow Diagram Board */}
          <div
            className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm overflow-x-auto transition-transform"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-3 py-4 min-w-[600px]">
              {steps.map((st, idx) => {
                const isActive = activeStepIndex === idx;
                const isPast = idx < activeStepIndex;

                return (
                  <React.Fragment key={st.stepId || idx}>
                    {/* Flowchart Node Card */}
                    <div
                      onClick={() => {
                        setActiveStepIndex(idx);
                        setSelectedStep(st);
                      }}
                      className={`relative w-full md:w-56 p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isActive
                          ? 'border-[#6D28D9] bg-[#FAF8FF] shadow-md ring-4 ring-purple-100 scale-105'
                          : isPast
                          ? 'border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50'
                          : 'border-slate-200 bg-white hover:border-[#DDD6FE] hover:bg-[#F5F3FF]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                            isActive
                              ? 'bg-[#6D28D9] text-white'
                              : isPast
                              ? 'bg-emerald-200 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          Step {st.stepNumber || idx + 1}
                        </span>

                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                          {st.category || 'Process'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#1E1B4B] mb-2 leading-snug">
                        {st.title}
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {st.description}
                      </p>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#6D28D9] font-semibold">
                        <span>Click to inspect</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Arrow Connection Connector */}
                    {idx < steps.length - 1 && (
                      <div className="flex flex-col items-center justify-center text-[#8B5CF6] shrink-0">
                        <ArrowRight className="w-5 h-5 hidden md:block" />
                        <ArrowDown className="w-5 h-5 md:hidden" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Active Step Deep-Dive Inspector Card */}
          {activeStep && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#DDD6FE] shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-lg bg-[#EDE9FE] text-[#6D28D9] font-mono text-xs font-bold border border-[#DDD6FE]">
                  Step {activeStep.stepNumber}: {activeStep.category?.toUpperCase() || 'PHASE'}
                </span>
                <span className="text-xs text-slate-500 font-medium">Deep Security Inspection</span>
              </div>

              <h3 className="text-xl font-extrabold text-[#1E1B4B] mb-3">
                {activeStep.title}
              </h3>

              <p className="text-sm text-slate-700 leading-relaxed mb-6">
                {activeStep.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeStep.technicalDetails && (
                  <div className="bg-[#FAF8FF] p-4 rounded-xl border border-slate-200 space-y-1.5">
                    <h5 className="text-xs font-bold font-mono text-[#6D28D9] flex items-center gap-1.5 uppercase">
                      <Info className="w-4 h-4" />
                      <span>Technical Architecture</span>
                    </h5>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {activeStep.technicalDetails}
                    </p>
                  </div>
                )}

                {activeStep.securityImpact && (
                  <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 space-y-1.5">
                    <h5 className="text-xs font-bold font-mono text-amber-900 flex items-center gap-1.5 uppercase">
                      <ShieldAlert className="w-4 h-4 text-amber-700" />
                      <span>Defensive Impact</span>
                    </h5>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      {activeStep.securityImpact}
                    </p>
                  </div>
                )}
              </div>

              {activeStep.commandExample && (
                <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-100 font-mono text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Security Command / Implementation Pattern</span>
                    </span>
                    <span>CLI / Policy Syntax</span>
                  </div>
                  <pre className="text-emerald-400 font-bold overflow-x-auto whitespace-pre-wrap">
                    {activeStep.commandExample}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Accessible Linear Outline View */
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-lg font-bold text-[#1E1B4B] mb-2">Sequential Process Steps</h3>
          <ol className="divide-y divide-slate-100 space-y-4">
            {steps.map((st, i) => (
              <li key={i} className="pt-4 first:pt-0 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#6D28D9] text-white text-xs font-mono font-bold flex items-center justify-center">
                    {st.stepNumber || i + 1}
                  </span>
                  <strong className="text-sm text-[#1E1B4B]">{st.title}</strong>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed ml-8">{st.description}</p>
                {st.technicalDetails && (
                  <p className="text-xs text-slate-500 font-mono ml-8 bg-[#FAF8FF] p-2.5 rounded-lg border border-slate-200">
                    {st.technicalDetails}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

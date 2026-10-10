import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { simulationService } from '../../services/apiServices';
import { AnimatedAttackFlowchart } from '../../components/simulations/AnimatedAttackFlowchart';
import { SimulationPlaybackControls } from '../../components/simulations/SimulationPlaybackControls';
import { StageExplanationPanel } from '../../components/simulations/StageExplanationPanel';
import { DecisionCheckpointModal } from '../../components/simulations/DecisionCheckpointModal';
import { SimulationSummaryModal } from '../../components/simulations/SimulationSummaryModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DifficultyBadge } from '../../components/common/Badge';
import { useToast } from '../../hooks/useToast';
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Sparkles,
  Award
} from 'lucide-react';

export const SimulationStudioPage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'defense' ? 'defense' : 'attack';

  const [simulation, setSimulation] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(initialMode); // 'attack' | 'defense'
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [reducedMotion, setReducedMotion] = useState(false);

  const [isCheckpointOpen, setIsCheckpointOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [sessionScore, setSessionScore] = useState(100);

  const timerRef = useRef(null);
  const toast = useToast();

  // Load simulation and initialize session
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const simRes = await simulationService.getById(id);
        const simData = simRes.data;
        setSimulation(simData);

        // Start or retrieve user session
        try {
          const sessRes = await simulationService.startSession(simData._id, { mode });
          setSession(sessRes.data);
          if (sessRes.data?.currentStageIndex && sessRes.data.mode === mode) {
            setCurrentStageIndex(sessRes.data.currentStageIndex);
          }
        } catch (sessErr) {
          console.warn('Session tracking guest fallback');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load simulation scenario');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [id]);

  // Current active stages array based on mode
  const activeStages =
    mode === 'defense'
      ? simulation?.defenseStages || []
      : simulation?.attackStages || [];

  const currentStage = activeStages[currentStageIndex] || activeStages[0];
  const activeNodeId = currentStage?.nodeId;

  // Handle Mode Change (Attack vs Defense)
  const handleToggleMode = (newMode) => {
    setIsPlaying(false);
    setMode(newMode);
    setCurrentStageIndex(0);
    setSearchParams({ mode: newMode });
  };

  // Automated playback timer
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.round(3800 / speed);
      timerRef.current = setTimeout(() => {
        handleStepNext();
      }, intervalMs);
    }
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, currentStageIndex, speed, activeStages.length]);

  const handleStepNext = () => {
    if (currentStageIndex < activeStages.length - 1) {
      const nextIdx = currentStageIndex + 1;
      const nextStage = activeStages[nextIdx];

      // If next stage contains a checkpoint, pause and trigger checkpoint
      if (nextStage?.checkpoint) {
        setIsPlaying(false);
        setIsCheckpointOpen(true);
      }

      setCurrentStageIndex(nextIdx);

      // Save progress to server
      if (session?._id) {
        simulationService
          .updateProgress(session._id, {
            mode,
            currentStageIndex: nextIdx,
            completedStageId: currentStage?.stageId
          })
          .catch(() => {});
      }
    } else {
      // Reached end of stages
      setIsPlaying(false);
      setIsSummaryOpen(true);

      if (session?._id) {
        simulationService
          .completeSession(session._id, { score: sessionScore })
          .catch(() => {});
      }
    }
  };

  const handleStepPrev = () => {
    if (currentStageIndex > 0) {
      setIsPlaying(false);
      setCurrentStageIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentStageIndex(0);
    setIsSummaryOpen(false);
  };

  const handleSelectNode = (nodeId) => {
    setIsPlaying(false);
    const targetIdx = activeStages.findIndex((s) => s.nodeId === nodeId);
    if (targetIdx >= 0) {
      setCurrentStageIndex(targetIdx);
    }
  };

  const handleDecisionSubmit = (decisionData) => {
    if (session?._id) {
      simulationService
        .updateProgress(session._id, {
          decision: decisionData
        })
        .catch(() => {});
    }

    if (!decisionData.isCorrect) {
      setSessionScore((s) => Math.max(50, s - 15));
    }
  };

  const handleContinueFromCheckpoint = () => {
    setIsCheckpointOpen(false);
  };

  if (loading) {
    return <LoadingSpinner message="Calibrating attack animation vectors and network graph..." />;
  }

  if (!simulation) {
    return (
      <div className="p-8 text-center text-[#64748B]">
        Simulation scenario unavailable or not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            to="/learner/watch-how-it-happens"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#6D28D9] mb-3 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Attack Scenarios</span>
          </Link>

          <div className="flex items-center gap-2.5 mb-2 flex-wrap">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#6D28D9] px-3 py-1 rounded-full bg-[#EDE9FE] border border-[#DDD6FE]">
              {simulation.category?.toUpperCase()}
            </span>
            <DifficultyBadge level={simulation.difficulty || 'beginner'} />
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{simulation.estimatedDuration || '8 min'}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B]">
            {simulation.title}
          </h1>
        </div>

        {/* Mode Switcher Pill in Header */}
        <div className="flex items-center gap-2 p-1.5 bg-[#FAF8FF] border border-[#DDD6FE] rounded-2xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => handleToggleMode('attack')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'attack'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#1E1B4B]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Attack Mode</span>
          </button>

          <button
            type="button"
            onClick={() => handleToggleMode('defense')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'defense'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#1E1B4B]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Defense Mode</span>
          </button>
        </div>
      </div>

      {/* Main Studio Workspace: 2-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Flowchart + Playback Controller */}
        <div className="lg:col-span-7 space-y-4">
          <AnimatedAttackFlowchart
            nodes={simulation.nodes}
            edges={simulation.edges}
            activeNodeId={activeNodeId}
            mode={mode}
            onSelectNode={handleSelectNode}
            reducedMotion={reducedMotion}
          />

          <SimulationPlaybackControls
            isPlaying={isPlaying}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onNext={handleStepNext}
            onPrev={handleStepPrev}
            onRestart={handleRestart}
            canPrev={currentStageIndex > 0}
            canNext={currentStageIndex < activeStages.length - 1}
            currentStageIndex={currentStageIndex}
            totalStages={activeStages.length}
            speed={speed}
            onSpeedChange={setSpeed}
            mode={mode}
            onToggleMode={handleToggleMode}
            reducedMotion={reducedMotion}
            onToggleReducedMotion={() => setReducedMotion(!reducedMotion)}
          />
        </div>

        {/* Right Column (5 cols): Synchronized Detailed Explanation Panel */}
        <div className="lg:col-span-5 sticky top-24">
          <StageExplanationPanel stage={currentStage} mode={mode} />
        </div>
      </div>

      {/* Interactive Checkpoint Modal */}
      <DecisionCheckpointModal
        isOpen={isCheckpointOpen}
        checkpoint={currentStage?.checkpoint}
        onSubmitDecision={handleDecisionSubmit}
        onContinue={handleContinueFromCheckpoint}
      />

      {/* End of Simulation Summary Modal */}
      <SimulationSummaryModal
        isOpen={isSummaryOpen}
        simulation={simulation}
        mode={mode}
        score={sessionScore}
        onReplayMode={handleToggleMode}
        onClose={() => setIsSummaryOpen(false)}
      />
    </div>
  );
};

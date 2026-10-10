import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AttackScenarioCard } from '../components/simulations/AttackScenarioCard';
import { AnimatedAttackFlowchart } from '../components/simulations/AnimatedAttackFlowchart';
import { SimulationPlaybackControls } from '../components/simulations/SimulationPlaybackControls';
import { StageExplanationPanel } from '../components/simulations/StageExplanationPanel';
import { DecisionCheckpointModal } from '../components/simulations/DecisionCheckpointModal';
import { SimulationSummaryModal } from '../components/simulations/SimulationSummaryModal';

describe('CyberShield "Watch How It Happens" Simulation Suite', () => {
  const mockSimulation = {
    _id: 'sim-sqli-01',
    title: 'SQL Injection Authentication Bypass',
    description: 'Exploitation of dynamic SQL queries in database authentication mechanisms.',
    category: 'sqli',
    difficulty: 'intermediate',
    estimatedDuration: '10 min',
    learningObjectives: ['Parameterized queries compile inputs safely'],
    userProgress: { isCompleted: true, score: 95 }
  };

  const mockNodes = [
    {
      id: 'node_1',
      label: 'Attacker Reconnaissance',
      type: 'attacker_action',
      x: 100,
      y: 150,
      description: 'Single quote probe on login parameter',
      mode: 'both'
    },
    {
      id: 'node_2',
      label: 'Unsanitized Concatenation',
      type: 'weakness',
      x: 350,
      y: 150,
      description: 'Backend dynamically builds SQL string',
      mode: 'both'
    },
    {
      id: 'node_3',
      label: 'Parameterized Queries',
      type: 'defense_control',
      x: 350,
      y: 300,
      description: 'Prepared statements treat input strictly as literals',
      mode: 'defense'
    }
  ];

  const mockEdges = [
    {
      id: 'e1_2',
      from: 'node_1',
      to: 'node_2',
      label: 'Payload Transmitted',
      animated: true,
      mode: 'both'
    }
  ];

  const mockStage = {
    stageNumber: 1,
    title: 'Attacker Reconnaissance',
    nodeId: 'node_1',
    description: 'The attacker probes the authentication endpoint.',
    whatIsHappening: 'The attacker supplies a SQL single quote delimiter into the input form.',
    whyCanThisHappen: 'Client application submits unvalidated strings to legacy endpoint.',
    whatShouldYouNotice: 'Unexpected 500 database error message discloses database structure.',
    whatCouldBeImpact: 'Attacker confirms database backend evaluates user input as executable SQL.',
    howCanItBePrevented: 'Apply strict alphanumeric regex validation and parameterized queries.',
    realWorldLesson: 'Never trust user input without sanitization.',
    warningSigns: ['Unexpected SQL syntax errors', 'Application latency anomalies'],
    technicalDetails: "admin' --"
  };

  const mockCheckpoint = {
    question: 'Which architecture pattern decisively mitigates SQL Injection at the data layer?',
    options: [
      {
        id: 'opt_1',
        text: 'Client-side regex replacement',
        isCorrect: false,
        explanation: 'Client-side validation can be easily bypassed using direct HTTP requests.',
        consequence: 'Attacker bypasses browser filter and injects SQL commands directly.'
      },
      {
        id: 'opt_2',
        text: 'Parameterized queries (Prepared Statements)',
        isCorrect: true,
        explanation: 'Parameterized queries compile the query AST ahead of time, ensuring input is treated as literals.',
        consequence: 'Database engine rejects syntax breakout and safely aborts exploit attempt.'
      }
    ]
  };

  describe('AttackScenarioCard', () => {
    it('renders simulation title, description, category badge, duration, and completion status', () => {
      render(
        <BrowserRouter>
          <AttackScenarioCard simulation={mockSimulation} />
        </BrowserRouter>
      );

      expect(screen.getByText('SQL Injection Authentication Bypass')).toBeInTheDocument();
      expect(screen.getByText(/Exploitation of dynamic SQL queries/i)).toBeInTheDocument();
      expect(screen.getByText('SQL Injection')).toBeInTheDocument();
      expect(screen.getByText('10 min')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('renders navigation links for Watch Simulation and Learn Defense', () => {
      render(
        <BrowserRouter>
          <AttackScenarioCard simulation={mockSimulation} />
        </BrowserRouter>
      );

      const watchLink = screen.getByRole('link', { name: /Watch Simulation/i });
      expect(watchLink).toHaveAttribute(
        'href',
        '/learner/watch-how-it-happens/sim-sqli-01?mode=attack'
      );

      const defenseLink = screen.getByRole('link', { name: /Learn Defense/i });
      expect(defenseLink).toHaveAttribute(
        'href',
        '/learner/watch-how-it-happens/sim-sqli-01?mode=defense'
      );
    });
  });

  describe('AnimatedAttackFlowchart', () => {
    it('renders node labels and handles interactive selection', () => {
      const onSelectNode = vi.fn();
      render(
        <AnimatedAttackFlowchart
          nodes={mockNodes}
          edges={mockEdges}
          activeNodeId="node_1"
          mode="attack"
          onSelectNode={onSelectNode}
        />
      );

      expect(screen.getByText('Attacker Reconnaissance')).toBeInTheDocument();
      expect(screen.getByText('Unsanitized Concatenation')).toBeInTheDocument();

      // Zoom in button exists
      const zoomInBtn = screen.getByTitle('Zoom In');
      fireEvent.click(zoomInBtn);

      // Node card can be selected
      const nodeElement = screen.getByText('Attacker Reconnaissance');
      fireEvent.click(nodeElement);
      expect(onSelectNode).toHaveBeenCalledWith('node_1');
    });

    it('supports switching to Accessible List View', () => {
      render(
        <AnimatedAttackFlowchart
          nodes={mockNodes}
          edges={mockEdges}
          activeNodeId="node_1"
          mode="attack"
        />
      );

      const listBtn = screen.getByRole('button', { name: /List View/i });
      fireEvent.click(listBtn);

      expect(screen.getByText(/Sequential Simulation Stages/i)).toBeInTheDocument();

      // Click again to toggle back to flowchart
      fireEvent.click(listBtn);
    });
  });

  describe('SimulationPlaybackControls', () => {
    it('handles play, next, restart, mode switch, and speed change interactions', () => {
      const onPlay = vi.fn();
      const onPause = vi.fn();
      const onNext = vi.fn();
      const onPrev = vi.fn();
      const onRestart = vi.fn();
      const onToggleMode = vi.fn();
      const onSpeedChange = vi.fn();

      render(
        <SimulationPlaybackControls
          isPlaying={false}
          onPlay={onPlay}
          onPause={onPause}
          onNext={onNext}
          onPrev={onPrev}
          onRestart={onRestart}
          canPrev={true}
          canNext={true}
          currentStageIndex={0}
          totalStages={2}
          speed={1}
          onSpeedChange={onSpeedChange}
          mode="attack"
          onToggleMode={onToggleMode}
        />
      );

      // Play simulation
      const playBtn = screen.getByRole('button', { name: /Play Simulation/i });
      fireEvent.click(playBtn);
      expect(onPlay).toHaveBeenCalled();

      // Next stage
      const nextBtn = screen.getByRole('button', { name: /Next Stage/i });
      fireEvent.click(nextBtn);
      expect(onNext).toHaveBeenCalled();

      // Restart
      const restartBtn = screen.getByTitle('Restart to Stage 1');
      fireEvent.click(restartBtn);
      expect(onRestart).toHaveBeenCalled();

      // Toggle to Defense Mode
      const defenseBtn = screen.getByRole('button', { name: /Defense Mode/i });
      fireEvent.click(defenseBtn);
      expect(onToggleMode).toHaveBeenCalledWith('defense');

      // Change speed
      const speed2Btn = screen.getByRole('button', { name: '2x' });
      fireEvent.click(speed2Btn);
      expect(onSpeedChange).toHaveBeenCalledWith(2);

      // Verify stage counter text
      expect(screen.getByText('Stage 1 of 2')).toBeInTheDocument();
    });
  });

  describe('StageExplanationPanel', () => {
    it('renders all 6 required explanation sections and warning signs', () => {
      render(
        <StageExplanationPanel stage={mockStage} mode="attack" />
      );

      // 1. What is happening?
      expect(screen.getByText(/What is happening\?/i)).toBeInTheDocument();
      expect(screen.getByText(/The attacker supplies a SQL single quote delimiter/i)).toBeInTheDocument();

      // 2. Why can this happen?
      expect(screen.getByText(/Why can this happen\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Client application submits unvalidated strings/i)).toBeInTheDocument();

      // 3. What should you notice?
      expect(screen.getByText(/What should you notice\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Unexpected 500 database error message/i)).toBeInTheDocument();
      expect(screen.getByText('Unexpected SQL syntax errors')).toBeInTheDocument();

      // 4. What could be the impact?
      expect(screen.getByText(/What could be the impact\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Attacker confirms database backend/i)).toBeInTheDocument();

      // 5. How can it be prevented?
      expect(screen.getByText(/How can it be prevented\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Apply strict alphanumeric regex validation/i)).toBeInTheDocument();

      // 6. Real-World Lesson
      expect(screen.getByText(/Real-World Lesson/i)).toBeInTheDocument();
      expect(screen.getByText(/Never trust user input without sanitization/i)).toBeInTheDocument();
    });

    it('toggles technical details payload drawer', () => {
      render(
        <StageExplanationPanel stage={mockStage} mode="attack" />
      );

      const techBtn = screen.getByRole('button', { name: /Technical Implementation & Payload Protocol/i });
      fireEvent.click(techBtn);

      expect(screen.getByText("admin' --")).toBeInTheDocument();
    });
  });

  describe('DecisionCheckpointModal', () => {
    it('renders checkpoint questions, allows option choice, reveals feedback and calls onSubmitDecision & onContinue', () => {
      const onSubmitDecision = vi.fn();
      const onContinue = vi.fn();

      render(
        <DecisionCheckpointModal
          isOpen={true}
          checkpoint={mockCheckpoint}
          onSubmitDecision={onSubmitDecision}
          onContinue={onContinue}
        />
      );

      expect(screen.getByText(/Interactive Security Decision/i)).toBeInTheDocument();
      expect(screen.getByText(/Which architecture pattern decisively mitigates SQL Injection/i)).toBeInTheDocument();

      // Choose correct option
      const correctOption = screen.getByText('Parameterized queries (Prepared Statements)');
      fireEvent.click(correctOption);

      // Confirm decision
      const confirmBtn = screen.getByRole('button', { name: /Confirm Decision/i });
      fireEvent.click(confirmBtn);

      expect(onSubmitDecision).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedOptionId: 'opt_2',
          isCorrect: true
        })
      );

      // Verify explanation appears
      expect(
        screen.getByText(/Parameterized queries compile the query AST ahead of time/i)
      ).toBeInTheDocument();

      // Click Continue
      const continueBtn = screen.getByRole('button', { name: /Continue Simulation/i });
      fireEvent.click(continueBtn);
      expect(onContinue).toHaveBeenCalled();
    });
  });

  describe('SimulationSummaryModal', () => {
    it('renders modal with score, simulation title, and replay in defense mode action', () => {
      const onReplayMode = vi.fn();
      const onClose = vi.fn();

      render(
        <BrowserRouter>
          <SimulationSummaryModal
            isOpen={true}
            simulation={mockSimulation}
            mode="attack"
            score={95}
            onReplayMode={onReplayMode}
            onClose={onClose}
          />
        </BrowserRouter>
      );

      expect(screen.getByText(/Attack Execution Analyzed!/i)).toBeInTheDocument();
      expect(screen.getByText('95%')).toBeInTheDocument();
      expect(screen.getByText('SQL Injection Authentication Bypass')).toBeInTheDocument();

      const replayDefenseBtn = screen.getByRole('button', { name: /Replay in Defense Mode/i });
      fireEvent.click(replayDefenseBtn);
      expect(onReplayMode).toHaveBeenCalledWith('defense');
    });
  });
});

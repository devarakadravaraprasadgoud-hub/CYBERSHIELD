import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { quizService, attemptService } from '../../services/apiServices';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { QuestionCard } from '../../components/quiz/QuestionCard';
import { QuizTimer } from '../../components/quiz/QuizTimer';
import { QuizNavGrid } from '../../components/quiz/QuizNavGrid';
import { Modal } from '../../components/common/Modal';
import {
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  Shield
} from 'lucide-react';

export const InteractiveQuizPage = () => {
  const { quizId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [attemptId, setAttemptId] = useState(searchParams.get('attemptId'));
  const [quizInfo, setQuizInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedOptionId }
  const [flaggedIndices, setFlaggedIndices] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Initialize questions and attempt
  useEffect(() => {
    const initQuiz = async () => {
      setLoading(true);
      try {
        let currentAttemptId = attemptId;
        if (!currentAttemptId) {
          const attemptRes = await attemptService.startAttempt(quizId);
          currentAttemptId = attemptRes.data.attemptId;
          setAttemptId(currentAttemptId);
        }

        const res = await quizService.getQuestions(quizId);
        setQuizInfo(res.data.quiz);
        setQuestions(res.data.questions || []);
      } catch (err) {
        console.error(err);
        toast.error(err.message || 'Failed to initialize quiz session');
        navigate('/topics');
      } finally {
        setLoading(false);
      }
    };

    initQuiz();
  }, [quizId]);

  const handleSelectOption = (optionId) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ._id]: optionId
    }));
  };

  const handleToggleFlag = () => {
    setFlaggedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(currentIndex)) {
        next.delete(currentIndex);
      } else {
        next.add(currentIndex);
      }
      return next;
    });
  };

  const handleSubmitQuiz = useCallback(async () => {
    if (!attemptId || submitting) return;
    setSubmitting(true);
    setShowConfirmModal(false);

    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId
      }));

      await attemptService.submitAttempt(attemptId, formattedAnswers);
      toast.success('Assessment evaluated successfully!');
      navigate(`/learner/quizzes/results/${attemptId}`);
    } catch (err) {
      toast.error(err.message || 'Failed to submit assessment answers');
      setSubmitting(false);
    }
  }, [attemptId, answers, submitting, navigate, toast]);

  const handleTimeUp = useCallback(() => {
    toast.warning('Time limit reached! Submitting answers automatically...');
    handleSubmitQuiz();
  }, [handleSubmitQuiz, toast]);

  if (loading) {
    return <LoadingSpinner message="Deploying interactive defense terminal..." />;
  }

  if (questions.length === 0) {
    return (
      <div className="p-8 text-center text-[#64748B]">
        No active questions found in this assessment.
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-6">
      {/* Top Bar with Quiz Title and Countdown Timer */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E7EB] shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EDE9FE] border border-[#DDD6FE] flex items-center justify-center text-[#6D28D9]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#1E1B4B] leading-tight">
              {quizInfo?.title || 'Interactive Quiz'}
            </h2>
            <span className="text-xs text-[#64748B] font-mono">
              Progress: {answeredCount}/{questions.length} Answered
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <QuizTimer
            initialMinutes={quizInfo?.timeLimitMinutes || 10}
            onTimeUp={handleTimeUp}
          />
          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            disabled={submitting}
            className="px-4 py-2 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-xs transition shadow-md shadow-purple-500/20 active:scale-95 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Finish & Submit</span>
            <span className="sm:hidden">Submit</span>
          </button>
        </div>
      </div>

      {/* Main Assessment Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Active Question Display (Left 3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <QuestionCard
            question={currentQuestion}
            questionIndex={currentIndex}
            totalQuestions={questions.length}
            selectedOptionId={answers[currentQuestion._id]}
            onSelectOption={handleSelectOption}
            isFlagged={flaggedIndices.has(currentIndex)}
            onToggleFlag={handleToggleFlag}
          />

          {/* Prev / Next Navigation Controls */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#475569] font-medium text-xs hover:border-[#DDD6FE] hover:bg-[#FAF8FF] disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Question</span>
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-5 py-2.5 rounded-xl bg-[#EDE9FE] hover:bg-[#DDD6FE]/70 text-[#6D28D9] font-semibold text-xs border border-[#DDD6FE] transition flex items-center gap-1.5"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="px-6 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-xs transition shadow-md shadow-purple-500/20 flex items-center gap-1.5"
              >
                <span>Review & Submit</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar: Questions Grid */}
        <div className="space-y-4">
          <QuizNavGrid
            questions={questions}
            currentIndex={currentIndex}
            answers={answers}
            flaggedIndices={flaggedIndices}
            onSelectIndex={(idx) => setCurrentIndex(idx)}
          />

          <div className="cyber-card rounded-2xl p-4 text-xs text-[#64748B] space-y-2 bg-white border border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <span>Answered:</span>
              <span className="font-mono text-[#6D28D9] font-bold">{answeredCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Unanswered:</span>
              <span className="font-mono text-[#64748B] font-bold">{unansweredCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Flagged for review:</span>
              <span className="font-mono text-amber-600 font-bold">{flaggedIndices.size}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Submit Quiz Assessment"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#475569] leading-relaxed">
            Are you ready to submit your assessment for server evaluation? Once submitted, your answers are finalized and scored.
          </p>

          {unansweredCount > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-amber-900 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <strong>Warning:</strong> You have{' '}
                <span className="font-bold underline">{unansweredCount}</span> unanswered question
                {unansweredCount > 1 ? 's' : ''}. Unanswered questions will receive 0 points.
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#475569] hover:bg-[#F5F3FF]"
            >
              Back to Quiz
            </button>
            <button
              type="button"
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-xs transition shadow-md shadow-purple-500/20 active:scale-95"
            >
              {submitting ? 'Evaluating...' : 'Confirm Submission'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quizService, attemptService } from '../../services/apiServices';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DifficultyBadge } from '../../components/common/Badge';
import {
  Timer,
  Award,
  CheckCircle2,
  Play,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';

export const QuizInstructionsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await quizService.getById(id);
        setQuiz(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load quiz details');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const handleStartQuiz = async () => {
    if (!quiz?._id) return;
    setStarting(true);
    try {
      const res = await attemptService.startAttempt(quiz._id);
      const attemptId = res.data.attemptId;
      toast.info('Assessment initiated. Timer started.');
      navigate(`/learner/quizzes/${quiz._id}/take?attemptId=${attemptId}`);
    } catch (err) {
      toast.error(err.message || 'Failed to initialize assessment');
      setStarting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Preparing assessment terminal..." />;
  }

  if (!quiz) {
    return (
      <div className="p-8 text-center text-[#64748B]">
        Quiz not found or currently unavailable.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <div>
        <Link
          to={`/topics/${quiz.topic?._id || ''}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#6D28D9] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Topic Curriculum</span>
        </Link>
      </div>

      <div className="cyber-card rounded-3xl p-6 sm:p-10 border border-[#E5E7EB] bg-white shadow-xs">
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-[#6D28D9] font-bold px-3 py-1 rounded-full bg-[#EDE9FE] border border-[#DDD6FE]">
            {quiz.topic?.title || 'Cybersecurity Assessment'}
          </span>
          <DifficultyBadge level={quiz.difficultyLevel} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] mb-3">
          {quiz.title}
        </h1>
        <p className="text-[#475569] text-sm sm:text-base leading-relaxed mb-8">
          {quiz.description}
        </p>

        {/* Key Metrics Strip */}
        <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-[#FAF8FF] border border-[#DDD6FE] text-center mb-8">
          <div>
            <span className="text-[11px] font-mono uppercase text-[#64748B]">Questions</span>
            <div className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B] mt-1">
              {quiz.questionCount || 5}
            </div>
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase text-[#64748B]">Time Limit</span>
            <div className="text-xl sm:text-2xl font-extrabold text-[#6D28D9] mt-1">
              {quiz.timeLimitMinutes} min
            </div>
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase text-[#64748B]">Passing Score</span>
            <div className="text-xl sm:text-2xl font-extrabold text-[#15803D] mt-1">
              {quiz.passPercentage}%
            </div>
          </div>
        </div>

        {/* Instructions and Rules */}
        <div className="space-y-4 mb-8">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-bold">
            ASSESSMENT RULES & PROTOCOLS
          </h3>
          <ul className="space-y-3 text-xs sm:text-sm text-[#475569]">
            <li className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
              <span>
                <strong>Server-Side Scored:</strong> Answers are strictly evaluated by the backend scoring engine upon final submission.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Timer className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
              <span>
                <strong>Countdown Clock:</strong> If the timer reaches zero, your answers are automatically submitted.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
              <span>
                <strong>Navigation & Review:</strong> You can navigate between questions and flag items for review before submitting.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Award className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
              <span>
                <strong>Instant Feedback:</strong> You will receive complete technical rationales and defense explanations immediately following submission.
              </span>
            </li>
          </ul>
        </div>

        {/* Start Button */}
        <button
          type="button"
          disabled={starting}
          onClick={handleStartQuiz}
          className="w-full py-4 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-base transition shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
        >
          {starting ? (
            <span>Initializing attempt...</span>
          ) : (
            <>
              <Play className="w-5 h-5 fill-white" />
              <span>Begin Assessment</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

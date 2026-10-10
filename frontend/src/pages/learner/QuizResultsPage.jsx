import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { attemptService } from '../../services/apiServices';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { QuestionCard } from '../../components/quiz/QuestionCard';
import { formatDuration } from '../../utils/formatters';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';

export const QuizResultsPage = () => {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const res = await attemptService.getAttemptById(attemptId);
        setAttempt(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttempt();
  }, [attemptId]);

  if (loading) {
    return <LoadingSpinner message="Calculating assessment performance metrics..." />;
  }

  if (!attempt) {
    return (
      <div className="p-8 text-center text-[#64748B]">
        Attempt records not found.
      </div>
    );
  }

  const { quiz, answers = [] } = attempt;
  const isPassed = attempt.isPassed;

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Result Hero Banner */}
      <div
        className={`rounded-3xl p-6 sm:p-10 border text-center relative overflow-hidden shadow-md bg-white ${
          isPassed
            ? 'border-emerald-200'
            : 'border-rose-200'
        }`}
      >
        <div className="w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center border shadow-xs">
          {isPassed ? (
            <div className="w-full h-full rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#15803D]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-full h-full rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#B91C1C]">
              <XCircle className="w-10 h-10" />
            </div>
          )}
        </div>

        <span
          className={`text-xs font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full border inline-block mb-2 ${
            isPassed
              ? 'bg-emerald-50 text-[#15803D] border-emerald-200'
              : 'bg-rose-50 text-[#B91C1C] border-rose-200'
          }`}
        >
          {isPassed ? 'ASSESSMENT PASSED' : 'REMEDIATION RECOMMENDED'}
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E1B4B] mb-2">
          {quiz?.title || 'Cybersecurity Evaluation'}
        </h1>
        <p className="text-[#475569] text-xs sm:text-sm max-w-md mx-auto mb-6">
          {isPassed
            ? 'Commendable defense comprehension! You achieved the required mastery score.'
            : 'You scored below the passing threshold. Review the explanations below and attempt again.'}
        </p>

        {/* Score metrics strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto p-4 rounded-2xl bg-[#FAF8FF] border border-[#DDD6FE] text-left">
          <div className="p-2">
            <span className="text-[11px] font-mono uppercase text-[#64748B]">Final Score</span>
            <div className="text-2xl font-black text-[#1E1B4B] mt-0.5">
              {attempt.score}/{attempt.maxScore}
            </div>
          </div>
          <div className="p-2">
            <span className="text-[11px] font-mono uppercase text-[#64748B]">Percentage</span>
            <div
              className={`text-2xl font-black mt-0.5 ${
                isPassed ? 'text-[#15803D]' : 'text-[#B91C1C]'
              }`}
            >
              {attempt.percentage}%
            </div>
          </div>
          <div className="p-2">
            <span className="text-[11px] font-mono uppercase text-[#64748B]">Correct Answers</span>
            <div className="text-2xl font-black text-[#6D28D9] mt-0.5">
              {attempt.correctAnswersCount}/{attempt.totalQuestionsCount}
            </div>
          </div>
          <div className="p-2">
            <span className="text-[11px] font-mono uppercase text-[#64748B]">Time Taken</span>
            <div className="text-2xl font-black text-[#1E1B4B] mt-0.5">
              {formatDuration(attempt.durationSeconds)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <Link
            to={`/learner/quizzes/${quiz?._id}/instructions`}
            className="px-6 py-3 rounded-xl bg-white hover:bg-[#F5F3FF] text-[#475569] font-semibold text-xs border border-[#E5E7EB] transition flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Assessment</span>
          </Link>
          <Link
            to="/learner/dashboard"
            className="px-6 py-3 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-xs transition shadow-md shadow-purple-500/20 flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Review Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
          <h2 className="text-xl font-bold text-[#1E1B4B] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#6D28D9]" />
            <span>Detailed Answer Audit & Explanations</span>
          </h2>
          <span className="text-xs text-[#64748B] font-mono">
            {answers.length} Questions Evaluated
          </span>
        </div>

        <div className="space-y-6">
          {answers.map((answer, index) => {
            const mockQuestion = {
              _id: answer.questionId,
              questionText: answer.questionText,
              points: answer.maxPoints,
              options: answer.optionsSnapshot
            };

            return (
              <QuestionCard
                key={answer.questionId || index}
                question={mockQuestion}
                questionIndex={index}
                totalQuestions={answers.length}
                selectedOptionId={answer.selectedOptionId}
                isReviewMode={true}
                reviewResult={answer}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

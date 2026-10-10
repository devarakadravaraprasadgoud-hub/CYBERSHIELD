import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { attemptService } from '../../services/apiServices';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import { formatDate, formatDuration } from '../../utils/formatters';
import { History, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export const QuizHistoryPage = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAttempts = async () => {
    setLoading(true);
    try {
      const res = await attemptService.getMyAttempts({ page, limit: 10 });
      setAttempts(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-[#6D28D9] font-bold">
          AUDIT LOGS
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] mt-1">
          Assessment History
        </h1>
        <p className="text-[#64748B] text-sm mt-1">
          Complete ledger of your past quiz submissions, timestamps, and evaluation scores.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Querying historical assessment logs..." />
      ) : attempts.length === 0 ? (
        <EmptyState
          icon={History}
          title="No past attempts recorded"
          description="Take an assessment to record your initial score and track your improvement."
          actionLabel="Browse Available Quizzes"
          onAction={() => (window.location.href = '/topics')}
        />
      ) : (
        <div className="cyber-card rounded-2xl overflow-hidden border border-[#E5E7EB] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8FF] text-[#64748B] font-mono uppercase tracking-wider border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-4">Assessment</th>
                  <th className="px-6 py-4">Topic Category</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Outcome</th>
                  <th className="px-6 py-4">Time Spent</th>
                  <th className="px-6 py-4">Date Completed</th>
                  <th className="px-6 py-4 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {attempts.map((attempt) => (
                  <tr key={attempt._id} className="hover:bg-[#FAF8FF] transition">
                    <td className="px-6 py-4 font-bold text-[#1E1B4B]">
                      {attempt.quiz?.title || 'Security Evaluation'}
                    </td>
                    <td className="px-6 py-4 text-[#475569]">
                      {attempt.quiz?.topic?.title || 'General'}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold">
                      <span
                        className={
                          attempt.percentage >= 70 ? 'text-[#15803D]' : 'text-[#B91C1C]'
                        }
                      >
                        {attempt.score}/{attempt.maxScore} ({attempt.percentage}%)
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          attempt.isPassed
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {attempt.isPassed ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {attempt.isPassed ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#64748B] font-mono">
                      {formatDuration(attempt.durationSeconds)}
                    </td>
                    <td className="px-6 py-4 text-[#64748B]">{formatDate(attempt.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/learner/quizzes/results/${attempt._id}`}
                        className="inline-flex items-center gap-1 text-[#6D28D9] hover:text-[#5B21B6] font-semibold"
                      >
                        <span>Review</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/apiServices';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';
import { FileText, CheckCircle2, XCircle, ArrowRight, ShieldAlert } from 'lucide-react';

export const QuizReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        const res = await dashboardService.getAdmin();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAudits();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Retrieving global evaluation audit ledger..." />;
  }

  const recentAttempts = data?.recentAttempts || [];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-[#6D28D9] font-bold">
          EVALUATION LOGS
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] mt-1">
          Platform Quiz Attempt Audits
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Detailed cryptographic audit trails of all user submissions, evaluations, and outcomes.
        </p>
      </div>

      {recentAttempts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No attempt records found"
          description="Platform evaluations will appear here as learners take quizzes."
        />
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8FF] text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Quiz Assessment</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Outcome</th>
                  <th className="px-6 py-4">Date Completed</th>
                  <th className="px-6 py-4 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAttempts.map((att) => (
                  <tr key={att._id} className="hover:bg-[#F5F3FF]/50 transition">
                    <td className="px-6 py-4 font-bold text-[#1E1B4B]">
                      {att.user?.name || 'Anonymous User'}
                      <span className="block text-[11px] font-normal text-slate-500 font-mono">
                        {att.user?.email}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{att.quiz?.title}</td>
                    <td className="px-6 py-4 font-mono font-bold text-[#6D28D9]">
                      {att.percentage}%
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          att.isPassed
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {att.isPassed ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {att.isPassed ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(att.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/learner/quizzes/results/${att._id}`}
                        className="inline-flex items-center gap-1 text-[#6D28D9] hover:text-[#5B21B6] font-semibold"
                      >
                        <span>Examine</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

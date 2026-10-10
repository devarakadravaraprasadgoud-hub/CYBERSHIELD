import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/apiServices';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';
import { CheckCircle2, XCircle, ArrowRight, Users } from 'lucide-react';

export const LearnerPerformancePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await dashboardService.getInstructor();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Generating learner performance audits..." />;
  }

  const recentAttempts = data?.recentAttempts || [];
  const filteredAttempts = recentAttempts.filter((a) => {
    if (filter === 'passed') return a.isPassed;
    if (filter === 'failed') return !a.isPassed;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#6D28D9] font-bold">
            PERFORMANCE TELEMETRY
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] mt-1">
            Cadet Performance Reports
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            Analyze comprehension trends and individual evaluation logs across your content.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['all', 'passed', 'failed'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                filter === st
                  ? 'bg-[#6D28D9] text-white shadow-xs'
                  : 'bg-white text-[#475569] hover:text-[#1E1B4B] hover:bg-[#F5F3FF] border border-[#E5E7EB]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {filteredAttempts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No evaluation reports match filter"
          description="Submissions by enrolled learners will appear here as quizzes are taken."
        />
      ) : (
        <div className="cyber-card rounded-2xl overflow-hidden border border-[#E5E7EB] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8FF] text-[#64748B] font-mono uppercase tracking-wider border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-4">Cadet</th>
                  <th className="px-6 py-4">Quiz Assessment</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Submission Date</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredAttempts.map((att) => (
                  <tr key={att._id} className="hover:bg-[#FAF8FF] transition">
                    <td className="px-6 py-4 font-bold text-[#1E1B4B]">
                      {att.user?.name || 'Anonymous Cadet'}
                      <span className="block text-[11px] font-normal text-[#64748B]">
                        {att.user?.email}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#475569]">{att.quiz?.title}</td>
                    <td className="px-6 py-4 font-mono font-bold">
                      <span
                        className={att.percentage >= 70 ? 'text-[#15803D]' : 'text-[#B91C1C]'}
                      >
                        {att.score}/{att.maxScore} ({att.percentage}%)
                      </span>
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
                    <td className="px-6 py-4 text-[#64748B]">{formatDate(att.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/learner/quizzes/results/${att._id}`}
                        className="inline-flex items-center gap-1 text-[#6D28D9] hover:text-[#5B21B6] font-semibold"
                      >
                        <span>Audit Log</span>
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

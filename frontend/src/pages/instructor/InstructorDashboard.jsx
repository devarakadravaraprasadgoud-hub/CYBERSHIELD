import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/apiServices';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatCard } from '../../components/common/StatCard';
import { formatDate } from '../../utils/formatters';
import {
  BookOpen,
  HelpCircle,
  Users,
  TrendingUp,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const InstructorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getInstructor();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating instructor defense metrics..." />;
  }

  const { metrics, recentAttempts = [] } = data || {};

  return (
    <div className="space-y-8">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#6D28D9] font-bold">
            INSTRUCTOR COMMAND
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] mt-1">
            Curriculum & Performance Dashboard
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            Manage your instructional content and evaluate cadet assessment outcomes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/instructor/modules/create"
            className="px-4 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-md shadow-purple-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Module</span>
          </Link>
          <Link
            to="/instructor/quizzes"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F5F3FF] text-[#475569] font-semibold text-xs border border-[#E5E7EB] hover:border-[#DDD6FE] flex items-center gap-1.5 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Manage Quizzes</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={BookOpen}
          title="Author Modules"
          value={metrics?.totalModules || 0}
          subtitle="Published & draft modules"
          accent="purple"
        />
        <StatCard
          icon={HelpCircle}
          title="Managed Quizzes"
          value={metrics?.totalQuizzes || 0}
          subtitle={`${metrics?.totalQuestions || 0} Total questions`}
          accent="purple"
        />
        <StatCard
          icon={Users}
          title="Learner Submissions"
          value={metrics?.totalLearnerAttempts || 0}
          subtitle="Evaluations completed"
          accent="emerald"
        />
        <StatCard
          icon={TrendingUp}
          title="Cohort Average"
          value={`${metrics?.averageScore || 0}%`}
          subtitle={`Pass rate: ${metrics?.passRate || 0}%`}
          accent="amber"
        />
      </div>

      {/* Recent Learner Attempts on Instructor Quizzes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1E1B4B] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#6D28D9]" />
            <span>Recent Cadet Submissions on Your Quizzes</span>
          </h2>
          <Link
            to="/instructor/performance"
            className="text-xs font-semibold text-[#6D28D9] hover:text-[#5B21B6]"
          >
            All Reports →
          </Link>
        </div>

        <div className="cyber-card rounded-2xl overflow-hidden border border-[#E5E7EB] bg-white">
          {recentAttempts.length === 0 ? (
            <div className="p-8 text-center text-[#64748B] text-sm">
              No learner attempts recorded on your quizzes yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8FF] text-[#64748B] font-mono uppercase tracking-wider border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-6 py-4">Cadet Name</th>
                    <th className="px-6 py-4">Quiz Title</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {recentAttempts.map((att) => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

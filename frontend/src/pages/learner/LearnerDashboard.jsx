import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService } from '../../services/apiServices';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatCard } from '../../components/common/StatCard';
import { DifficultyBadge } from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';
import {
  FileCheck,
  TrendingUp,
  BookOpen,
  Award,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Shield,
  Zap,
  Play,
  Eye
} from 'lucide-react';

export const LearnerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getLearner();
        setData(res.data);
      } catch (err) {
        console.error('Failed to load learner dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Retrieving cadet training records..." />;
  }

  const { metrics, recentAttempts = [], recommendedModules = [], continueAction, achievements = [] } =
    data || {};

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] border border-[#DDD6FE]/30 relative overflow-hidden shadow-xl text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white font-mono text-xs font-bold">
              <Shield className="w-3.5 h-3.5" />
              <span>DEFENSE CADET TERMINAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-purple-100 text-xs sm:text-sm max-w-xl">
              Track your awareness training trajectory, complete modules, and validate readiness with timed evaluations.
            </p>
          </div>

          {continueAction && (
            <Link
              to={
                continueAction.type === 'module'
                  ? `/learner/modules/${continueAction.slug || continueAction.id}`
                  : `/learner/quizzes/${continueAction.id}/instructions`
              }
              className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white hover:bg-[#F5F3FF] text-[#6D28D9] font-bold text-sm shadow-md transition active:scale-95 shrink-0"
            >
              <Play className="w-4 h-4 fill-[#6D28D9]" />
              <span>
                Continue {continueAction.type === 'module' ? 'Reading' : 'Quiz'}:{' '}
                <span className="font-extrabold">{continueAction.title?.slice(0, 20)}...</span>
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Real Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={FileCheck}
          title="Quizzes Attempted"
          value={metrics?.totalAttempts || 0}
          subtitle="Completed assessments"
          accent="purple"
        />
        <StatCard
          icon={TrendingUp}
          title="Average Score"
          value={`${metrics?.averageScore || 0}%`}
          subtitle="Overall performance"
          accent="emerald"
        />
        <StatCard
          icon={BookOpen}
          title="Modules Completed"
          value={metrics?.completedModules || 0}
          subtitle="Learning milestones"
          accent="purple"
        />
        <StatCard
          icon={Award}
          title="Achievements"
          value={metrics?.achievementsCount || 0}
          subtitle="Earned defense badges"
          accent="amber"
        />
      </div>

      {/* Simulation Lab Callout Banner */}
      <div className="rounded-2xl p-6 bg-[#FAF8FF] border border-[#DDD6FE] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] border border-[#DDD6FE] flex items-center justify-center text-[#6D28D9] shrink-0">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#6D28D9]">
                Interactive Simulation Lab
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#6D28D9] font-bold">
                NEW
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#1E1B4B]">
              Watch How It Happens: Step-by-Step Attack & Defense
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5 max-w-2xl">
              Observe cyberattacks unfold across dynamic visual network stages. Inspect vulnerabilities, recognize warning indicators, and activate defensive controls.
            </p>
          </div>
        </div>
        <Link
          to="/learner/watch-how-it-happens"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold transition shadow-md shadow-purple-500/20 shrink-0 self-start md:self-auto"
        >
          <span>Explore Simulations</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Quiz Attempts (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1E1B4B] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#6D28D9]" />
              <span>Recent Quiz Evaluations</span>
            </h2>
            <Link
              to="/learner/history"
              className="text-xs font-semibold text-[#6D28D9] hover:text-[#5B21B6] transition"
            >
              View Full History →
            </Link>
          </div>

          <div className="cyber-card rounded-2xl overflow-hidden border border-[#E5E7EB] bg-white">
            {recentAttempts.length === 0 ? (
              <div className="p-8 text-center text-[#64748B] text-sm">
                No quiz attempts recorded yet. Start by taking your first assessment!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8FF] text-[#64748B] font-mono uppercase tracking-wider border-b border-[#E5E7EB]">
                    <tr>
                      <th className="px-5 py-3.5">Quiz Assessment</th>
                      <th className="px-5 py-3.5">Score</th>
                      <th className="px-5 py-3.5">Result</th>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5 text-right">Review</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {recentAttempts.map((attempt) => (
                      <tr key={attempt._id} className="hover:bg-[#FAF8FF] transition">
                        <td className="px-5 py-4 font-semibold text-[#1E1B4B]">
                          {attempt.quiz?.title || 'Cybersecurity Assessment'}
                        </td>
                        <td className="px-5 py-4 font-mono font-bold">
                          <span
                            className={
                              attempt.percentage >= 70 ? 'text-[#15803D]' : 'text-[#B91C1C]'
                            }
                          >
                            {attempt.score}/{attempt.maxScore} ({attempt.percentage}%)
                          </span>
                        </td>
                        <td className="px-5 py-4">
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
                        <td className="px-5 py-4 text-[#64748B]">{formatDate(attempt.createdAt)}</td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            to={`/learner/quizzes/results/${attempt._id}`}
                            className="text-[#6D28D9] hover:text-[#5B21B6] font-medium underline"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recommended Modules */}
          <div className="space-y-4 pt-4">
            <h2 className="text-lg font-bold text-[#1E1B4B] flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>Recommended Next Modules</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendedModules.map((m) => (
                <Link
                  key={m._id}
                  to={`/learner/modules/${m.slug || m._id}`}
                  className="cyber-card rounded-xl p-5 group flex flex-col justify-between bg-white border border-[#E5E7EB] hover:border-[#DDD6FE]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono text-[#6D28D9] uppercase font-bold">
                        {m.topic?.title || 'Security'}
                      </span>
                      <DifficultyBadge level={m.difficultyLevel} />
                    </div>
                    <h3 className="text-sm font-bold text-[#1E1B4B] group-hover:text-[#6D28D9] transition mb-2">
                      {m.title}
                    </h3>
                    <p className="text-xs text-[#64748B] line-clamp-2">{m.shortDescription}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#64748B]">
                    <span>{m.estimatedReadingTime} min read</span>
                    <ArrowRight className="w-4 h-4 text-[#6D28D9] group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Badges and Progress Widget (Right col) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1E1B4B] flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Earned Badges</span>
            </h2>
            <Link
              to="/learner/progress"
              className="text-xs font-semibold text-[#6D28D9] hover:text-[#5B21B6] transition"
            >
              All Badges →
            </Link>
          </div>

          <div className="cyber-card rounded-2xl p-6 border border-[#E5E7EB] bg-white space-y-4">
            {achievements.length === 0 ? (
              <p className="text-xs text-[#64748B] text-center py-4">
                Complete modules and score 100% on quizzes to unlock badges!
              </p>
            ) : (
              achievements.slice(0, 4).map((ach) => (
                <div key={ach.code} className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE]">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-[#1E1B4B] truncate">{ach.title}</h4>
                    <p className="text-[11px] text-[#64748B] line-clamp-1">{ach.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

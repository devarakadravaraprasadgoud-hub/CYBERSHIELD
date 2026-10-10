import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/apiServices';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatCard } from '../../components/common/StatCard';
import { RoleBadge, StatusBadge } from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';
import {
  Users,
  Layers,
  BookOpen,
  HelpCircle,
  FileText,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  BarChart2,
  Settings,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await dashboardService.getAdmin();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Querying platform security operations center..." />;
  }

  const { metrics, recentUsers = [], recentAttempts = [] } = data || {};

  return (
    <div className="space-y-8">
      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDE9FE] border border-[#DDD6FE] text-[#6D28D9] font-mono text-xs font-bold mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-[#6D28D9]" />
            <span>GLOBAL ROOT ADMINISTRATOR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B]">
            Security Operations & Platform Center
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Global governance of awareness topics, curricula, registered users, and audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/topics"
            className="px-4 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-semibold text-xs transition shadow-sm"
          >
            Manage Topics
          </Link>
          <Link
            to="/admin/analytics"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F5F3FF] text-[#1E1B4B] font-semibold text-xs border border-slate-200 flex items-center gap-1.5 transition shadow-sm"
          >
            <BarChart2 className="w-4 h-4 text-[#6D28D9]" />
            <span>Analytics</span>
          </Link>
        </div>
      </div>

      {/* High-level Platform Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={Users}
          title="Total Users"
          value={metrics?.totalUsers || 0}
          subtitle={`Learners: ${metrics?.usersByRole?.learner || 0} • Staff: ${
            (metrics?.usersByRole?.instructor || 0) + (metrics?.usersByRole?.admin || 0)
          }`}
          accent="purple"
        />
        <StatCard
          icon={Layers}
          title="Published Topics"
          value={metrics?.publishedTopics || 0}
          subtitle={`Out of ${metrics?.totalTopics || 0} total topics`}
          accent="purple"
        />
        <StatCard
          icon={BookOpen}
          title="Active Modules"
          value={metrics?.publishedModules || 0}
          subtitle={`Out of ${metrics?.totalModules || 0} total modules`}
          accent="emerald"
        />
        <StatCard
          icon={TrendingUp}
          title="Platform Pass Rate"
          value={`${metrics?.passRate || 0}%`}
          subtitle={`Avg score: ${metrics?.averageScore || 0}% across ${
            metrics?.totalAttempts || 0
          } attempts`}
          accent="amber"
        />
      </div>

      {/* Tables Row: Recent Registrations & Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Registrations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1E1B4B] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#6D28D9]" />
              <span>Recent User Registrations</span>
            </h2>
            <Link to="/admin/users" className="text-xs font-semibold text-[#6D28D9] hover:text-[#5B21B6]">
              User Directory →
            </Link>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8FF] text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-[#F5F3FF]/50 transition">
                    <td className="px-5 py-3.5 font-bold text-[#1E1B4B]">
                      {u.name}
                      <span className="block text-[11px] font-normal text-slate-500">
                        {u.email}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Platform Attempts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1E1B4B] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#7C3AED]" />
              <span>Recent Platform Quiz Attempts</span>
            </h2>
            <Link to="/admin/reports" className="text-xs font-semibold text-[#6D28D9] hover:text-[#5B21B6]">
              Audit Logs →
            </Link>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8FF] text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Quiz</th>
                  <th className="px-5 py-3.5">Score</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAttempts.map((att) => (
                  <tr key={att._id} className="hover:bg-[#F5F3FF]/50 transition">
                    <td className="px-5 py-3.5 font-bold text-[#1E1B4B] truncate max-w-[120px]">
                      {att.user?.name || 'Cadet'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 truncate max-w-[140px]">
                      {att.quiz?.title}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-[#6D28D9]">
                      {att.percentage}%
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                          att.isPassed
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {att.isPassed ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

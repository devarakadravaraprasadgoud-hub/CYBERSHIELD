import React, { useEffect, useState } from 'react';
import { analyticsService } from '../../services/apiServices';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart2, TrendingUp, ShieldCheck, Activity } from 'lucide-react';

const COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#10b981'];

export const PlatformAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await analyticsService.getQuizPerformance();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Synthesizing platform performance telemetry..." />;
  }

  const { distribution = [], quizStats = [], timeline = [], totalAnalyzedAttempts = 0 } = data || {};

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-[#6D28D9] font-bold">
          TELEMETRY & VISUAL INTELLIGENCE
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] mt-1">
          Platform Security Analytics
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Empirical assessment metrics, cohort distribution graphs, and submission activity timelines.
        </p>
      </div>

      {/* Top Stat Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] border border-[#DDD6FE] flex items-center justify-center text-[#6D28D9]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-mono">Audited Attempts</span>
            <h4 className="text-xl font-bold text-[#1E1B4B]">{totalAnalyzedAttempts} Total Submissions</h4>
          </div>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
          Telemetry Real-Time
        </span>
      </div>

      {/* Two Column Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Distribution Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#1E1B4B] flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#6D28D9]" />
              <span>Score Distribution Cohorts</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">By Percentage Bracket</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="range" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E7EB',
                    borderRadius: '0.75rem',
                    color: '#1E1B4B',
                    fontSize: '12px',
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="count" name="Submissions" fill="#8b5cf6" radius={[6, 6, 0, 0]}>
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quiz Performance Averages */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#1E1B4B] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Average Score by Quiz Assessment</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">% Average</span>
          </div>

          <div className="h-64 w-full">
            {quizStats.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Awaiting more quiz evaluations...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quizStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} />
                  <YAxis
                    dataKey="title"
                    type="category"
                    stroke="#64748b"
                    fontSize={10}
                    width={100}
                    tickFormatter={(v) => (v.length > 14 ? `${v.substring(0, 14)}...` : v)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5E7EB',
                      borderRadius: '0.75rem',
                      color: '#1E1B4B',
                      fontSize: '12px',
                      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar
                    dataKey="avgPercentage"
                    name="Avg Score (%)"
                    fill="#6D28D9"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Activity Timeline Chart (Full width) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#1E1B4B] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#6D28D9]" />
            <span>14-Day Evaluation Activity Trend</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">Daily Submissions</span>
        </div>

        <div className="h-64 w-full">
          {timeline.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Activity data will chart here as quizzes are completed over the 14-day window.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="cyberGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6D28D9" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6D28D9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E7EB',
                    borderRadius: '0.75rem',
                    color: '#1E1B4B',
                    fontSize: '12px',
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="attempts"
                  name="Evaluations"
                  stroke="#6D28D9"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#cyberGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

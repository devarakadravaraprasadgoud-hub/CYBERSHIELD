import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { progressService } from '../../services/apiServices';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Shield,
  FileCheck,
  Zap,
  Terminal,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

const badgeIcons = {
  Shield,
  BookOpen,
  FileCheck,
  Zap,
  ShieldCheck,
  Terminal,
  Award
};

export const ProgressPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await progressService.getMyProgress();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating cadet readiness metrics..." />;
  }

  const { progress, metrics } = data || {};
  const completedModules = progress?.completedModules || [];
  const achievements = progress?.achievements || [];

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-[#6D28D9] font-bold">
          CADET ADVANCEMENT
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] mt-1">
          Progress & Achievements
        </h1>
        <p className="text-[#64748B] text-sm mt-1">
          Track your overall curriculum completion percentage and defense badges.
        </p>
      </div>

      {/* Progress Bars Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="cyber-card rounded-2xl p-6 border border-[#E5E7EB] bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-[#64748B] font-bold">
              Modules Completed
            </span>
            <span className="text-sm font-bold text-[#6D28D9] font-mono">
              {metrics?.moduleCompletionPercentage || 0}%
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 border border-slate-200 overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] rounded-full transition-all duration-500"
              style={{ width: `${metrics?.moduleCompletionPercentage || 0}%` }}
            />
          </div>
          <div className="text-xs text-[#64748B] flex items-center justify-between">
            <span>
              {metrics?.completedModulesCount || 0} of {metrics?.totalPublishedModules || 0} published modules completed
            </span>
          </div>
        </div>

        <div className="cyber-card rounded-2xl p-6 border border-[#E5E7EB] bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-[#64748B] font-bold">
              Quizzes Passed
            </span>
            <span className="text-sm font-bold text-[#15803D] font-mono">
              {metrics?.quizPassPercentage || 0}%
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 border border-slate-200 overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-[#15803D] to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${metrics?.quizPassPercentage || 0}%` }}
            />
          </div>
          <div className="text-xs text-[#64748B] flex items-center justify-between">
            <span>
              {metrics?.passedQuizzesCount || 0} of {metrics?.totalPublishedQuizzes || 0} quizzes passed
            </span>
          </div>
        </div>
      </div>

      {/* Earned Badges Showcase */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#1E1B4B] flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>Earned Defense Badges ({achievements.length})</span>
        </h2>

        {achievements.length === 0 ? (
          <div className="p-8 rounded-2xl cyber-card text-center text-[#64748B] text-sm bg-white border border-[#E5E7EB]">
            No badges unlocked yet. Complete your first module or pass a quiz to earn recognition!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((ach) => {
              const IconComponent = badgeIcons[ach.badgeIcon] || Award;
              return (
                <div
                  key={ach.code}
                  className="cyber-card rounded-2xl p-5 border border-amber-200 bg-white flex flex-col justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1E1B4B] leading-tight">{ach.title}</h4>
                      <span className="text-[10px] text-amber-700 font-mono">
                        Unlocked {formatDate(ach.earnedAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed">{ach.description}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Modules List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#1E1B4B] flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#6D28D9]" />
          <span>Completed Learning History</span>
        </h2>

        {completedModules.length === 0 ? (
          <div className="p-8 rounded-2xl cyber-card text-center text-[#64748B] text-sm bg-white border border-[#E5E7EB]">
            You haven't completed any modules yet.
          </div>
        ) : (
          <div className="cyber-card rounded-2xl overflow-hidden border border-[#E5E7EB] bg-white">
            <div className="divide-y divide-[#E5E7EB]">
              {completedModules.map((item, idx) => (
                <div key={idx} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#FAF8FF] transition">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-[#1E1B4B]">
                        {item.module?.title || 'Learning Module'}
                      </h4>
                      <span className="text-xs text-[#64748B]">
                        Completed on {formatDate(item.completedAt)}
                      </span>
                    </div>
                  </div>
                  {item.module && (
                    <Link
                      to={`/learner/modules/${item.module.slug || item.module._id}`}
                      className="text-xs font-semibold text-[#6D28D9] hover:text-[#5B21B6] flex items-center gap-1 shrink-0"
                    >
                      <span>Review</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

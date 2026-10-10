import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Layers,
  BookOpen,
  HelpCircle,
  History,
  Award,
  User,
  PlusCircle,
  BarChart2,
  Users,
  FileText,
  ShieldCheck,
  Sparkles,
  Eye
} from 'lucide-react';
import { RoleBadge } from './Badge';

export const Sidebar = () => {
  const { user, isAdmin, isInstructor } = useAuth();

  const learnerNav = [
    { label: 'Overview', path: '/learner/dashboard', icon: LayoutDashboard },
    { label: 'Browse Topics', path: '/topics', icon: Layers },
    { label: 'Learning Modules', path: '/learner/modules', icon: BookOpen },
    { label: 'Watch How It Happens', path: '/learner/watch-how-it-happens', icon: Eye },
    { label: 'Quiz History', path: '/learner/history', icon: History },
    { label: 'Achievements', path: '/learner/progress', icon: Award },
    { label: 'My Profile', path: '/learner/profile', icon: User }
  ];

  const instructorNav = [
    { label: 'Overview', path: '/instructor/dashboard', icon: LayoutDashboard },
    { label: 'My Modules', path: '/instructor/modules', icon: BookOpen },
    { label: 'Visual Resources', path: '/instructor/resources', icon: Sparkles },
    { label: 'Attack Simulations', path: '/instructor/attack-simulations', icon: Eye },
    { label: 'Create Module', path: '/instructor/modules/create', icon: PlusCircle },
    { label: 'My Quizzes', path: '/instructor/quizzes', icon: HelpCircle },
    { label: 'Learner Reports', path: '/instructor/performance', icon: BarChart2 },
    { label: 'My Profile', path: '/learner/profile', icon: User }
  ];

  const adminNav = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Topic Management', path: '/admin/topics', icon: Layers },
    { label: 'Module Management', path: '/admin/modules', icon: BookOpen },
    { label: 'Visual Resources', path: '/admin/resources', icon: Sparkles },
    { label: 'Attack Simulations', path: '/admin/attack-simulations', icon: Eye },
    { label: 'Quiz Management', path: '/admin/quizzes', icon: HelpCircle },
    { label: 'User Directory', path: '/admin/users', icon: Users },
    { label: 'Attempt Audits', path: '/admin/reports', icon: FileText },
    { label: 'Platform Analytics', path: '/admin/analytics', icon: BarChart2 },
    { label: 'Account Profile', path: '/learner/profile', icon: User }
  ];

  let currentNav = learnerNav;
  let sectionTitle = 'Learner Portal';
  if (isAdmin) {
    currentNav = adminNav;
    sectionTitle = 'Administration Portal';
  } else if (isInstructor) {
    currentNav = instructorNav;
    sectionTitle = 'Instructor Command';
  }

  return (
    <aside className="w-64 shrink-0 hidden lg:block border-r border-[#E5E7EB] bg-white min-h-[calc(100vh-4rem)] p-4 shadow-[1px_0_3px_0_rgba(0,0,0,0.02)]">
      {/* User Mini Profile */}
      <div className="p-3 mb-6 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] border border-[#DDD6FE] flex items-center justify-center text-[#6D28D9] font-bold font-mono">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-[#1E1B4B] truncate">{user?.name}</span>
            <RoleBadge role={user?.role} />
          </div>
        </div>
      </div>

      <div className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] font-bold px-3 mb-2">
        {sectionTitle}
      </div>

      <nav className="space-y-1">
        {currentNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#EDE9FE] border border-[#DDD6FE] text-[#6D28D9] shadow-xs font-semibold'
                    : 'text-[#475569] hover:text-[#1E1B4B] hover:bg-[#F5F3FF]'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Security Status Box */}
      <div className="mt-10 p-3.5 rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] text-xs">
        <div className="flex items-center gap-2 text-[#15803D] font-semibold mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Security Engine Active</span>
        </div>
        <p className="text-[#64748B] text-[11px] leading-relaxed">
          Zero-trust session authorization & real-time telemetry verified.
        </p>
      </div>
    </aside>
  );
};

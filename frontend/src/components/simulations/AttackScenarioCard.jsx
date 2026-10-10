import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  MailWarning,
  Database,
  FileLock2,
  Radio,
  Activity,
  KeyRound,
  Code,
  Search,
  Lock,
  Play,
  Clock,
  CheckCircle2,
  ChevronRight,
  Eye
} from 'lucide-react';
import { DifficultyBadge } from '../common/Badge';

const CATEGORY_META = {
  phishing: {
    label: 'Phishing Attacks',
    icon: MailWarning,
    color: 'text-rose-600 bg-rose-50 border-rose-200'
  },
  password: {
    label: 'Password Attacks',
    icon: KeyRound,
    color: 'text-amber-600 bg-amber-50 border-amber-200'
  },
  sqli: {
    label: 'SQL Injection',
    icon: Database,
    color: 'text-purple-600 bg-purple-50 border-purple-200'
  },
  xss: {
    label: 'Cross-Site Scripting',
    icon: Code,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200'
  },
  mitm: {
    label: 'Man-in-the-Middle',
    icon: Radio,
    color: 'text-blue-600 bg-blue-50 border-blue-200'
  },
  ransomware: {
    label: 'Ransomware',
    icon: FileLock2,
    color: 'text-red-600 bg-red-50 border-red-200'
  },
  dos: {
    label: 'Denial-of-Service',
    icon: Activity,
    color: 'text-orange-600 bg-orange-50 border-orange-200'
  },
  reconnaissance: {
    label: 'Network Reconnaissance',
    icon: Search,
    color: 'text-cyan-600 bg-cyan-50 border-cyan-200'
  },
  auth: {
    label: 'Identity & Auth',
    icon: Lock,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
  },
  malware: {
    label: 'Malware Awareness',
    icon: ShieldAlert,
    color: 'text-violet-600 bg-violet-50 border-violet-200'
  }
};

export const AttackScenarioCard = ({ simulation, onSelect }) => {
  const meta = CATEGORY_META[simulation.category] || {
    label: simulation.category,
    icon: ShieldAlert,
    color: 'text-[#6D28D9] bg-[#EDE9FE] border-[#DDD6FE]'
  };

  const Icon = meta.icon;
  const isCompleted = Boolean(simulation.userProgress?.isCompleted);

  return (
    <div className="group bg-white rounded-2xl p-6 border border-[#E5E7EB] hover:border-[#C4B5FD] hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.color}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{meta.label}</span>
          </span>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] text-[#64748B] font-mono">
              <Clock className="w-3 h-3" />
              <span>{simulation.estimatedDuration || '8 min'}</span>
            </span>
            <DifficultyBadge level={simulation.difficulty || 'beginner'} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-[#1E1B4B] group-hover:text-[#6D28D9] transition-colors mb-2 line-clamp-2">
          {simulation.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-[#475569] leading-relaxed mb-4 line-clamp-3">
          {simulation.description}
        </p>

        {/* Learning Objectives Pill preview */}
        {simulation.learningObjectives?.length > 0 && (
          <div className="mb-5 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] font-bold block">
              Core Takeaway
            </span>
            <p className="text-[11px] text-[#64748B] line-clamp-1 italic">
              • {simulation.learningObjectives[0]}
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        <div>
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#15803D] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed</span>
            </span>
          ) : (
            <span className="text-xs text-[#64748B] font-medium flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>Interactive</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Learn Defense button */}
          <Link
            to={`/learner/watch-how-it-happens/${simulation._id}?mode=defense`}
            className="px-3 py-1.5 rounded-xl border border-[#DDD6FE] bg-[#FAF8FF] hover:bg-[#EDE9FE] text-[#6D28D9] text-xs font-semibold transition flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Learn Defense</span>
          </Link>

          {/* Watch Simulation primary button */}
          <Link
            to={`/learner/watch-how-it-happens/${simulation._id}?mode=attack`}
            className="px-3.5 py-1.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 group-hover:translate-x-0.5"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Watch Simulation</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  Video,
  Headphones,
  GitBranch,
  Layers,
  Terminal,
  CheckCircle2,
  Clock,
  ExternalLink,
  Play,
  Sparkles
} from 'lucide-react';
import { DifficultyBadge } from '../common/Badge';

export const getResourceTypeInfo = (type) => {
  switch (type) {
    case 'video':
      return {
        label: 'Video Lesson',
        icon: Video,
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
        cta: 'Watch Video'
      };
    case 'audio':
      return {
        label: 'Audio Lecture',
        icon: Headphones,
        badgeBg: 'bg-purple-50 text-[#6D28D9] border-purple-200',
        cta: 'Listen to Audio'
      };
    case 'flowchart':
      return {
        label: 'Interactive Flowchart',
        icon: GitBranch,
        badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        cta: 'Explore Flowchart'
      };
    case 'diagram':
    case 'infographic':
      return {
        label: type === 'infographic' ? 'Infographic Matrix' : 'Concept Diagram',
        icon: Layers,
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
        cta: 'Inspect Diagram'
      };
    case 'simulation':
      return {
        label: 'Interactive Lab',
        icon: Terminal,
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        cta: 'Launch Simulator'
      };
    default:
      return {
        label: 'Learning Resource',
        icon: Sparkles,
        badgeBg: 'bg-slate-50 text-slate-700 border-slate-200',
        cta: 'Open Resource'
      };
  }
};

export const ResourceCard = ({ resource, progress, onOpen }) => {
  const { label, icon: Icon, badgeBg, cta } = getResourceTypeInfo(resource.type);
  const isCompleted = Boolean(progress?.isCompleted || resource.progress?.isCompleted);

  return (
    <div
      onClick={() => onOpen && onOpen(resource)}
      className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-[#DDD6FE] hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Header row: type badge, duration, difficulty */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${badgeBg}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </span>

          <div className="flex items-center gap-2">
            {resource.duration && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                <Clock className="w-3 h-3" />
                <span>{resource.duration}</span>
              </span>
            )}
            <DifficultyBadge level={resource.difficulty || 'beginner'} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-[#1E1B4B] group-hover:text-[#6D28D9] transition-colors mb-2 line-clamp-2">
          {resource.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2">
          {resource.description}
        </p>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {resource.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-[#FAF8FF] text-[10px] font-mono text-slate-500 border border-slate-200/80"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Completion status & Launch CTA */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed</span>
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium">Ready to start</span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onOpen) onOpen(resource);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-semibold shadow-xs transition-colors group-hover:translate-x-0.5"
        >
          <span>{cta}</span>
          <Play className="w-3 h-3 fill-current" />
        </button>
      </div>
    </div>
  );
};

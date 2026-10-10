import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { moduleService } from '../../services/apiServices';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DifficultyBadge } from '../../components/common/Badge';
import { VisualLearningHub } from '../../components/resources/VisualLearningHub';
import {
  CheckCircle2,
  Clock,
  ArrowLeft,
  Info,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  Check,
  Shield,
  BookOpen,
  Sparkles
} from 'lucide-react';

export const ModuleReaderPage = () => {
  const { id } = useParams();
  const toast = useToast();
  const [moduleDoc, setModuleDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'visual'

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const res = await moduleService.getById(id);
        setModuleDoc(res.data);
        setIsCompleted(res.data.isCompleted || false);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load learning module');
      } finally {
        setLoading(false);
      }
    };
    fetchModule();
  }, [id]);

  const handleMarkComplete = async () => {
    if (!moduleDoc?._id || isCompleted) return;
    setCompleting(true);
    try {
      await moduleService.complete(moduleDoc._id);
      setIsCompleted(true);
      toast.success('Module marked as completed! Progress updated.');
    } catch (err) {
      toast.error(err.message || 'Failed to record completion');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Decrypting learning module contents..." />;
  }

  if (!moduleDoc) {
    return (
      <div className="p-8 text-center text-[#64748B]">
        Module not found or unavailable.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/learner/modules"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#6D28D9] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Learning Modules</span>
        </Link>
      </div>

      {/* Module Header Card */}
      <div className="cyber-card rounded-3xl p-6 sm:p-10 border border-[#E5E7EB] bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#6D28D9] px-3 py-1 rounded-full bg-[#EDE9FE] border border-[#DDD6FE]">
              {moduleDoc.topic?.title || 'Security'}
            </span>
            <DifficultyBadge level={moduleDoc.difficultyLevel} />
          </div>

          <div className="flex items-center gap-2 text-xs text-[#64748B] font-mono">
            <Clock className="w-4 h-4" />
            <span>{moduleDoc.estimatedReadingTime} min estimated read</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1E1B4B] mb-4 leading-tight">
          {moduleDoc.title}
        </h1>
        <p className="text-sm sm:text-base text-[#475569] leading-relaxed max-w-3xl">
          {moduleDoc.shortDescription}
        </p>

        {/* Completion status bar */}
        <div className="mt-6 pt-6 border-t border-[#E5E7EB] flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#15803D] text-xs font-bold font-mono">
                <CheckCircle2 className="w-4 h-4" />
                MODULE COMPLETED
              </span>
            ) : (
              <span className="text-xs text-[#64748B] font-medium">
                Read through the content below and click complete when finished.
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={isCompleted || completing}
            onClick={handleMarkComplete}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 active:scale-95 ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                : 'bg-[#6D28D9] hover:bg-[#5B21B6] text-white shadow-md shadow-purple-500/20'
            }`}
          >
            {isCompleted ? (
              <>
                <Check className="w-4 h-4" />
                <span>Marked Complete</span>
              </>
            ) : completing ? (
              <span>Saving...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark as Complete</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* View Switcher Tabs: Text Curriculum vs Visual Learning Hub */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-[#E5E7EB] rounded-2xl shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('text')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'text'
              ? 'bg-[#6D28D9] text-white shadow-md shadow-purple-500/20'
              : 'text-[#64748B] hover:text-[#1E1B4B] hover:bg-[#F5F3FF]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Curriculum Text</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('visual')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'visual'
              ? 'bg-[#6D28D9] text-white shadow-md shadow-purple-500/20'
              : 'text-[#64748B] hover:text-[#1E1B4B] hover:bg-[#F5F3FF]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Visual Learning Hub</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-mono font-bold ${
            activeTab === 'visual' ? 'bg-white/20 text-white' : 'bg-[#EDE9FE] text-[#6D28D9]'
          }`}>
            Interactive
          </span>
        </button>
      </div>

      {activeTab === 'visual' ? (
        <VisualLearningHub moduleId={moduleDoc._id} />
      ) : (
        <>
          {/* Learning Objectives Box */}
          {moduleDoc.learningObjectives?.length > 0 && (
            <div className="bg-[#FAF8FF] rounded-2xl p-6 border border-[#DDD6FE]">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#6D28D9] font-bold mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>LEARNING OBJECTIVES</span>
              </h3>
              <ul className="space-y-2.5">
                {moduleDoc.learningObjectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-[#475569]">
                    <CheckCircle2 className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Content Sections */}
          <div className="space-y-8">
            {moduleDoc.contentSections?.map((section, idx) => {
              let calloutColor = 'border-[#DDD6FE] bg-[#F5F3FF] text-[#1E1B4B]';
              let CalloutIcon = Info;

              if (section.calloutType === 'warning') {
                calloutColor = 'border-amber-200 bg-amber-50 text-amber-900';
                CalloutIcon = AlertTriangle;
              } else if (section.calloutType === 'alert') {
                calloutColor = 'border-rose-200 bg-rose-50 text-rose-900';
                CalloutIcon = AlertCircle;
              } else if (section.calloutType === 'tip') {
                calloutColor = 'border-emerald-200 bg-emerald-50 text-emerald-900';
                CalloutIcon = Lightbulb;
              }

              return (
                <div key={section._id || idx} className="cyber-card rounded-2xl p-6 sm:p-8 space-y-4 bg-white border border-[#E5E7EB]">
                  <h2 className="text-lg sm:text-xl font-bold text-[#1E1B4B] tracking-wide">
                    {section.title}
                  </h2>

                  <p className="text-sm sm:text-base text-[#475569] leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>

                  {section.calloutType && section.calloutType !== 'none' && section.calloutText && (
                    <div className={`p-4 rounded-xl border flex items-start gap-3 ${calloutColor}`}>
                      <CalloutIcon className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm font-medium leading-relaxed">
                        {section.calloutText}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Switch to Visual Learning Callout */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#EDE9FE]/50 to-[#F5F3FF] border border-[#DDD6FE] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#DDD6FE] flex items-center justify-center text-[#6D28D9] shrink-0 shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1E1B4B]">Ready for hands-on visual practice?</h4>
                <p className="text-xs text-[#64748B]">
                  Explore interactive flowcharts, audio lessons, concept maps, and live security simulations.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('visual')}
              className="px-4 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-xs transition shadow-sm shrink-0 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Visual Hub</span>
            </button>
          </div>

          {/* Completion Action Footer */}
          <div className="bg-white rounded-2xl p-6 text-center border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h4 className="text-sm font-bold text-[#1E1B4B]">Finished this learning module?</h4>
              <p className="text-xs text-[#64748B]">
                Confirm your completion to update your cadet progress and unlock badges.
              </p>
            </div>

            <button
              type="button"
              disabled={isCompleted || completing}
              onClick={handleMarkComplete}
              className={`px-6 py-3 rounded-xl font-bold text-xs transition flex items-center gap-2 active:scale-95 shrink-0 ${
                isCompleted
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-[#6D28D9] hover:bg-[#5B21B6] text-white shadow-md shadow-purple-500/20'
              }`}
            >
              {isCompleted ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Completed</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark as Complete</span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

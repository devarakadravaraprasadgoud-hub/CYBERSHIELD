import React, { useState } from 'react';
import {
  Video,
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  AlertCircle,
  ExternalLink,
  Check
} from 'lucide-react';
import { DifficultyBadge } from '../common/Badge';

const formatEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
};

export const VideoPlayer = ({ resource, onMarkComplete, completing = false }) => {
  const [activeTab, setActiveTab] = useState('player'); // 'player' | 'transcript' | 'takeaways'
  const isCompleted = Boolean(resource.progress?.isCompleted);
  const embedUrl = formatEmbedUrl(resource.contentUrl);

  return (
    <div className="space-y-6">
      {/* Video Container / Player Frame */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={resource.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#1E1B4B] to-[#3B0764] text-white">
            <Video className="w-12 h-12 text-[#A78BFA] mb-3 animate-pulse" />
            <h4 className="text-lg font-bold mb-1">{resource.title}</h4>
            <p className="text-xs text-purple-200 max-w-md">
              Video lecture prepared by {resource.provider || 'CyberShield Academy'}. Refer to the lecture transcript and key takeaways below.
            </p>
          </div>
        )}
      </div>

      {/* Header details & Mark Complete Button */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#6D28D9] px-2.5 py-0.5 rounded-md bg-[#EDE9FE] border border-[#DDD6FE]">
              {resource.provider || 'Educational Video'}
            </span>
            <DifficultyBadge level={resource.difficulty || 'beginner'} />
            {resource.duration && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>{resource.duration}</span>
              </span>
            )}
          </div>
          <h2 className="text-xl font-extrabold text-[#1E1B4B]">{resource.title}</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">{resource.description}</p>
        </div>

        <button
          type="button"
          onClick={() => onMarkComplete && onMarkComplete(resource._id)}
          disabled={completing}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 shrink-0 active:scale-95 ${
            isCompleted
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              : 'bg-[#6D28D9] hover:bg-[#5B21B6] text-white shadow-sm'
          }`}
        >
          {isCompleted ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Completed</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{completing ? 'Saving...' : 'Mark as Watched'}</span>
            </>
          )}
        </button>
      </div>

      {/* Secondary Tabs: Lecture Overview, Transcript, Takeaways */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="flex border-b border-slate-200 bg-[#FAF8FF] px-4 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('player')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'player'
                ? 'border-[#6D28D9] text-[#6D28D9]'
                : 'border-transparent text-slate-600 hover:text-[#1E1B4B]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Lecture Overview</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transcript')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'transcript'
                ? 'border-[#6D28D9] text-[#6D28D9]'
                : 'border-transparent text-slate-600 hover:text-[#1E1B4B]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Full Transcript</span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'player' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#1E1B4B]">Key Learning Takeaways</h4>
              {resource.keyTakeaways && resource.keyTakeaways.length > 0 ? (
                <ul className="space-y-2">
                  {resource.keyTakeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">
                  Follow along with the video playback and take notes on key commands and defensive concepts.
                </p>
              )}
            </div>
          )}

          {activeTab === 'transcript' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[#1E1B4B]">Verbatim Lecture Transcript</h4>
              <div className="bg-[#FAF8FF] rounded-xl p-4 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-line font-normal">
                {resource.transcript ||
                  'Audio transcript is being finalized for this visual session. Refer to the key takeaways tab for the core concepts.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

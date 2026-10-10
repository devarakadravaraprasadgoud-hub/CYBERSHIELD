import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Video,
  Headphones,
  GitBranch,
  Layers,
  Terminal,
  Search,
  CheckCircle2,
  X,
  Maximize2,
  BookOpen
} from 'lucide-react';
import { resourceService } from '../../services/apiServices';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import { ResourceCard } from './ResourceCard';
import { VideoPlayer } from './VideoPlayer';
import { AudioPlayer } from './AudioPlayer';
import { InteractiveFlowchart } from './InteractiveFlowchart';
import { ConceptMapViewer } from './ConceptMapViewer';
import { SimulationPanel } from './SimulationPanel';

export const VisualLearningHub = ({ moduleId, onProgressUpdate }) => {
  const toast = useToast();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const [summary, setSummary] = useState({ totalResources: 0, completedCount: 0, overallProgress: 0 });

  const fetchResources = async () => {
    if (!moduleId) return;
    setLoading(true);
    try {
      const res = await resourceService.getByModule(moduleId, {
        type: activeType !== 'all' ? activeType : undefined,
        search: searchTerm || undefined
      });
      setResources(res.data?.resources || []);
      setSummary(res.data?.summary || { totalResources: 0, completedCount: 0, overallProgress: 0 });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load visual learning resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [moduleId, activeType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const handleMarkComplete = async (resourceId) => {
    setCompletingId(resourceId);
    try {
      await resourceService.saveProgress(resourceId, {
        lastPosition: 100,
        completionPercentage: 100,
        isCompleted: true
      });
      toast.success('Visual resource marked as completed!');

      // Update local state
      setResources((prev) =>
        prev.map((r) =>
          r._id === resourceId
            ? { ...r, progress: { ...r.progress, isCompleted: true, completionPercentage: 100 } }
            : r
        )
      );

      if (selectedResource && selectedResource._id === resourceId) {
        setSelectedResource((prev) => ({
          ...prev,
          progress: { ...prev.progress, isCompleted: true, completionPercentage: 100 }
        }));
      }

      setSummary((prev) => {
        const nextCompleted = Math.min(prev.totalResources, prev.completedCount + 1);
        return {
          ...prev,
          completedCount: nextCompleted,
          overallProgress: prev.totalResources > 0 ? Math.round((nextCompleted / prev.totalResources) * 100) : 0
        };
      });

      if (onProgressUpdate) {
        onProgressUpdate();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update progress');
    } finally {
      setCompletingId(null);
    }
  };

  const filterTabs = [
    { id: 'all', label: 'All Resources', icon: Sparkles },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'audio', label: 'Audio & Podcasts', icon: Headphones },
    { id: 'flowchart', label: 'Flowcharts', icon: GitBranch },
    { id: 'diagram', label: 'Diagrams & Infographics', icon: Layers },
    { id: 'simulation', label: 'Interactive Labs', icon: Terminal }
  ];

  return (
    <div className="space-y-6">
      {/* Visual Learning Metrics & Hero Banner */}
      <div className="bg-gradient-to-br from-[#FAF8FF] to-[#F5F3FF] rounded-3xl p-6 sm:p-8 border border-[#DDD6FE] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDE9FE] border border-[#DDD6FE] text-[#6D28D9] font-mono text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MULTIMEDIA DEFENSE SUITE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B]">
              Visual Learning Resources
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Reinforce conceptual cybersecurity knowledge through embedded video lectures, audio briefings, interactive process flowcharts, and safe hands-on sandboxes.
            </p>
          </div>

          {/* Progress gauge card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center font-mono font-extrabold text-[#6D28D9] text-base">
              {summary.overallProgress}%
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase text-slate-500 block">Visual Mastery</span>
              <strong className="text-xs font-bold text-[#1E1B4B]">
                {summary.completedCount} of {summary.totalResources} Completed
              </strong>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 w-full h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-[#6D28D9] transition-all duration-500 rounded-full"
            style={{ width: `${summary.overallProgress}%` }}
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Type Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveType(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                  isActive
                    ? 'bg-[#6D28D9] text-white shadow-xs'
                    : 'bg-[#FAF8FF] text-slate-600 border border-slate-200 hover:bg-[#F5F3FF]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search resources..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF8FF] border border-slate-200 text-xs text-[#1E1B4B] placeholder-slate-400 focus:outline-none focus:border-[#6D28D9] focus:bg-white"
          />
        </form>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <LoadingSpinner message="Loading visual learning resources..." />
      ) : resources.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No resources match current filter"
          description="Try selecting 'All Resources' or clearing your search term."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => (
            <ResourceCard
              key={res._id}
              resource={res}
              onOpen={(item) => setSelectedResource(item)}
            />
          ))}
        </div>
      )}

      {/* Interactive Modal Viewer for Selected Resource */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden my-auto animate-scaleUp">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-[#FAF8FF]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-[#6D28D9] px-2.5 py-0.5 rounded-md bg-[#EDE9FE] border border-[#DDD6FE]">
                  {selectedResource.type?.toUpperCase()}
                </span>
                <span className="text-xs font-bold text-[#1E1B4B] truncate max-w-md">
                  {selectedResource.title}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedResource(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
                title="Close viewer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Active Resource Player */}
            <div className="p-6 overflow-y-auto flex-1">
              {selectedResource.type === 'video' && (
                <VideoPlayer
                  resource={selectedResource}
                  onMarkComplete={handleMarkComplete}
                  completing={completingId === selectedResource._id}
                />
              )}

              {selectedResource.type === 'audio' && (
                <AudioPlayer
                  resource={selectedResource}
                  onMarkComplete={handleMarkComplete}
                  completing={completingId === selectedResource._id}
                />
              )}

              {selectedResource.type === 'flowchart' && (
                <InteractiveFlowchart
                  resource={selectedResource}
                  onMarkComplete={handleMarkComplete}
                  completing={completingId === selectedResource._id}
                />
              )}

              {(selectedResource.type === 'diagram' || selectedResource.type === 'infographic') && (
                <ConceptMapViewer
                  resource={selectedResource}
                  onMarkComplete={handleMarkComplete}
                  completing={completingId === selectedResource._id}
                />
              )}

              {selectedResource.type === 'simulation' && (
                <SimulationPanel
                  resource={selectedResource}
                  onMarkComplete={handleMarkComplete}
                  completing={completingId === selectedResource._id}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

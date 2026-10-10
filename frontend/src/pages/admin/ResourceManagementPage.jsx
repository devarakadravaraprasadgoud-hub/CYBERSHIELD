import React, { useEffect, useState } from 'react';
import { resourceService, moduleService } from '../../services/apiServices';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import { DifficultyBadge, StatusBadge } from '../../components/common/Badge';
import {
  Sparkles,
  PlusCircle,
  Edit,
  Trash2,
  Globe,
  EyeOff,
  Search,
  Filter,
  Video,
  Headphones,
  GitMerge,
  Network,
  FileText,
  Cpu,
  Layers,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

const TYPE_CONFIG = {
  video: { label: 'Video', icon: Video, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  audio: { label: 'Audio', icon: Headphones, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  flowchart: { label: 'Flowchart', icon: GitMerge, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  diagram: { label: 'Diagram', icon: Network, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  simulation: { label: 'Simulation', icon: Cpu, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  infographic: { label: 'Infographic', icon: FileText, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' }
};

const INITIAL_FORM = {
  title: '',
  description: '',
  module: '',
  type: 'video',
  contentUrl: '',
  thumbnailUrl: '',
  duration: '5 min',
  difficulty: 'beginner',
  provider: 'CyberShield Academy',
  transcript: '',
  keyTakeaways: '',
  simulationType: 'none',
  tags: '',
  isPublished: true
};

export const ResourceManagementPage = () => {
  const [resources, setResources] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const fetchResources = async () => {
    setLoading(true);
    try {
      const [resResponse, modResponse] = await Promise.all([
        resourceService.getAllAdmin({
          limit: 100,
          search: search || undefined,
          module: selectedModule || undefined,
          type: selectedType !== 'all' ? selectedType : undefined
        }),
        moduleService.getAll({ limit: 100 })
      ]);

      const resList = resResponse.data?.resources || resResponse.data || [];
      setResources(Array.isArray(resList) ? resList : []);
      setModules(modResponse.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load visual learning resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedModule, selectedType]);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      ...INITIAL_FORM,
      module: modules[0]?._id || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (res) => {
    setEditingId(res._id);
    setFormData({
      title: res.title || '',
      description: res.description || '',
      module: typeof res.module === 'object' ? res.module?._id : res.module || '',
      type: res.type || 'video',
      contentUrl: res.contentUrl || '',
      thumbnailUrl: res.thumbnailUrl || '',
      duration: res.duration || '5 min',
      difficulty: res.difficulty || 'beginner',
      provider: res.provider || 'CyberShield Academy',
      transcript: res.transcript || '',
      keyTakeaways: Array.isArray(res.keyTakeaways) ? res.keyTakeaways.join('\n') : '',
      simulationType: res.simulationType || 'none',
      tags: Array.isArray(res.tags) ? res.tags.join(', ') : '',
      isPublished: res.isPublished !== undefined ? res.isPublished : true
    });
    setIsModalOpen(true);
  };

  const handleTogglePublish = async (resItem) => {
    try {
      await resourceService.update(resItem._id, { isPublished: !resItem.isPublished });
      toast.success(`Resource ${!resItem.isPublished ? 'published' : 'moved to drafts'}`);
      setResources((prev) =>
        prev.map((r) => (r._id === resItem._id ? { ...r, isPublished: !r.isPublished } : r))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update publication status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.module) {
      toast.error('Please complete title, description, and module.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        module: formData.module,
        type: formData.type,
        contentUrl: formData.contentUrl.trim(),
        thumbnailUrl: formData.thumbnailUrl.trim(),
        duration: formData.duration.trim(),
        difficulty: formData.difficulty,
        provider: formData.provider.trim(),
        transcript: formData.transcript.trim(),
        simulationType: formData.type === 'simulation' ? formData.simulationType : 'none',
        keyTakeaways: formData.keyTakeaways
          ? formData.keyTakeaways.split('\n').map((s) => s.trim()).filter(Boolean)
          : [],
        tags: formData.tags
          ? formData.tags.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        isPublished: Boolean(formData.isPublished)
      };

      if (editingId) {
        await resourceService.update(editingId, payload);
        toast.success('Visual learning resource updated successfully');
      } else {
        await resourceService.create(payload);
        toast.success('New visual learning resource published successfully');
      }

      setIsModalOpen(false);
      fetchResources();
    } catch (err) {
      toast.error(err.message || 'Failed to save resource');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await resourceService.delete(deleteTarget._id);
      toast.success('Resource deleted successfully');
      setResources((prev) => prev.filter((r) => r._id !== deleteTarget._id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete resource');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#6D28D9] font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MULTIMEDIA & LAB MANAGEMENT</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] mt-1">
            Visual Learning Resources
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            Manage educational videos, audio lessons, interactive flowcharts, concept maps, and security simulations.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-sm shrink-0 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Resource</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchResources()}
            placeholder="Search resource title or description..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] text-sm text-[#1E1B4B] placeholder-[#94A3B8] focus:outline-none focus:border-[#6D28D9] focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Module Filter */}
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] text-xs sm:text-sm text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white"
          >
            <option value="">All Learning Modules</option>
            {modules.map((m) => (
              <option key={m._id} value={m._id}>
                {m.title}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] text-xs sm:text-sm text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white"
          >
            <option value="all">All Formats</option>
            <option value="video">Videos</option>
            <option value="audio">Audios</option>
            <option value="flowchart">Flowcharts</option>
            <option value="diagram">Diagrams</option>
            <option value="simulation">Simulations</option>
            <option value="infographic">Infographics</option>
          </select>
        </div>
      </div>

      {/* Content Table / List */}
      {loading ? (
        <LoadingSpinner message="Loading visual resources library..." />
      ) : resources.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No resources match filters"
          description="Adjust your search criteria or create a new interactive resource for students."
        />
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8FF] text-[#475569] font-bold uppercase tracking-wider border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-4">Resource</th>
                  <th className="px-6 py-4">Format</th>
                  <th className="px-6 py-4">Associated Module</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {resources.map((resItem) => {
                  const cfg = TYPE_CONFIG[resItem.type] || TYPE_CONFIG.video;
                  const Icon = cfg.icon;
                  const moduleTitle = resItem.module?.title || 'General Module';

                  return (
                    <tr key={resItem._id} className="hover:bg-[#F5F3FF]/50 transition">
                      {/* Title & Preview */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 max-w-sm">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${cfg.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-[#1E1B4B] block truncate" title={resItem.title}>
                              {resItem.title}
                            </span>
                            <span className="text-[11px] text-[#64748B] line-clamp-1">
                              {resItem.description}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Format Badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[11px] font-bold border ${cfg.color}`}>
                          <Icon className="w-3 h-3" />
                          <span>{cfg.label}</span>
                        </span>
                      </td>

                      {/* Associated Module */}
                      <td className="px-6 py-4 text-[#475569] max-w-[200px] truncate" title={moduleTitle}>
                        {moduleTitle}
                      </td>

                      {/* Difficulty */}
                      <td className="px-6 py-4">
                        <DifficultyBadge level={resItem.difficulty || 'beginner'} />
                      </td>

                      {/* Duration */}
                      <td className="px-6 py-4 font-mono text-[#64748B]">
                        {resItem.duration || '5 min'}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge isPublished={resItem.isPublished} />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(resItem)}
                            className={`p-1.5 rounded-lg border transition ${
                              resItem.isPublished
                                ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                : 'border-amber-200 text-amber-700 hover:bg-amber-50'
                            }`}
                            title={resItem.isPublished ? 'Unpublish' : 'Publish'}
                          >
                            {resItem.isPublished ? <Globe className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(resItem)}
                            className="p-1.5 rounded-lg border border-[#E5E7EB] text-[#64748B] hover:text-[#6D28D9] hover:bg-[#F5F3FF] transition"
                            title="Edit Resource"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(resItem)}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Resource"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Resource Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Visual Learning Resource' : 'Create Visual Learning Resource'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
              Resource Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Nmap Port Scanning Workflow & TCP Flags"
              className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
              Brief Description *
            </label>
            <textarea
              required
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explain what the learner will discover in this visual resource..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white resize-none"
            />
          </div>

          {/* Module & Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
                Parent Module *
              </label>
              <select
                required
                value={formData.module}
                onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white"
              >
                <option value="">Select a Module</option>
                {modules.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
                Resource Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white"
              >
                <option value="video">Video (YouTube / Embed)</option>
                <option value="audio">Audio Guide / Podcast</option>
                <option value="flowchart">Interactive Flowchart</option>
                <option value="diagram">Concept Map & Architecture</option>
                <option value="simulation">Interactive Security Lab</option>
                <option value="infographic">Infographic / Diagram</option>
              </select>
            </div>
          </div>

          {/* Type-Specific Options */}
          {formData.type === 'simulation' && (
            <div className="p-4 rounded-xl bg-[#EDE9FE]/40 border border-[#DDD6FE] space-y-3">
              <label className="block text-xs font-bold text-[#6D28D9] uppercase tracking-wider">
                Select Interactive Security Lab
              </label>
              <select
                value={formData.simulationType}
                onChange={(e) => setFormData({ ...formData, simulationType: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#DDD6FE] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9]"
              >
                <option value="firewall">Firewall Packet Filter & Stateful Rules Lab</option>
                <option value="password">Shannon Password Entropy & GPU Brute Force Estimator</option>
                <option value="sqli">SQL Injection Vulnerability Sandbox</option>
                <option value="phishing">Phishing Email Forensics & Threat Indicator Inspector</option>
                <option value="hash">Cryptographic Hash Digest & Avalanche Effect Explorer</option>
                <option value="tcp_handshake">TCP 3-Way Handshake Protocol Animator</option>
              </select>
              <p className="text-[11px] text-[#64748B]">
                Interactive security labs run safely client-side in an isolated sandbox.
              </p>
            </div>
          )}

          {(formData.type === 'video' || formData.type === 'infographic') && (
            <div>
              <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
                Content URL {formData.type === 'video' ? '(YouTube or Video Embed)' : '(Image / Graphic URL)'}
              </label>
              <input
                type="url"
                value={formData.contentUrl}
                onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white"
              />
            </div>
          )}

          {formData.type === 'audio' && (
            <div>
              <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
                Audio Stream URL (Optional, Speech Synthesis used as AI Voice fallback)
              </label>
              <input
                type="url"
                value={formData.contentUrl}
                onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                placeholder="https://.../podcast.mp3 (optional)"
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white"
              />
            </div>
          )}

          {/* Transcript / Audio Script */}
          {(formData.type === 'audio' || formData.type === 'video') && (
            <div>
              <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
                Lesson Transcript / AI Narration Script
              </label>
              <textarea
                rows={3}
                value={formData.transcript}
                onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
                placeholder="Provide full narration text for accessible reading and Speech Synthesis narration..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white resize-none"
              />
            </div>
          )}

          {/* Duration, Difficulty, Provider */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
                Duration
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 6 min"
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
                Provider
              </label>
              <input
                type="text"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="CyberShield Academy"
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
              Search Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g. nmap, reconnaissance, port scan, tcp"
              className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white"
            />
          </div>

          {/* Publication Toggle */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="w-4 h-4 rounded text-[#6D28D9] focus:ring-[#8B5CF6] border-slate-300"
            />
            <label htmlFor="isPublished" className="text-sm font-semibold text-[#1E1B4B] cursor-pointer">
              Publish immediately (visible to enrolled students in learning modules)
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#475569] hover:bg-[#F5F3FF] hover:text-[#1E1B4B] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-sm font-bold shadow-md shadow-purple-500/20 transition active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingId ? 'Update Resource' : 'Create Resource'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Visual Resource"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? All student progress linked to this resource will also be cleared.`}
        confirmLabel="Delete Resource"
      />
    </div>
  );
};

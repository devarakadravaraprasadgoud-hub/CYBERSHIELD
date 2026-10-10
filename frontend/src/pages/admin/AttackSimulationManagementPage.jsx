import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { simulationService } from '../../services/apiServices';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import { DifficultyBadge, StatusBadge } from '../../components/common/Badge';
import {
  ShieldAlert,
  Eye,
  PlusCircle,
  Edit,
  Trash2,
  Globe,
  EyeOff,
  Search,
  Filter,
  Play,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'phishing', label: 'Phishing' },
  { id: 'password', label: 'Password Attacks' },
  { id: 'sqli', label: 'SQL Injection' },
  { id: 'xss', label: 'Cross-Site Scripting' },
  { id: 'mitm', label: 'Man-in-the-Middle' },
  { id: 'ransomware', label: 'Ransomware' },
  { id: 'dos', label: 'Denial of Service' },
  { id: 'reconnaissance', label: 'Reconnaissance' },
  { id: 'auth', label: 'Identity & Auth' },
  { id: 'malware', label: 'Malware' }
];

const INITIAL_FORM = {
  title: '',
  description: '',
  category: 'phishing',
  difficulty: 'beginner',
  estimatedDuration: '8 min',
  learningObjectives: '',
  isPublished: true
};

export const AttackSimulationManagementPage = () => {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const fetchSimulations = async () => {
    setLoading(true);
    try {
      const res = await simulationService.getAllAdmin({
        search: search || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined
      });
      setSimulations(res.data?.simulations || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load attack simulations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulations();
  }, [selectedCategory]);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sim) => {
    setEditingId(sim._id);
    setFormData({
      title: sim.title || '',
      description: sim.description || '',
      category: sim.category || 'phishing',
      difficulty: sim.difficulty || 'beginner',
      estimatedDuration: sim.estimatedDuration || '8 min',
      learningObjectives: Array.isArray(sim.learningObjectives)
        ? sim.learningObjectives.join('\n')
        : '',
      isPublished: sim.isPublished !== undefined ? sim.isPublished : true
    });
    setIsModalOpen(true);
  };

  const handleTogglePublish = async (sim) => {
    try {
      await simulationService.update(sim._id, { isPublished: !sim.isPublished });
      toast.success(`Simulation ${!sim.isPublished ? 'published' : 'moved to drafts'}`);
      setSimulations((prev) =>
        prev.map((s) => (s._id === sim._id ? { ...s, isPublished: !s.isPublished } : s))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update publication status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        difficulty: formData.difficulty,
        estimatedDuration: formData.estimatedDuration.trim(),
        learningObjectives: formData.learningObjectives
          ? formData.learningObjectives.split('\n').map((s) => s.trim()).filter(Boolean)
          : [],
        isPublished: Boolean(formData.isPublished)
      };

      if (editingId) {
        await simulationService.update(editingId, payload);
        toast.success('Simulation updated successfully');
      } else {
        // Supply starter nodes and stages for authoring
        payload.nodes = [
          { id: 'n1', label: 'Start Reconnaissance', type: 'start', x: 80, y: 160, category: 'Initial' },
          { id: 'n2', label: 'Exploitation Point', type: 'attack_event', x: 380, y: 160, category: 'Attack' }
        ];
        payload.edges = [{ id: 'e1', from: 'n1', to: 'n2', label: 'Advance', animated: true }];
        payload.attackStages = [
          {
            stageId: 'stg-1',
            stageNumber: 1,
            title: 'Initial Access Vector',
            nodeId: 'n1',
            nodeType: 'start',
            description: payload.description,
            whatIsHappening: 'Attacker probes target service.',
            whyCanThisHappen: 'Configuration gap.',
            whatShouldYouNotice: 'Unusual network probe.',
            whatCouldBeImpact: 'Reconnaissance footprinting.',
            howCanItBePrevented: 'Firewall rules.',
            realWorldLesson: 'Monitor perimeters.'
          }
        ];
        payload.defenseStages = [
          {
            stageId: 'def-1',
            stageNumber: 1,
            title: 'Defense Mitigation Vector',
            nodeId: 'n2',
            nodeType: 'defense_control',
            description: 'Security controls absorb traffic.',
            whatIsHappening: 'Defensive control blocks request.',
            whyCanThisHappen: 'Layered defense.',
            whatShouldYouNotice: 'Audit log flag.',
            whatCouldBeImpact: 'Zero breach.',
            howCanItBePrevented: 'Maintain hardening.',
            realWorldLesson: 'Prevention is key.'
          }
        ];

        await simulationService.create(payload);
        toast.success('New attack simulation authored successfully');
      }

      setIsModalOpen(false);
      fetchSimulations();
    } catch (err) {
      toast.error(err.message || 'Failed to save simulation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await simulationService.delete(deleteTarget._id);
      toast.success('Simulation deleted successfully');
      setSimulations((prev) => prev.filter((s) => s._id !== deleteTarget._id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete simulation');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#6D28D9] font-bold flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>ATTACK VISUALIZATION GOVERNANCE</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] mt-1">
            "Watch How It Happens" Scenarios
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            Manage interactive animated cyber attack flowcharts, defense replays, and learner decision checkpoints.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-sm shrink-0 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Attack Scenario</span>
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
            onKeyDown={(e) => e.key === 'Enter' && fetchSimulations()}
            placeholder="Search scenario title or description..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] text-sm text-[#1E1B4B] placeholder-[#94A3B8] focus:outline-none focus:border-[#6D28D9] focus:bg-white transition"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] text-xs sm:text-sm text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white w-full md:w-auto"
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Scenarios Table */}
      {loading ? (
        <LoadingSpinner message="Scanning attack simulations directory..." />
      ) : simulations.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No attack scenarios match selection"
          description="Create a new scenario or clear your search filters."
        />
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8FF] text-[#475569] font-bold uppercase tracking-wider border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-4">Scenario Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Stages</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {simulations.map((sim) => (
                  <tr key={sim._id} className="hover:bg-[#F5F3FF]/50 transition">
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <span className="font-bold text-[#1E1B4B] block text-sm">
                          {sim.title}
                        </span>
                        <span className="text-[11px] text-[#64748B] line-clamp-1 mt-0.5">
                          {sim.description}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 font-mono uppercase text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]">
                        {sim.category}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <DifficultyBadge level={sim.difficulty || 'beginner'} />
                    </td>

                    <td className="px-6 py-4 font-mono text-[#64748B]">
                      {sim.estimatedDuration || '8 min'}
                    </td>

                    <td className="px-6 py-4 font-mono text-[#475569]">
                      <span className="text-rose-600 font-bold">{sim.attackStages?.length || 0} Attack</span> / <span className="text-emerald-600 font-bold">{sim.defenseStages?.length || 0} Defense</span>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge isPublished={sim.isPublished} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Preview in Studio */}
                        <Link
                          to={`/learner/watch-how-it-happens/${sim._id}`}
                          className="p-1.5 rounded-lg border border-[#E5E7EB] text-[#64748B] hover:text-[#6D28D9] hover:bg-[#F5F3FF] transition"
                          title="Preview Simulation Studio"
                        >
                          <Play className="w-4 h-4" />
                        </Link>

                        {/* Toggle Publish */}
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(sim)}
                          className={`p-1.5 rounded-lg border transition ${
                            sim.isPublished
                              ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              : 'border-amber-200 text-amber-700 hover:bg-amber-50'
                          }`}
                          title={sim.isPublished ? 'Unpublish' : 'Publish'}
                        >
                          {sim.isPublished ? <Globe className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(sim)}
                          className="p-1.5 rounded-lg border border-[#E5E7EB] text-[#64748B] hover:text-[#6D28D9] hover:bg-[#F5F3FF] transition"
                          title="Edit Scenario"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(sim)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Scenario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Authoring Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Attack Simulation Scenario' : 'Author New Attack Scenario'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
              Scenario Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Server-Side Request Forgery (SSRF) Cloud Metadata Breach"
              className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
              Brief Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explain how the attack scenario begins, progresses, and defends..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] text-xs text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white"
              >
                {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] text-xs text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
                Duration
              </label>
              <input
                type="text"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                placeholder="e.g. 10 min"
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] text-xs text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider mb-1">
              Learning Objectives (One per line)
            </label>
            <textarea
              rows={3}
              value={formData.learningObjectives}
              onChange={(e) => setFormData({ ...formData, learningObjectives: e.target.value })}
              placeholder="Understand how unverified URLs trigger backend fetch&#10;Discover AWS IMDSv2 token defense"
              className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] text-xs text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isSimPublished"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="w-4 h-4 rounded text-[#6D28D9] focus:ring-[#8B5CF6] border-slate-300"
            />
            <label htmlFor="isSimPublished" className="text-sm font-semibold text-[#1E1B4B] cursor-pointer">
              Publish immediately (visible to all learners in Watch How It Happens catalog)
            </label>
          </div>

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
              {submitting ? 'Saving...' : editingId ? 'Update Scenario' : 'Author Scenario'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Attack Scenario"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? All learner session telemetry and decision records associated with this simulation will also be purged.`}
        confirmLabel="Delete Scenario"
      />
    </div>
  );
};

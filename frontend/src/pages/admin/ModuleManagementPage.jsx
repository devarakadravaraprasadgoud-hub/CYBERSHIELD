import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { moduleService, topicService } from '../../services/apiServices';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DifficultyBadge, StatusBadge } from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';
import {
  BookOpen,
  PlusCircle,
  Edit,
  Trash2,
  Globe,
  EyeOff,
  Search,
  Filter
} from 'lucide-react';

export const ModuleManagementPage = () => {
  const [modules, setModules] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const fetchModules = async () => {
    setLoading(true);
    try {
      const [modRes, topicRes] = await Promise.all([
        moduleService.getAll({
          limit: 100,
          search,
          topic: selectedTopic || undefined
        }),
        topicService.getAll({ limit: 100 })
      ]);
      setModules(modRes.data || []);
      setTopics(topicRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [selectedTopic]);

  const handleTogglePublish = async (mod) => {
    try {
      await moduleService.update(mod._id, { isPublished: !mod.isPublished });
      toast.success(`Module ${!mod.isPublished ? 'published' : 'moved to drafts'}`);
      setModules((prev) =>
        prev.map((m) => (m._id === mod._id ? { ...m, isPublished: !m.isPublished } : m))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update publication status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await moduleService.delete(deleteTarget._id);
      toast.success('Module deleted successfully');
      setModules((prev) => prev.filter((m) => m._id !== deleteTarget._id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete module');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#6D28D9] font-bold">
            CURRICULUM REPOSITORY
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] mt-1">
            Learning Module Governance
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Supervise all authored lessons, enforce curriculum quality, and manage publication states.
          </p>
        </div>

        <Link
          to="/instructor/modules/create"
          className="px-4 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Module</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchModules()}
            placeholder="Search module titles..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAF8FF] border border-slate-200 text-sm text-[#1E1B4B] placeholder-slate-400 focus:outline-none focus:border-[#6D28D9] focus:bg-white"
          />
        </div>

        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#FAF8FF] border border-slate-200 text-sm text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white"
        >
          <option value="">All Topics</option>
          {topics.map((t) => (
            <option key={t._id} value={t._id}>
              {t.title}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner message="Scanning global modules directory..." />
      ) : modules.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No modules match selection"
          description="Try selecting a different topic or clearing your search filter."
        />
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8FF] text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Topic</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {modules.map((m) => (
                  <tr key={m._id} className="hover:bg-[#F5F3FF]/50 transition">
                    <td className="px-6 py-4 font-bold text-[#1E1B4B] max-w-xs truncate">
                      {m.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{m.topic?.title}</td>
                    <td className="px-6 py-4 text-slate-500">{m.createdBy?.name || 'Staff'}</td>
                    <td className="px-6 py-4">
                      <DifficultyBadge level={m.difficultyLevel} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge isPublished={m.isPublished} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(m)}
                          className={`p-1.5 rounded-lg border transition ${
                            m.isPublished
                              ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              : 'border-amber-200 text-amber-700 hover:bg-amber-50'
                          }`}
                          title={m.isPublished ? 'Unpublish' : 'Publish'}
                        >
                          {m.isPublished ? <Globe className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <Link
                          to={`/instructor/modules/edit/${m._id}`}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#6D28D9] hover:bg-[#F5F3FF] transition"
                          title="Edit Module"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(m)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Module"
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Learning Module"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete Module"
      />
    </div>
  );
};

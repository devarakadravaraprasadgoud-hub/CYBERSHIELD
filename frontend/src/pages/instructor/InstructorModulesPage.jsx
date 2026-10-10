import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { moduleService } from '../../services/apiServices';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DifficultyBadge, StatusBadge } from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';
import { BookOpen, PlusCircle, Edit, Trash2, Globe, EyeOff } from 'lucide-react';

export const InstructorModulesPage = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const fetchModules = async () => {
    setLoading(true);
    try {
      const res = await moduleService.getAll({ myOnly: 'true', limit: 50 });
      setModules(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleTogglePublish = async (mod) => {
    try {
      await moduleService.update(mod._id, { isPublished: !mod.isPublished });
      toast.success(
        `Module ${!mod.isPublished ? 'published to cadets' : 'moved to drafts'}`
      );
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
            MODULE REPOSITORY
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] mt-1">
            My Learning Modules
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            Author, edit, publish, and manage structured cybersecurity curriculum lessons.
          </p>
        </div>

        <Link
          to="/instructor/modules/create"
          className="px-4 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-md shadow-purple-500/20 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Module</span>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving author curriculum..." />
      ) : modules.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No learning modules created yet"
          description="Create your first educational module to share security defense principles."
          actionLabel="Create Module Now"
          onAction={() => (window.location.href = '/instructor/modules/create')}
        />
      ) : (
        <div className="cyber-card rounded-2xl overflow-hidden border border-[#E5E7EB] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8FF] text-[#64748B] font-mono uppercase tracking-wider border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Topic Category</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Modified</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {modules.map((m) => (
                  <tr key={m._id} className="hover:bg-[#FAF8FF] transition">
                    <td className="px-6 py-4 font-bold text-[#1E1B4B] max-w-xs truncate">
                      {m.title}
                    </td>
                    <td className="px-6 py-4 text-[#475569]">{m.topic?.title}</td>
                    <td className="px-6 py-4">
                      <DifficultyBadge level={m.difficultyLevel} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge isPublished={m.isPublished} />
                    </td>
                    <td className="px-6 py-4 text-[#64748B]">{formatDate(m.updatedAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(m)}
                          className={`p-1.5 rounded-lg border transition ${
                            m.isPublished
                              ? 'border-emerald-200 bg-emerald-50 text-[#15803D] hover:bg-emerald-100'
                              : 'border-amber-200 bg-amber-50 text-[#B45309] hover:bg-amber-100'
                          }`}
                          title={m.isPublished ? 'Unpublish to Draft' : 'Publish to Cadets'}
                        >
                          {m.isPublished ? <Globe className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <Link
                          to={`/instructor/modules/edit/${m._id}`}
                          className="p-1.5 rounded-lg border border-[#E5E7EB] text-[#475569] hover:text-[#1E1B4B] hover:bg-[#F5F3FF] transition"
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
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Module"
      />
    </div>
  );
};

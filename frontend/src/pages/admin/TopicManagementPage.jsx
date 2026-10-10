import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { topicService } from '../../services/apiServices';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DifficultyBadge, StatusBadge } from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';
import {
  Layers,
  PlusCircle,
  Edit,
  Trash2,
  Globe,
  EyeOff,
  Search,
  KeyRound,
  MailWarning,
  ShieldAlert,
  Smartphone,
  Code,
  Wifi,
  Database,
  AlertTriangle
} from 'lucide-react';

export const TopicManagementPage = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: 'Identity & Access',
      difficultyLevel: 'beginner',
      iconName: 'ShieldCheck',
      isPublished: true
    }
  });

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await topicService.getAll({ limit: 100, search });
      setTopics(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const openCreateModal = () => {
    setEditingTopic(null);
    reset({
      title: '',
      description: '',
      category: 'Identity & Access',
      difficultyLevel: 'beginner',
      iconName: 'ShieldCheck',
      isPublished: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingTopic(t);
    reset({
      title: t.title,
      description: t.description,
      category: t.category,
      difficultyLevel: t.difficultyLevel,
      iconName: t.iconName || 'ShieldCheck',
      isPublished: t.isPublished
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingTopic) {
        await topicService.update(editingTopic._id, data);
        toast.success('Topic updated successfully');
      } else {
        await topicService.create(data);
        toast.success('New cybersecurity topic published');
      }
      setIsModalOpen(false);
      fetchTopics();
    } catch (err) {
      toast.error(err.message || 'Failed to save topic');
    }
  };

  const handleTogglePublish = async (t) => {
    try {
      await topicService.update(t._id, { isPublished: !t.isPublished });
      toast.success(`Topic ${!t.isPublished ? 'published' : 'moved to drafts'}`);
      setTopics((prev) =>
        prev.map((item) => (item._id === t._id ? { ...item, isPublished: !item.isPublished } : item))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update publication status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await topicService.delete(deleteTarget._id);
      toast.success('Topic deleted successfully');
      setTopics((prev) => prev.filter((t) => t._id !== deleteTarget._id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete topic');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#6D28D9] font-bold">
            TOPIC DIRECTORY
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] mt-1">
            Topic Management
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Maintain top-level cybersecurity subject tracks and curricula categories.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Topic</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Querying topic database..." />
      ) : topics.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No topics found"
          description="Create your first subject track to organize learning modules and quizzes."
          actionLabel="Create Topic"
          onAction={openCreateModal}
        />
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8FF] text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Modules / Quizzes</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topics.map((t) => (
                  <tr key={t._id} className="hover:bg-[#F5F3FF]/50 transition">
                    <td className="px-6 py-4 font-bold text-[#1E1B4B] max-w-xs truncate">
                      {t.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{t.category}</td>
                    <td className="px-6 py-4">
                      <DifficultyBadge level={t.difficultyLevel} />
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-[#6D28D9]">
                      {t.moduleCount || 0} Modules • {t.quizCount || 0} Quizzes
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge isPublished={t.isPublished} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(t)}
                          className={`p-1.5 rounded-lg border transition ${
                            t.isPublished
                              ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              : 'border-amber-200 text-amber-700 hover:bg-amber-50'
                          }`}
                          title={t.isPublished ? 'Unpublish' : 'Publish'}
                        >
                          {t.isPublished ? <Globe className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(t)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#6D28D9] hover:bg-[#F5F3FF] transition"
                          title="Edit Topic"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(t)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Topic"
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

      {/* Create / Edit Topic Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTopic ? 'Edit Topic' : 'Create New Cybersecurity Topic'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1">
              Topic Title
            </label>
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              placeholder="e.g. Identity & Access Governance"
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8FF] border border-slate-200 text-sm text-[#1E1B4B] placeholder-slate-400 focus:outline-none focus:border-[#6D28D9] focus:bg-white"
            />
            {errors.title && (
              <p className="text-xs text-rose-600 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1">
              Description
            </label>
            <textarea
              rows={3}
              {...register('description', { required: 'Description is required' })}
              placeholder="Topic curriculum summary..."
              className="w-full p-3 rounded-xl bg-[#FAF8FF] border border-slate-200 text-sm text-[#1E1B4B] placeholder-slate-400 focus:outline-none focus:border-[#6D28D9] focus:bg-white"
            />
            {errors.description && (
              <p className="text-xs text-rose-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1">
                Category
              </label>
              <select
                {...register('category', { required: true })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8FF] border border-slate-200 text-xs sm:text-sm text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white"
              >
                <option value="Identity & Access">Identity & Access</option>
                <option value="Threat Awareness">Threat Awareness</option>
                <option value="Application Security">Application Security</option>
                <option value="Network Security">Network Security</option>
                <option value="Data Protection">Data Protection</option>
                <option value="Incident Response">Incident Response</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-1">
                Difficulty Level
              </label>
              <select
                {...register('difficultyLevel')}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8FF] border border-slate-200 text-xs sm:text-sm text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-semibold text-xs transition shadow-sm active:scale-95"
            >
              {editingTopic ? 'Save Updates' : 'Create Topic'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Topic"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? All associated modules and quizzes under this topic will also be removed.`}
        confirmLabel="Delete Topic"
      />
    </div>
  );
};

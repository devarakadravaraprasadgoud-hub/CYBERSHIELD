import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { quizService, topicService } from '../../services/apiServices';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DifficultyBadge, StatusBadge } from '../../components/common/Badge';
import {
  HelpCircle,
  PlusCircle,
  ListOrdered,
  Edit,
  Trash2,
  Globe,
  EyeOff
} from 'lucide-react';

export const InstructorQuizzesPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
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
      topic: '',
      difficultyLevel: 'beginner',
      timeLimitMinutes: 10,
      passPercentage: 70,
      isPublished: true
    }
  });

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const [quizRes, topicRes] = await Promise.all([
        quizService.getAll({ myOnly: 'true', limit: 50 }),
        topicService.getAll({ limit: 100 })
      ]);
      setQuizzes(quizRes.data || []);
      setTopics(topicRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const openCreateModal = () => {
    setEditingQuiz(null);
    reset({
      title: '',
      description: '',
      topic: topics[0]?._id || '',
      difficultyLevel: 'beginner',
      timeLimitMinutes: 10,
      passPercentage: 70,
      isPublished: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (quiz) => {
    setEditingQuiz(quiz);
    reset({
      title: quiz.title,
      description: quiz.description,
      topic: quiz.topic?._id || quiz.topic,
      difficultyLevel: quiz.difficultyLevel,
      timeLimitMinutes: quiz.timeLimitMinutes,
      passPercentage: quiz.passPercentage,
      isPublished: quiz.isPublished
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        timeLimitMinutes: Number(data.timeLimitMinutes),
        passPercentage: Number(data.passPercentage)
      };

      if (editingQuiz) {
        await quizService.update(editingQuiz._id, payload);
        toast.success('Quiz assessment updated');
      } else {
        await quizService.create(payload);
        toast.success('Quiz assessment created successfully');
      }

      setIsModalOpen(false);
      fetchQuizzes();
    } catch (err) {
      toast.error(err.message || 'Failed to save quiz');
    }
  };

  const handleTogglePublish = async (quiz) => {
    try {
      await quizService.update(quiz._id, { isPublished: !quiz.isPublished });
      toast.success(
        `Quiz ${!quiz.isPublished ? 'published to cadets' : 'moved to drafts'}`
      );
      setQuizzes((prev) =>
        prev.map((q) => (q._id === quiz._id ? { ...q, isPublished: !q.isPublished } : q))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update publication status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await quizService.delete(deleteTarget._id);
      toast.success('Quiz assessment deleted');
      setQuizzes((prev) => prev.filter((q) => q._id !== deleteTarget._id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete quiz');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#6D28D9] font-bold">
            EVALUATION MANAGEMENT
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] mt-1">
            Quizzes & Assessments
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            Build timed tests, manage questions, and review learner score analytics.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-md shadow-purple-500/20 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Quiz</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving quizzes index..." />
      ) : quizzes.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No quizzes registered"
          description="Create your first quiz to evaluate learner awareness."
          actionLabel="Create Quiz"
          onAction={openCreateModal}
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
                  <th className="px-6 py-4">Questions</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {quizzes.map((quiz) => (
                  <tr key={quiz._id} className="hover:bg-[#FAF8FF] transition">
                    <td className="px-6 py-4 font-bold text-[#1E1B4B] max-w-xs truncate">
                      {quiz.title}
                    </td>
                    <td className="px-6 py-4 text-[#475569]">{quiz.topic?.title}</td>
                    <td className="px-6 py-4">
                      <DifficultyBadge level={quiz.difficultyLevel} />
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-[#6D28D9]">
                      {quiz.questionCount || 0} Questions
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge isPublished={quiz.isPublished} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/instructor/quizzes/${quiz._id}/questions`}
                          className="px-2.5 py-1.5 rounded-lg border border-[#DDD6FE] bg-[#EDE9FE] text-[#6D28D9] hover:bg-[#DDD6FE]/70 text-xs font-semibold flex items-center gap-1 transition"
                          title="Manage Questions"
                        >
                          <ListOrdered className="w-3.5 h-3.5" />
                          <span>Questions</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleTogglePublish(quiz)}
                          className={`p-1.5 rounded-lg border transition ${
                            quiz.isPublished
                              ? 'border-emerald-200 bg-emerald-50 text-[#15803D] hover:bg-emerald-100'
                              : 'border-amber-200 bg-amber-50 text-[#B45309] hover:bg-amber-100'
                          }`}
                          title={quiz.isPublished ? 'Unpublish to Draft' : 'Publish'}
                        >
                          {quiz.isPublished ? <Globe className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(quiz)}
                          className="p-1.5 rounded-lg border border-[#E5E7EB] text-[#475569] hover:text-[#1E1B4B] hover:bg-[#F5F3FF] transition"
                          title="Edit Quiz"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(quiz)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Quiz"
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

      {/* Create / Edit Quiz Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuiz ? 'Edit Quiz Assessment' : 'Create New Quiz Assessment'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#475569] font-bold mb-1">
              Quiz Title
            </label>
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              placeholder="e.g. Identity Defense Challenge"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#475569] font-bold mb-1">
              Description
            </label>
            <textarea
              rows={2}
              {...register('description', { required: 'Description is required' })}
              placeholder="Assessment objectives and rules..."
              className="w-full p-3 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#475569] font-bold mb-1">
                Parent Topic
              </label>
              <select
                {...register('topic', { required: true })}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-xs sm:text-sm text-[#1E1B4B] focus:outline-none focus:border-[#8B5CF6]"
              >
                {topics.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#475569] font-bold mb-1">
                Difficulty Level
              </label>
              <select
                {...register('difficultyLevel')}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-xs sm:text-sm text-[#1E1B4B] focus:outline-none focus:border-[#8B5CF6]"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#475569] font-bold mb-1">
                Time Limit (Minutes)
              </label>
              <input
                type="number"
                min={1}
                max={120}
                {...register('timeLimitMinutes', { required: true })}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#475569] font-bold mb-1">
                Passing Threshold (%)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                {...register('passPercentage', { required: true })}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#475569] hover:bg-[#F5F3FF]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-xs transition shadow-md shadow-purple-500/20 active:scale-95"
            >
              {editingQuiz ? 'Save Updates' : 'Create Quiz'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Quiz Assessment"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? All associated questions and past attempts will be removed.`}
        confirmLabel="Delete Quiz"
      />
    </div>
  );
};

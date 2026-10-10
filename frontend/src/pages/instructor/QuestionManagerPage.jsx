import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { quizService } from '../../services/apiServices';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  HelpCircle,
  PlusCircle,
  Edit,
  Trash2,
  ArrowLeft,
  CheckCircle,
  Info
} from 'lucide-react';

export const QuestionManagerPage = () => {
  const { quizId } = useParams();
  const [quizInfo, setQuizInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      questionText: '',
      points: 1,
      correctAnswerId: 'opt_1',
      explanation: '',
      option1: '',
      option2: '',
      option3: '',
      option4: ''
    }
  });

  const selectedCorrect = watch('correctAnswerId');

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await quizService.getQuestions(quizId);
      setQuizInfo(res.data.quiz);
      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [quizId]);

  const openCreateModal = () => {
    setEditingQuestion(null);
    reset({
      questionText: '',
      points: 1,
      correctAnswerId: 'opt_1',
      explanation: '',
      option1: '',
      option2: '',
      option3: '',
      option4: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    reset({
      questionText: q.questionText,
      points: q.points || 1,
      correctAnswerId: q.correctAnswerId || 'opt_1',
      explanation: q.explanation || '',
      option1: q.options[0]?.text || '',
      option2: q.options[1]?.text || '',
      option3: q.options[2]?.text || '',
      option4: q.options[3]?.text || ''
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      const options = [
        { id: 'opt_1', text: data.option1 },
        { id: 'opt_2', text: data.option2 },
        { id: 'opt_3', text: data.option3 },
        { id: 'opt_4', text: data.option4 }
      ].filter((o) => o.text.trim() !== '');

      if (options.length < 2) {
        toast.error('Please specify at least 2 distinct answer options');
        return;
      }

      const validCorrect = options.some((o) => o.id === data.correctAnswerId);
      if (!validCorrect) {
        toast.error('The selected correct answer must correspond to a non-empty option');
        return;
      }

      const payload = {
        questionText: data.questionText,
        options,
        correctAnswerId: data.correctAnswerId,
        explanation: data.explanation,
        points: Number(data.points)
      };

      if (editingQuestion) {
        await quizService.updateQuestion(editingQuestion._id, payload);
        toast.success('Question updated successfully');
      } else {
        await quizService.createQuestion(quizId, payload);
        toast.success('Question added to assessment');
      }

      setIsModalOpen(false);
      fetchQuestions();
    } catch (err) {
      toast.error(err.message || 'Failed to save question');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await quizService.deleteQuestion(deleteTarget._id);
      toast.success('Question deleted successfully');
      setQuestions((prev) => prev.filter((q) => q._id !== deleteTarget._id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete question');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <div>
        <Link
          to="/instructor/quizzes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#6D28D9] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Quizzes</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#6D28D9] font-bold">
            QUESTION WORKSHOP
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] mt-1">
            {quizInfo?.title || 'Quiz Questions'}
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            Author and refine multiple-choice questions, verify answer keys, and set feedback explanations.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-md shadow-purple-500/20 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Question</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading assessment questions..." />
      ) : questions.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No questions in this quiz"
          description="Add multiple-choice questions to activate this quiz assessment."
          actionLabel="Add Question Now"
          onAction={openCreateModal}
        />
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q._id} className="cyber-card rounded-2xl p-6 border border-[#E5E7EB] bg-white shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-[#EDE9FE] border border-[#DDD6FE] text-[#6D28D9] font-mono text-xs font-bold">
                    Q{idx + 1}
                  </span>
                  <span className="text-xs text-[#64748B] font-mono">
                    {q.points || 1} {(q.points || 1) === 1 ? 'pt' : 'pts'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(q)}
                    className="p-1.5 rounded-lg border border-[#E5E7EB] text-[#475569] hover:text-[#1E1B4B] hover:bg-[#F5F3FF] transition"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(q)}
                    className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-[#1E1B4B] leading-relaxed">
                {q.questionText}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {q.options?.map((opt, oIdx) => {
                  const letter = String.fromCharCode(65 + oIdx);
                  const isCorrect = q.correctAnswerId === opt.id;
                  return (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                        isCorrect
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-900 font-medium'
                          : 'border-[#E5E7EB] bg-slate-50 text-[#475569]'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-md bg-white border border-[#E5E7EB] flex items-center justify-center font-mono font-bold shrink-0 text-[#1E1B4B]">
                        {letter}
                      </span>
                      <span className="flex-1 truncate">{opt.text}</span>
                      {isCorrect && (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div className="p-3.5 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] text-xs text-[#475569] flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#6D28D9] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#6D28D9] block font-mono">Explanation:</strong>
                    {q.explanation}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Question Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuestion ? 'Edit Question' : 'Add New Question'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#475569] font-bold mb-1">
              Question Prompt
            </label>
            <textarea
              rows={3}
              {...register('questionText', { required: 'Question prompt is required' })}
              placeholder="e.g. Which cryptographic protocol defends against real-time Evilginx proxy phishing?"
              className="w-full p-3 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#8B5CF6] leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#475569] font-bold mb-2">
              Answer Options & Correct Answer Key
            </label>
            <div className="space-y-2.5">
              {[1, 2, 3, 4].map((num) => {
                const optId = `opt_${num}`;
                const isSelectedCorrect = selectedCorrect === optId;
                return (
                  <div
                    key={optId}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition ${
                      isSelectedCorrect
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-[#E5E7EB] bg-[#FAF8FF]'
                    }`}
                  >
                    <label className="flex items-center gap-2 cursor-pointer shrink-0">
                      <input
                        type="radio"
                        value={optId}
                        {...register('correctAnswerId')}
                        className="accent-emerald-600 w-4 h-4"
                      />
                      <span className="font-mono text-xs font-bold text-[#1E1B4B]">
                        Option {String.fromCharCode(64 + num)}
                      </span>
                    </label>

                    <input
                      type="text"
                      {...register(`option${num}`, {
                        required: num <= 2 ? `Option ${num} is required` : false
                      })}
                      placeholder={`Answer choice ${String.fromCharCode(64 + num)}...`}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-xs text-[#1E1B4B] focus:outline-none focus:border-[#8B5CF6]"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-mono uppercase text-[#475569] font-bold mb-1">
                Points
              </label>
              <input
                type="number"
                min={1}
                max={10}
                {...register('points', { required: true })}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-mono uppercase text-[#475569] font-bold mb-1">
                Educational Feedback Explanation
              </label>
              <textarea
                rows={2}
                {...register('explanation', { required: 'Explanation is required' })}
                placeholder="Explain why the correct answer is secure and why distractors fail..."
                className="w-full p-2.5 rounded-xl bg-white border border-[#E5E7EB] text-xs text-[#1E1B4B] focus:outline-none focus:border-[#8B5CF6]"
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
              {editingQuestion ? 'Save Updates' : 'Add Question'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Question"
        message="Are you sure you want to delete this question? This will adjust the total points and evaluation questions for this quiz."
        confirmLabel="Delete Question"
      />
    </div>
  );
};

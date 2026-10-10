import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { moduleService, topicService } from '../../services/apiServices';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save
} from 'lucide-react';

export const ModuleEditorPage = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      topic: '',
      shortDescription: '',
      estimatedReadingTime: 5,
      difficultyLevel: 'beginner',
      isPublished: true,
      learningObjectives: [''],
      contentSections: [
        {
          title: 'Introduction to the Vector',
          content: 'Describe the mechanics and real-world impact here...',
          calloutType: 'info',
          calloutText: 'Crucial security takeaway for defenders.'
        }
      ]
    }
  });

  const {
    fields: sectionFields,
    append: appendSection,
    remove: removeSection
  } = useFieldArray({
    control,
    name: 'contentSections'
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const topicsRes = await topicService.getAll({ limit: 100 });
        setTopics(topicsRes.data || []);

        if (isEditMode) {
          const modRes = await moduleService.getById(id);
          const m = modRes.data;
          reset({
            title: m.title,
            topic: m.topic?._id || m.topic,
            shortDescription: m.shortDescription,
            estimatedReadingTime: m.estimatedReadingTime,
            difficultyLevel: m.difficultyLevel,
            isPublished: m.isPublished,
            learningObjectives: m.learningObjectives?.length ? m.learningObjectives : [''],
            contentSections: m.contentSections?.length ? m.contentSections : []
          });
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load module configuration');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [id, isEditMode, reset]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        estimatedReadingTime: Number(data.estimatedReadingTime),
        learningObjectives: data.learningObjectives.filter((o) => typeof o === 'string' && o.trim()),
        contentSections: data.contentSections.map((s, idx) => ({
          ...s,
          order: idx + 1
        }))
      };

      if (isEditMode) {
        await moduleService.update(id, payload);
        toast.success('Learning module updated successfully');
      } else {
        await moduleService.create(payload);
        toast.success('Learning module authored and registered');
      }

      navigate('/instructor/modules');
    } catch (err) {
      toast.error(err.message || 'Failed to save module');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading module editor data..." />;
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      <div>
        <Link
          to="/instructor/modules"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#6D28D9] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Modules</span>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#6D28D9] font-bold">
            {isEditMode ? 'EDIT MODE' : 'AUTHORING STUDIO'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] mt-1">
            {isEditMode ? 'Modify Learning Module' : 'Create Learning Module'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Core Metadata Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs space-y-5">
          <h2 className="text-sm font-mono uppercase text-[#6D28D9] font-bold">
            1. Core Curriculum Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#475569] font-bold mb-1.5">
                Module Title
              </label>
              <input
                type="text"
                {...register('title', { required: 'Module title is required' })}
                placeholder="e.g. Preventing Ransomware Double Extortion"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#8B5CF6]"
              />
              {errors.title && (
                <p className="text-xs text-[#B91C1C] mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#475569] font-bold mb-1.5">
                Parent Cybersecurity Topic
              </label>
              <select
                {...register('topic', { required: 'Topic selection is required' })}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#8B5CF6]"
              >
                <option value="">Select a topic...</option>
                {topics.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title} ({t.category})
                  </option>
                ))}
              </select>
              {errors.topic && (
                <p className="text-xs text-[#B91C1C] mt-1">{errors.topic.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#475569] font-bold mb-1.5">
              Short Summary Description
            </label>
            <textarea
              rows={2}
              {...register('shortDescription', { required: 'Short description is required' })}
              placeholder="Brief overview explaining what learners will grasp..."
              className="w-full p-3 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#8B5CF6]"
            />
            {errors.shortDescription && (
              <p className="text-xs text-[#B91C1C] mt-1">{errors.shortDescription.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#475569] font-bold mb-1.5">
                Est. Reading Time (Mins)
              </label>
              <input
                type="number"
                min={1}
                max={120}
                {...register('estimatedReadingTime', { required: true })}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#475569] font-bold mb-1.5">
                Difficulty Level
              </label>
              <select
                {...register('difficultyLevel')}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#8B5CF6]"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#475569] font-bold mb-1.5">
                Publication Status
              </label>
              <select
                {...register('isPublished', {
                  setValueAs: (v) => v === 'true' || v === true
                })}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#8B5CF6]"
              >
                <option value="true">Published (Visible)</option>
                <option value="false">Draft (Hidden)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section Builder Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono uppercase text-[#6D28D9] font-bold">
              2. Content Sections ({sectionFields.length})
            </h2>
            <button
              type="button"
              onClick={() =>
                appendSection({
                  title: '',
                  content: '',
                  calloutType: 'none',
                  calloutText: ''
                })
              }
              className="px-3.5 py-1.5 rounded-lg bg-[#EDE9FE] border border-[#DDD6FE] text-[#6D28D9] hover:bg-[#DDD6FE]/70 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Section</span>
            </button>
          </div>

          <div className="space-y-6">
            {sectionFields.map((field, idx) => (
              <div
                key={field.id}
                className="cyber-card rounded-2xl p-5 sm:p-6 border border-[#DDD6FE] bg-[#FAF8FF] space-y-4 relative"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#DDD6FE]">
                  <span className="text-xs font-mono font-bold text-[#6D28D9]">
                    SECTION {idx + 1}
                  </span>
                  {sectionFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSection(idx)}
                      className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                      title="Remove Section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#475569] mb-1">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    {...register(`contentSections.${idx}.title`, { required: true })}
                    placeholder="e.g. 1. The Multi-Stage Attack Kill Chain"
                    className="w-full px-4 py-2 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#475569] mb-1">
                    Section Body Content
                  </label>
                  <textarea
                    rows={4}
                    {...register(`contentSections.${idx}.content`, { required: true })}
                    placeholder="Provide in-depth explanation, examples, and defense recommendations..."
                    className="w-full p-3 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#1E1B4B] focus:outline-none focus:border-[#8B5CF6] leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#475569] mb-1">
                      Callout Highlight Box Type
                    </label>
                    <select
                      {...register(`contentSections.${idx}.calloutType`)}
                      className="w-full px-4 py-2 rounded-xl bg-white border border-[#E5E7EB] text-xs sm:text-sm text-[#1E1B4B] focus:outline-none focus:border-[#8B5CF6]"
                    >
                      <option value="none">None</option>
                      <option value="info">Info (Purple)</option>
                      <option value="warning">Warning (Amber)</option>
                      <option value="alert">Alert (Rose)</option>
                      <option value="tip">Best Practice Tip (Emerald)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#475569] mb-1">
                      Callout Text Note
                    </label>
                    <input
                      type="text"
                      {...register(`contentSections.${idx}.calloutText`)}
                      placeholder="High-visibility tip or caution notice..."
                      className="w-full px-4 py-2 rounded-xl bg-white border border-[#E5E7EB] text-xs sm:text-sm text-[#1E1B4B] focus:outline-none focus:border-[#8B5CF6]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            to="/instructor/modules"
            className="px-6 py-2.5 rounded-xl border border-[#E5E7EB] text-[#475569] font-semibold text-xs hover:bg-[#F5F3FF] transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-xs transition shadow-md shadow-purple-500/20 flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Saving Module...' : 'Save & Publish Module'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

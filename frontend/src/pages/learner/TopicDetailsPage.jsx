import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { topicService } from '../../services/apiServices';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DifficultyBadge } from '../../components/common/Badge';
import {
  BookOpen,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

export const TopicDetailsPage = () => {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const res = await topicService.getById(id);
        setTopic(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopic();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Decrypting topic curriculum..." />;
  }

  if (!topic) {
    return (
      <div className="p-8 text-center text-[#64748B]">
        Topic not found or currently unavailable.
      </div>
    );
  }

  const { modules = [], quizzes = [] } = topic;

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6">
      {/* Topic Header Card */}
      <div className="cyber-card rounded-3xl p-6 sm:p-10 border border-[#E5E7EB] bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-[#6D28D9] font-bold px-3 py-1 rounded-full bg-[#EDE9FE] border border-[#DDD6FE]">
            {topic.category}
          </span>
          <DifficultyBadge level={topic.difficultyLevel} />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E1B4B] mb-4">
          {topic.title}
        </h1>
        <p className="text-[#475569] text-sm sm:text-base leading-relaxed max-w-3xl mb-6">
          {topic.description}
        </p>

        <div className="flex items-center gap-6 text-xs text-[#64748B] font-medium">
          <span>{modules.length} Learning Modules</span>
          <span>•</span>
          <span>{quizzes.length} Knowledge Assessments</span>
        </div>
      </div>

      {/* Modules and Quizzes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Learning Modules Column */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#1E1B4B] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#6D28D9]" />
            <span>Learning Modules ({modules.length})</span>
          </h2>

          {modules.length === 0 ? (
            <div className="p-6 rounded-2xl border border-[#E5E7EB] bg-white text-[#64748B] text-sm text-center">
              No modules published for this topic yet.
            </div>
          ) : (
            <div className="space-y-3">
              {modules.map((m, idx) => (
                <Link
                  key={m._id}
                  to={`/learner/modules/${m.slug || m._id}`}
                  className="cyber-card rounded-xl p-5 block group bg-white border border-[#E5E7EB] hover:border-[#DDD6FE] transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono font-bold text-[#64748B]">
                      PART {idx + 1}
                    </span>
                    <span className="text-xs text-[#64748B] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {m.estimatedReadingTime} min
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#1E1B4B] group-hover:text-[#6D28D9] transition mb-2">
                    {m.title}
                  </h3>
                  <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                    {m.shortDescription}
                  </p>
                  <div className="mt-4 flex items-center justify-end text-xs font-semibold text-[#6D28D9] gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Read Module</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quizzes Column */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#1E1B4B] flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#7C3AED]" />
            <span>Topic Assessments ({quizzes.length})</span>
          </h2>

          {quizzes.length === 0 ? (
            <div className="p-6 rounded-2xl border border-[#E5E7EB] bg-white text-[#64748B] text-sm text-center">
              No quizzes published for this topic yet.
            </div>
          ) : (
            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="cyber-card rounded-xl p-5 flex flex-col justify-between bg-white border border-[#E5E7EB]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <DifficultyBadge level={quiz.difficultyLevel} />
                      <span className="text-xs text-[#64748B] font-mono">
                        Pass: {quiz.passPercentage}%
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#1E1B4B] mb-2">{quiz.title}</h3>
                    <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed mb-4">
                      {quiz.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
                    <span className="text-xs text-[#64748B] font-mono">
                      ⏱ {quiz.timeLimitMinutes} min limit
                    </span>
                    <Link
                      to={`/learner/quizzes/${quiz._id}/instructions`}
                      className="px-4 py-2 rounded-xl bg-[#EDE9FE] border border-[#DDD6FE] text-[#6D28D9] hover:bg-[#DDD6FE]/70 text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
                    >
                      <span>Take Quiz</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

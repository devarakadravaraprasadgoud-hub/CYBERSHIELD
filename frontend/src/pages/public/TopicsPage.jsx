import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { topicService } from '../../services/apiServices';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import { DifficultyBadge } from '../../components/common/Badge';
import {
  Search,
  Shield,
  ArrowRight,
  KeyRound,
  MailWarning,
  ShieldAlert,
  Smartphone,
  Code,
  Wifi,
  Database,
  AlertTriangle
} from 'lucide-react';

const iconMap = {
  KeyRound,
  MailWarning,
  ShieldAlert,
  Smartphone,
  Code,
  Wifi,
  Database,
  AlertTriangle
};

export const TopicsPage = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await topicService.getAll({
        page,
        limit: 8,
        search,
        difficultyLevel: difficulty || undefined,
        category: category || undefined
      });
      setTopics(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [page, difficulty, category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTopics();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="mb-10 text-center sm:text-left">
        <span className="text-xs font-mono uppercase tracking-wider text-[#6D28D9] font-bold">
          CURRICULUM REPOSITORY
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E1B4B] mt-1">
          Cybersecurity Topics
        </h1>
        <p className="text-[#64748B] text-sm max-w-2xl mt-2">
          Select any cybersecurity topic below to view in-depth learning modules and knowledge-check quizzes.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 mb-8 border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics by keyword..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-sm text-[#1E1B4B] placeholder-[#94A3B8] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs sm:text-sm text-[#475569] focus:outline-none focus:border-[#8B5CF6]"
          >
            <option value="">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs sm:text-sm text-[#475569] focus:outline-none focus:border-[#8B5CF6]"
          >
            <option value="">All Categories</option>
            <option value="Identity & Access">Identity & Access</option>
            <option value="Threat Awareness">Threat Awareness</option>
            <option value="Application Security">Application Security</option>
            <option value="Network Security">Network Security</option>
            <option value="Data Protection">Data Protection</option>
            <option value="Incident Response">Incident Response</option>
          </select>
        </div>
      </div>

      {/* Topics Content */}
      {loading ? (
        <LoadingSpinner message="Scanning cybersecurity topic index..." />
      ) : topics.length === 0 ? (
        <EmptyState
          title="No topics match your query"
          description="Try clearing your search terms or selecting another difficulty category."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setDifficulty('');
            setCategory('');
            setPage(1);
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topics.map((topic) => {
              const IconComp = iconMap[topic.iconName] || Shield;
              return (
                <Link
                  key={topic._id}
                  to={`/topics/${topic.slug || topic._id}`}
                  className="cyber-card rounded-2xl p-6 flex flex-col justify-between group bg-white border border-[#E5E7EB] hover:border-[#DDD6FE] transition-all duration-300"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#EDE9FE] border border-[#DDD6FE] flex items-center justify-center text-[#6D28D9] group-hover:scale-105 group-hover:border-[#C4B5FD] transition-all">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <DifficultyBadge level={topic.difficultyLevel} />
                    </div>

                    <span className="text-xs font-mono uppercase text-[#64748B] block mb-1">
                      {topic.category}
                    </span>
                    <h3 className="text-lg font-bold text-[#1E1B4B] mb-2 group-hover:text-[#6D28D9] transition">
                      {topic.title}
                    </h3>
                    <p className="text-xs text-[#64748B] line-clamp-3 leading-relaxed mb-4">
                      {topic.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#64748B]">
                    <span className="font-medium text-[#475569]">
                      {topic.moduleCount || 1} Modules • {topic.quizCount || 1} Quizzes
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#6D28D9] group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </>
      )}
    </div>
  );
};

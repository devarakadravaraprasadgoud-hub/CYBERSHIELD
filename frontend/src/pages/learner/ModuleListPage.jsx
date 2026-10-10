import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { moduleService } from '../../services/apiServices';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import { DifficultyBadge } from '../../components/common/Badge';
import { Search, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ModuleListPage = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const res = await moduleService.getAll({
        page,
        limit: 9,
        search,
        difficultyLevel: difficulty || undefined
      });
      setModules(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [page, difficulty]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchModules();
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-[#6D28D9] font-bold">
          KNOWLEDGE BASE
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] mt-1">
          Cybersecurity Learning Modules
        </h1>
        <p className="text-[#64748B] text-sm mt-1 max-w-2xl">
          Dive into structured learning modules. Read key takeaways, explore real-world attack vectors, and mark modules as completed to earn badges.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search module titles..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-sm text-[#1E1B4B] placeholder-[#94A3B8] focus:outline-none focus:border-[#8B5CF6]"
          />
        </form>

        <select
          value={difficulty}
          onChange={(e) => {
            setDifficulty(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-sm text-[#475569] focus:outline-none focus:border-[#8B5CF6]"
        >
          <option value="">All Difficulties</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner message="Scanning learning modules..." />
      ) : modules.length === 0 ? (
        <EmptyState
          title="No modules found"
          description="Try adjusting your search criteria."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setDifficulty('');
            setPage(1);
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((m) => (
              <Link
                key={m._id}
                to={`/learner/modules/${m.slug || m._id}`}
                className="cyber-card rounded-2xl p-6 flex flex-col justify-between group bg-white border border-[#E5E7EB] hover:border-[#DDD6FE] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono uppercase text-[#6D28D9] font-bold">
                      {m.topic?.title || 'Security'}
                    </span>
                    <DifficultyBadge level={m.difficultyLevel} />
                  </div>

                  <h3 className="text-base font-bold text-[#1E1B4B] mb-2 group-hover:text-[#6D28D9] transition">
                    {m.title}
                  </h3>
                  <p className="text-xs text-[#64748B] line-clamp-3 leading-relaxed mb-4">
                    {m.shortDescription}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[#64748B]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{m.estimatedReadingTime} min read</span>
                  </div>

                  {m.isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-[#15803D] font-semibold font-mono text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[#6D28D9] font-semibold group-hover:translate-x-1 transition-transform">
                      Read Module <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </Link>
            ))}
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

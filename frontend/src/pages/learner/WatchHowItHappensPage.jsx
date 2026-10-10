import React, { useEffect, useState } from 'react';
import { simulationService } from '../../services/apiServices';
import { AttackScenarioCard } from '../../components/simulations/AttackScenarioCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../hooks/useToast';
import {
  ShieldAlert,
  Search,
  Filter,
  Sparkles,
  Award,
  Layers,
  CheckCircle2,
  HelpCircle,
  Eye
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Attacks' },
  { id: 'phishing', label: 'Phishing Attacks' },
  { id: 'password', label: 'Password Attacks' },
  { id: 'sqli', label: 'SQL Injection' },
  { id: 'xss', label: 'Cross-Site Scripting' },
  { id: 'mitm', label: 'Man-in-the-Middle' },
  { id: 'ransomware', label: 'Ransomware' },
  { id: 'dos', label: 'Denial-of-Service' },
  { id: 'reconnaissance', label: 'Reconnaissance' },
  { id: 'auth', label: 'Identity & Auth' },
  { id: 'malware', label: 'Malware Awareness' }
];

export const WatchHowItHappensPage = () => {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [masteryData, setMasteryData] = useState({ completedCount: 0, totalSimulations: 0 });
  const toast = useToast();

  const fetchSimulations = async () => {
    setLoading(true);
    try {
      const [simRes, progressRes] = await Promise.all([
        simulationService.getAll({
          search: search || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined
        }),
        simulationService.getMyProgress().catch(() => ({ data: { completedCount: 0, totalSimulations: 0 } }))
      ]);

      setSimulations(simRes.data || []);
      if (progressRes?.data) {
        setMasteryData(progressRes.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load attack simulations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulations();
  }, [selectedCategory, selectedDifficulty]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSimulations();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Hero Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-white via-[#FAF8FF] to-[#F5F3FF] rounded-3xl p-6 sm:p-10 border border-[#DDD6FE] shadow-xs">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDE9FE] border border-[#DDD6FE] text-xs font-mono font-bold text-[#6D28D9]">
            <Eye className="w-3.5 h-3.5" />
            <span>ANIMATED CYBER ATTACK SIMULATION ENGINE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E1B4B] tracking-tight">
            Watch How It Happens
          </h1>

          <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
            Explore cyberattacks step by step. Discover the weaknesses, recognize the warning signs, and learn how to stop them through animated flowcharts and defense replays.
          </p>

          {/* User Mastery Strip */}
          {masteryData.totalSimulations > 0 && (
            <div className="pt-3 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#1E1B4B]">
                  Exploration Mastery:
                </span>
                <span className="text-xs font-mono font-extrabold text-[#6D28D9]">
                  {masteryData.completedCount} / {masteryData.totalSimulations} Completed
                </span>
              </div>
              <div className="w-36 h-2 rounded-full bg-[#EDE9FE] overflow-hidden">
                <div
                  className="h-full bg-[#6D28D9] rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.round(
                      (masteryData.completedCount / masteryData.totalSimulations) * 100
                    )}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Decorative background watermark */}
        <ShieldAlert className="absolute -right-6 -bottom-8 w-64 h-64 text-[#EDE9FE]/50 pointer-events-none" />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs space-y-4">
        {/* Top search & dropdown row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attack scenarios..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] text-sm text-[#1E1B4B] placeholder-[#94A3B8] focus:outline-none focus:border-[#6D28D9] focus:bg-white transition"
            />
          </form>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-[#FAF8FF] border border-[#DDD6FE] text-xs sm:text-sm text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#6D28D9] text-white shadow-xs font-bold'
                  : 'bg-[#FAF8FF] border border-[#DDD6FE] text-[#475569] hover:text-[#1E1B4B] hover:bg-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Simulation Cards */}
      {loading ? (
        <LoadingSpinner message="Decrypting attack scenarios and network topologies..." />
      ) : simulations.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No attack scenarios match your filter"
          description="Try resetting your category or search parameters to discover other threat vectors."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {simulations.map((sim) => (
            <AttackScenarioCard key={sim._id} simulation={sim} />
          ))}
        </div>
      )}
    </div>
  );
};

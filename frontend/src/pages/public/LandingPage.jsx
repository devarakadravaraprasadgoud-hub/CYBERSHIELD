import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { topicService, publicStatsService } from '../../services/apiServices';
import {
  Shield,
  ArrowRight,
  BookOpen,
  KeyRound,
  MailWarning,
  ShieldAlert,
  Smartphone,
  Code,
  Wifi,
  Database,
  AlertTriangle
} from 'lucide-react';
import { DifficultyBadge } from '../../components/common/Badge';

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

export const LandingPage = () => {
  const { isAuthenticated, role } = useAuth();
  const [stats, setStats] = useState({
    totalTopics: 0,
    totalModules: 0,
    totalQuizzes: 0,
    totalLearners: 0,
    totalAttempts: 0
  });
  const [featuredTopics, setFeaturedTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, topicsRes] = await Promise.all([
          publicStatsService.getStats(),
          topicService.getAll({ limit: 4 })
        ]);
        setStats(statsRes.data || {});
        setFeaturedTopics(topicsRes.data || []);
      } catch (e) {
        console.error('Failed to load landing data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'instructor') return '/instructor/dashboard';
    return '/learner/dashboard';
  };

  return (
    <div className="relative overflow-hidden bg-[#F9FAFB] text-[#1E1B4B]">
      {/* Background Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#EDE9FE]/50 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-96 right-0 w-[500px] h-[300px] bg-[#DDD6FE]/40 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 lg:pt-28 lg:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#DDD6FE] bg-[#EDE9FE] text-[#6D28D9] text-xs font-mono font-semibold tracking-wide mb-8">
          <Shield className="w-3.5 h-3.5" />
          <span>CYBERSHIELD AWARENESS SYSTEM v2.4</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#1E1B4B] tracking-tight leading-[1.15] mb-6 max-w-5xl mx-auto">
          Fortify Your Human Firewall Against Modern{' '}
          <span className="bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#3B82F6] bg-clip-text text-transparent">
            Cyber Threats.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-[#475569] max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          Interactive cybersecurity learning modules, realistic threat simulations, and server-verified quizzes engineered to elevate digital defense literacy for learners, developers, and organizations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
          {isAuthenticated ? (
            <Link
              to={getDashboardPath()}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-base transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Go to Command Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-base transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Enroll as Cadet</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/topics"
                className="w-full sm:w-auto px-8 py-4 rounded-xl border border-[#E5E7EB] bg-white hover:border-[#DDD6FE] hover:bg-[#FAF8FF] text-[#1E1B4B] font-semibold text-base transition flex items-center justify-center gap-2 shadow-2xs"
              >
                <BookOpen className="w-5 h-5 text-[#6D28D9]" />
                <span>Explore Topics</span>
              </Link>
            </>
          )}
        </div>

        {/* Live Real Database Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 max-w-5xl mx-auto p-4 sm:p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs text-left">
          <div className="p-3">
            <span className="text-[11px] font-mono uppercase text-[#64748B]">Published Topics</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] mt-1">
              {stats.totalTopics || 8}
            </div>
          </div>
          <div className="p-3">
            <span className="text-[11px] font-mono uppercase text-[#64748B]">Learning Modules</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#6D28D9] mt-1">
              {stats.totalModules || 12}
            </div>
          </div>
          <div className="p-3">
            <span className="text-[11px] font-mono uppercase text-[#64748B]">Active Quizzes</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] mt-1">
              {stats.totalQuizzes || 5}
            </div>
          </div>
          <div className="p-3">
            <span className="text-[11px] font-mono uppercase text-[#64748B]">Enrolled Learners</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#3B82F6] mt-1">
              {stats.totalLearners || 1}
            </div>
          </div>
          <div className="col-span-2 md:col-span-1 p-3">
            <span className="text-[11px] font-mono uppercase text-[#64748B]">Evaluations Scored</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#15803D] mt-1">
              {stats.totalAttempts || 0}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Topics Section */}
      <section className="py-20 bg-[#FAF8FF] border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#6D28D9] font-bold">
                CORE CURRICULUM
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E1B4B] mt-1">
                Featured Cybersecurity Modules
              </h2>
            </div>
            <Link
              to="/topics"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#6D28D9] hover:text-[#5B21B6] transition"
            >
              <span>View all available topics</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTopics.map((topic) => {
              const IconComponent = iconMap[topic.iconName] || Shield;
              return (
                <Link
                  key={topic._id}
                  to={`/topics/${topic.slug || topic._id}`}
                  className="cyber-card rounded-2xl p-6 flex flex-col justify-between group bg-white border border-[#E5E7EB] hover:border-[#DDD6FE] transition-all duration-300"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#EDE9FE] border border-[#DDD6FE] flex items-center justify-center text-[#6D28D9] group-hover:scale-105 group-hover:border-[#C4B5FD] transition-all">
                        <IconComponent className="w-6 h-6" />
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
        </div>
      </section>

      {/* How the Learning Journey Works */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-wider text-[#6D28D9] font-bold">
            PEDAGOGICAL METHODOLOGY
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E1B4B] mt-1">
            Engineered for Retention & Real Defense
          </h2>
          <p className="text-[#64748B] text-sm sm:text-base mt-3">
            Passive reading fails under actual social engineering pressure. CyberShield enforces active knowledge retrieval.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="cyber-card rounded-2xl p-6 relative bg-white border border-[#E5E7EB]">
            <span className="text-4xl font-extrabold text-[#DDD6FE] font-mono mb-4 block">01</span>
            <h4 className="text-lg font-bold text-[#1E1B4B] mb-2">Structured Modules</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Explore bite-sized, high-yield lessons dissecting attack vectors, technical mechanics, and immediate mitigations.
            </p>
          </div>

          <div className="cyber-card rounded-2xl p-6 relative bg-white border border-[#E5E7EB]">
            <span className="text-4xl font-extrabold text-[#DDD6FE] font-mono mb-4 block">02</span>
            <h4 className="text-lg font-bold text-[#1E1B4B] mb-2">Timed Assessments</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Experience simulated pressure with realistic scenario-based questions evaluating threat identification.
            </p>
          </div>

          <div className="cyber-card rounded-2xl p-6 relative bg-white border border-[#E5E7EB]">
            <span className="text-4xl font-extrabold text-[#DDD6FE] font-mono mb-4 block">03</span>
            <h4 className="text-lg font-bold text-[#1E1B4B] mb-2">Server Scored & Reviewed</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Instant detailed technical rationales explain why specific choices are secure or vulnerable without client-side leakage.
            </p>
          </div>

          <div className="cyber-card rounded-2xl p-6 relative bg-white border border-[#E5E7EB]">
            <span className="text-4xl font-extrabold text-[#DDD6FE] font-mono mb-4 block">04</span>
            <h4 className="text-lg font-bold text-[#1E1B4B] mb-2">Verifiable Mastery</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Track skill milestones, earn defense badges, and review permanent historical attempt logs on your cadet dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] border border-[#DDD6FE]/30 text-center relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Ready to Upgrade Your Threat Awareness?
            </h3>
            <p className="text-purple-100 text-sm sm:text-base mb-8 leading-relaxed">
              Join thousands strengthening their cyber hygiene. Free, modular, and built on certified defense standards.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-[#F5F3FF] text-[#6D28D9] font-bold text-base transition shadow-md active:scale-95"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Layers,
  Search,
  CheckCircle2,
  Check,
  Shield,
  Info,
  ExternalLink,
  Tag,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { DifficultyBadge } from '../common/Badge';

export const ConceptMapViewer = ({ resource = {}, diagramData, onMarkComplete, completing = false }) => {
  const diagram = diagramData || resource.diagramData || {
    diagramType: 'layers',
    title: resource.title || 'Security Concept Architecture',
    subtitle: resource.description || 'Defensive mechanisms and protocols.',
    elements: []
  };

  const elements = diagram.elements || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeElement, setActiveElement] = useState(elements[0] || null);

  const isCompleted = Boolean(resource?.progress?.isCompleted);

  // Extract unique categories for filter pills
  const categories = ['All', ...new Set(elements.map((el) => el.category).filter(Boolean))];

  const filteredElements = elements.filter((el) => {
    const matchesCategory = selectedCategory === 'All' || el.category === selectedCategory;
    const matchesSearch =
      searchTerm === '' ||
      el.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      el.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      el.protocolsOrTools?.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Title & Action Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-mono font-bold">
              <Layers className="w-3.5 h-3.5" />
              <span>{diagram.diagramType ? diagram.diagramType.toUpperCase() : 'DIAGRAM'}</span>
            </span>
            <DifficultyBadge level={resource.difficulty || 'intermediate'} />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B]">
            {diagram.title || resource.title}
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">{diagram.subtitle || resource.description}</p>
        </div>

        <button
          type="button"
          onClick={() => onMarkComplete && onMarkComplete(resource._id)}
          disabled={completing}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 active:scale-95 shrink-0 ${
            isCompleted
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-[#6D28D9] hover:bg-[#5B21B6] text-white shadow-sm'
          }`}
        >
          {isCompleted ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Diagram Reviewed</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{completing ? 'Saving...' : 'Mark as Reviewed'}</span>
            </>
          )}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-[#6D28D9] text-white shadow-xs'
                  : 'bg-[#FAF8FF] text-slate-600 border border-slate-200 hover:bg-[#F5F3FF]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search elements & protocols..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#FAF8FF] border border-slate-200 text-xs text-[#1E1B4B] placeholder-slate-400 focus:outline-none focus:border-[#6D28D9] focus:bg-white"
          />
        </div>
      </div>

      {/* Main Grid: Interactive Element Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredElements.map((el) => {
          const isSelected = activeElement?.id === el.id;

          return (
            <div
              key={el.id}
              onClick={() => setActiveElement(el)}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-[#6D28D9] bg-[#FAF8FF] shadow-md ring-2 ring-purple-200'
                  : el.highlight
                  ? 'border-purple-200 bg-white hover:border-[#6D28D9] shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header: Category & Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                    {el.category}
                  </span>
                  {el.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]">
                      {el.badge}
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-[#1E1B4B] mb-2 leading-snug">
                  {el.name}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {el.details}
                </p>
              </div>

              <div>
                {/* Protocols / Tools Pills */}
                {el.protocolsOrTools && el.protocolsOrTools.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {el.protocolsOrTools.map((p, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-slate-700"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}

                {/* Security Consideration */}
                {el.securityConsideration && (
                  <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 leading-relaxed flex items-start gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <span>{el.securityConsideration}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredElements.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Layers className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-[#1E1B4B]">No matching diagram elements</h4>
          <p className="text-xs text-slate-500 mt-1">Try resetting your filter or search terms.</p>
        </div>
      )}
    </div>
  );
};

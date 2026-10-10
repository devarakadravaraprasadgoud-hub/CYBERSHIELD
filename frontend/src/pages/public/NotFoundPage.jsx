import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center p-4 text-center">
      <div className="cyber-card rounded-3xl p-8 sm:p-12 max-w-lg bg-white border border-[#E5E7EB] shadow-xl">
        <div className="w-20 h-20 rounded-2xl bg-[#EDE9FE] border border-[#DDD6FE] flex items-center justify-center text-[#6D28D9] mx-auto mb-6">
          <Terminal className="w-10 h-10" />
        </div>
        <span className="text-xs font-mono uppercase tracking-widest text-[#6D28D9] font-bold block mb-2">
          404 RESOURCE NOT FOUND
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] mb-3">
          Route or Signal Missing
        </h1>
        <p className="text-[#64748B] text-sm mb-8 leading-relaxed">
          The requested uniform resource locator does not resolve to an active endpoint within the CyberShield system.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm transition shadow-md shadow-purple-500/20"
        >
          <Home className="w-4 h-4" />
          <span>Back to Headquarters</span>
        </Link>
      </div>
    </div>
  );
};

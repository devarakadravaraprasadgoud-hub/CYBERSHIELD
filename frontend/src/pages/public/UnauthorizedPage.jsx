import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const UnauthorizedPage = () => {
  const { role } = useAuth();

  const getHomePath = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'instructor') return '/instructor/dashboard';
    if (role === 'learner') return '/learner/dashboard';
    return '/';
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center p-4 text-center">
      <div className="cyber-card rounded-3xl p-8 sm:p-12 max-w-lg bg-white border border-rose-200 shadow-xl">
        <div className="w-20 h-20 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto mb-6">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <span className="text-xs font-mono uppercase tracking-widest text-rose-700 font-bold block mb-2">
          403 ACCESS FORBIDDEN
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] mb-3">
          Unauthorized Security Clearance
        </h1>
        <p className="text-[#64748B] text-sm mb-8 leading-relaxed">
          You do not possess the necessary role authorization to access this administrative terminal or resource.
        </p>
        <Link
          to={getHomePath()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm transition shadow-md shadow-purple-500/20"
        >
          <Home className="w-4 h-4" />
          <span>Return to Safe Zone</span>
        </Link>
      </div>
    </div>
  );
};

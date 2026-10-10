import React from 'react';
import { getDifficultyColor, getRoleBadge } from '../../utils/formatters';

export const DifficultyBadge = ({ level }) => {
  const color = getDifficultyColor(level);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${color}`}>
      {level || 'Beginner'}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const { label, color } = getRoleBadge(role);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider ${color}`}>
      {label}
    </span>
  );
};

export const StatusBadge = ({ isPublished, status }) => {
  if (status) {
    const isAct = status === 'active';
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          isAct
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isAct ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        {status}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        isPublished
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-amber-50 text-amber-700 border-amber-200'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      {isPublished ? 'Published' : 'Draft'}
    </span>
  );
};

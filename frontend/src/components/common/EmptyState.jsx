import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = ShieldAlert,
  title = 'No records found',
  description = 'There are no items matching your criteria at this moment.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="cyber-card rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-8 bg-white border border-[#E5E7EB]">
      <div className="w-16 h-16 rounded-2xl bg-[#EDE9FE] border border-[#DDD6FE] flex items-center justify-center text-[#6D28D9] mb-4 shadow-xs">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-[#1E1B4B] mb-2">{title}</h3>
      <p className="text-[#64748B] text-sm max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-semibold text-sm transition shadow-md shadow-purple-500/20 active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

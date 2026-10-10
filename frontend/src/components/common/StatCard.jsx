import React from 'react';

export const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  accent = 'purple',
  trend
}) => {
  const accentClasses = {
    purple: 'bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE] group-hover:border-[#C4B5FD]',
    cyan: 'bg-sky-50 text-sky-700 border-sky-200 group-hover:border-sky-300',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 group-hover:border-emerald-300',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 group-hover:border-amber-300',
    rose: 'bg-rose-50 text-rose-700 border-rose-200 group-hover:border-rose-300'
  };

  return (
    <div className="cyber-card group rounded-2xl p-6 relative overflow-hidden transition-all duration-300 bg-white border border-[#E5E7EB]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border transition-all ${accentClasses[accent] || accentClasses.purple}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <h4 className="text-3xl font-extrabold text-[#1E1B4B] tracking-tight">{value ?? 0}</h4>
        {trend && <span className="text-xs font-semibold text-[#15803D]">{trend}</span>}
      </div>
      {subtitle && <p className="text-xs text-[#64748B] mt-2">{subtitle}</p>}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#8B5CF6]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

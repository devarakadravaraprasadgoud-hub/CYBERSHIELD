import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-[#E5E7EB] px-4 py-4 sm:px-6 mt-6">
      <div className="text-sm text-[#64748B]">
        Page <span className="font-semibold text-[#6D28D9]">{currentPage}</span> of{' '}
        <span className="font-semibold text-[#1E1B4B]">{totalPages}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-sm font-medium text-[#475569] hover:border-[#C4B5FD] hover:text-[#6D28D9] hover:bg-[#F5F3FF] disabled:opacity-40 disabled:pointer-events-none transition shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-sm font-medium text-[#475569] hover:border-[#C4B5FD] hover:text-[#6D28D9] hover:bg-[#F5F3FF] disabled:opacity-40 disabled:pointer-events-none transition shadow-2xs"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

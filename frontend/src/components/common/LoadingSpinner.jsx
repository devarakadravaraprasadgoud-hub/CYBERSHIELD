import React from 'react';
import { Shield } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading security data...', size = 'default' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3 text-center">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-[#EDE9FE] border-t-[#6D28D9] animate-spin" />
        <Shield className="w-5 h-5 text-[#6D28D9] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      </div>
      {message && <p className="text-sm font-medium text-[#64748B] font-mono tracking-wide">{message}</p>}
    </div>
  );
};

import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-xl' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl overflow-hidden z-10 animate-scale-up`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-[#FAF8FF]">
          <h3 className="text-lg font-bold text-[#1E1B4B] tracking-wide">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#1E1B4B] hover:bg-[#EDE9FE] p-1.5 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Destructive Action',
  message = 'Are you sure you want to proceed? This operation cannot be undone.',
  confirmLabel = 'Delete',
  isDanger = true
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-sm text-[#475569] leading-relaxed">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[#E5E7EB]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#475569] hover:bg-[#F5F3FF] hover:text-[#1E1B4B] transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition active:scale-95 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20'
                : 'bg-[#6D28D9] hover:bg-[#5B21B6] text-white shadow-md shadow-purple-500/20'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

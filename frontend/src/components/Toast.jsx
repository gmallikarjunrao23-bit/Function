'use client';

import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="glass rounded-xl px-4 py-3 flex items-center gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
        {isSuccess ? (
          <CheckCircle2 size={18} className="text-emerald-400" />
        ) : (
          <AlertCircle size={18} className="text-rose-400" />
        )}
        <span className="text-sm text-white">{message}</span>
        <button onClick={onClose} className="text-[#64748B] hover:text-white transition ml-2">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

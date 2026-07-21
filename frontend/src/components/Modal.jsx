'use client';

import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative glass-strong rounded-2xl p-6 w-full max-w-lg animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-[#64748B] hover:text-white transition">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

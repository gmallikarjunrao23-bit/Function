'use client';

import { Menu } from 'lucide-react';

export default function Header({ onMenuClick }) {
  return (
    <header className="glass sticky top-0 z-30 px-6 py-4 flex justify-between items-center">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-white/[0.05] transition text-[#94A3B8]"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-medium text-emerald-400">System Online</span>
      </div>
    </header>
  );
}

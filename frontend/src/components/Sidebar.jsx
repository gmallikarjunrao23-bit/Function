'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Ticket,
  Lightbulb,
  BarChart3,
  Settings,
  Zap,
  ChevronRight,
  Crown,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tickets', label: 'Tickets', icon: Ticket },
  { href: '/suggestions', label: 'Suggestions', icon: Lightbulb },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ onClose }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">TicketAI</div>
            <div className="text-xs text-[#64748B]">Deflection Analyzer</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-500/10 text-blue-400 border-l-[3px] border-l-blue-500 translate-x-0'
                  : 'text-[#64748B] hover:text-[#94A3B8] hover:bg-white/[0.03] hover:translate-x-1'
              }`}
            >
              <Icon size={20} />
              <span className="text-sm font-medium flex-1">{item.label}</span>
              {isActive && <ChevronRight size={16} />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/[0.06]">
        <div className="glass p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
              <Crown size={16} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Pro Plan</div>
              <div className="text-xs text-[#64748B]">Unlimited analysis</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

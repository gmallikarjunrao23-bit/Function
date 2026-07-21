import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const colorMap = {
  blue: { grad: 'from-blue-500/10', icon: 'bg-blue-500/15 text-blue-400' },
  purple: { grad: 'from-purple-500/10', icon: 'bg-purple-500/15 text-purple-400' },
  emerald: { grad: 'from-emerald-500/10', icon: 'bg-emerald-500/15 text-emerald-400' },
  amber: { grad: 'from-amber-500/10', icon: 'bg-amber-500/15 text-amber-400' },
  rose: { grad: 'from-rose-500/10', icon: 'bg-rose-500/15 text-rose-400' },
};

export default function StatCard({ title, value, subtitle, icon: Icon, trend, trendUp, color = 'blue', delay = 0 }) {
  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`card bg-gradient-to-b ${c.grad} to-transparent hover:scale-[1.02] animate-fade-in`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex justify-between items-start">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon}`}>
          {Icon && <Icon size={20} />}
        </div>
        {typeof trend === 'number' && (
          <div className={`flex items-center gap-1 text-xs font-bold ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-[32px] font-bold text-white mt-4">{value}</div>
      <div className="text-sm font-medium text-[#94A3B8]">{title}</div>
      {subtitle && <div className="text-xs text-[#64748B] mt-1">{subtitle}</div>}
    </div>
  );
}

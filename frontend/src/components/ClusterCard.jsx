import { MessageSquare, ChevronRight, TrendingUp } from 'lucide-react';

export default function ClusterCard({ cluster, index = 0 }) {
  const score = cluster.impactScore || 0;
  const impactClass =
    score >= 7 ? 'bg-rose-500/15 text-rose-400 border-rose-500/25'
    : score >= 4 ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25';

  const keywords = cluster.keywords || [];
  const shown = keywords.slice(0, 3);
  const extra = keywords.length - shown.length;

  return (
    <div className="card group cursor-pointer animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20">
            <MessageSquare size={20} className="text-blue-400" />
          </div>
          <div>
            <div className="text-[15px] font-semibold text-white group-hover:text-blue-400 transition">
              {cluster.name}
            </div>
            <div className="text-xs text-[#64748B]">{cluster.ticketCount} tickets</div>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[13px] font-bold ${impactClass}`}>
          {score >= 7 && <TrendingUp size={12} />}
          {score.toFixed(1)}
        </div>
      </div>

      <p className="text-sm text-[#94A3B8] mt-3 line-clamp-2 leading-relaxed">{cluster.description}</p>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/[0.04]">
        <div className="flex gap-1.5 flex-wrap">
          {shown.map((k) => (
            <span key={k} className="px-2 py-0.5 rounded-md bg-[#1A1F2E] text-[#64748B] text-[11px] font-medium border border-white/[0.04]">
              {k}
            </span>
          ))}
          {extra > 0 && <span className="text-[11px] text-[#475569]">+{extra}</span>}
        </div>
        <ChevronRight size={16} className="text-[#475569] group-hover:text-blue-400 group-hover:translate-x-1 transition" />
      </div>
    </div>
  );
}

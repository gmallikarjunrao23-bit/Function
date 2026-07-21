'use client';

import { useState } from 'react';
import { FileText, TrendingUp } from 'lucide-react';
import Badge from './Badge';
import { analysisAPI } from '@/lib/api';

export default function SuggestionCard({ suggestion, onUpdate, index = 0 }) {
  const [updating, setUpdating] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const priorityVariant = suggestion.priority === 'high' ? 'high' : suggestion.priority === 'medium' ? 'medium' : 'low';
  const statuses = ['pending', 'in_progress', 'completed'];

  async function handleStatusChange(status) {
    if (updating || status === suggestion.status) return;
    setUpdating(true);
    try {
      const updated = await analysisAPI.updateSuggestion(suggestion.id, status);
      onUpdate && onUpdate(updated);
    } catch (err) {
      console.error('Failed to update suggestion status', err);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="card group animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20">
            <FileText size={20} className="text-purple-400" />
          </div>
          <div>
            <div className="text-[15px] font-semibold text-white line-clamp-1 group-hover:text-purple-400 transition">
              {suggestion.title}
            </div>
            <div className="text-xs text-[#64748B]">{suggestion.cluster?.name}</div>
          </div>
        </div>
        <Badge variant={priorityVariant}>{suggestion.priority}</Badge>
      </div>

      <p className="text-sm text-[#94A3B8] mt-3 line-clamp-2">{suggestion.description}</p>

      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <TrendingUp size={14} className="text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-400">{suggestion.impact}%</span>
          <span className="text-xs text-[#64748B]">deflection potential</span>
        </div>
        <Badge variant={suggestion.status}>{suggestion.status.replace('_', ' ')}</Badge>
      </div>

      {expanded && (
        <div className="mt-4 p-4 rounded-xl bg-[#0B0F19] border border-white/[0.06]">
          <div className="text-[11px] uppercase tracking-wider text-[#64748B] font-semibold mb-2">
            Article outline
          </div>
          <div className="text-[13px] text-[#94A3B8] whitespace-pre-wrap leading-relaxed">
            {suggestion.content}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/[0.04]">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm font-medium text-blue-400 hover:text-blue-300"
        >
          {expanded ? 'Hide article outline' : 'View article outline'}
        </button>
        <div className="flex gap-1.5">
          {statuses.map((s) => (
            <button
              key={s}
              disabled={updating}
              onClick={() => handleStatusChange(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                s === suggestion.status
                  ? 'bg-[#252B3D] text-white'
                  : 'bg-transparent text-[#475569] hover:text-[#94A3B8] hover:bg-[#1A1F2E]'
              } ${updating ? 'opacity-50' : ''}`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Lightbulb } from 'lucide-react';
import Layout from '@/components/Layout';
import SuggestionCard from '@/components/SuggestionCard';
import EmptyState from '@/components/EmptyState';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { workspaceAPI, analysisAPI } from '@/lib/api';

const filters = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
];

export default function SuggestionsPage() {
  const [workspace, setWorkspace] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  async function loadSuggestions() {
    if (!workspace) return;
    try {
      setLoading(true);
      const res = await analysisAPI.getSuggestions(workspace.id, { status: filter });
      setSuggestions(res.suggestions || []);
    } catch (err) {
      console.error('Failed to load suggestions', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const wsRes = await workspaceAPI.list();
        const ws = wsRes.workspaces?.[0];
        if (ws) setWorkspace(ws);
      } catch (err) {
        console.error('Failed to load workspace', err);
      }
    }
    init();
  }, []);

  useEffect(() => {
    loadSuggestions();
  }, [workspace, filter]);

  const completedCount = suggestions.filter((s) => s.status === 'completed').length;
  const totalImpact = suggestions.reduce((sum, s) => sum + (s.impact || 0), 0);

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Suggestions</h1>
          <p className="text-[#64748B] mt-1">AI-generated help article recommendations</p>
        </div>
        <div className="flex gap-4">
          <div className="glass px-4 py-3 rounded-xl flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-400" />
            <div>
              <div className="text-lg font-bold text-white">{completedCount}</div>
              <div className="text-xs text-[#64748B]">Completed</div>
            </div>
          </div>
          <div className="glass px-4 py-3 rounded-xl flex items-center gap-3">
            <Lightbulb size={20} className="text-amber-400" />
            <div>
              <div className="text-lg font-bold text-white">{totalImpact}%</div>
              <div className="text-xs text-[#64748B]">Total Impact</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
              filter === f.value
                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                : 'bg-[#1A1F2E] text-[#64748B] hover:bg-[#252B3D]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <LoadingSkeleton key={i} type="card" />
          ))}
        </div>
      ) : suggestions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {suggestions.map((s, i) => (
            <SuggestionCard
              key={s.id}
              suggestion={s}
              index={i}
              onUpdate={(updated) => {
                setSuggestions((prev) =>
                  prev.map((item) => (item.id === updated.id ? updated : item))
                );
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Lightbulb}
          title="No suggestions yet"
          description="Analyze tickets to generate AI-powered article suggestions"
        />
      )}
    </Layout>
  );
}

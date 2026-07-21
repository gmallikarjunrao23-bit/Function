'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Zap, AlertCircle, Ticket, Layers, Lightbulb, Target } from 'lucide-react';
import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import ClusterCard from '@/components/ClusterCard';
import SuggestionCard from '@/components/SuggestionCard';
import EmptyState from '@/components/EmptyState';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { workspaceAPI, analysisAPI, ticketAPI } from '@/lib/api';

export default function Dashboard() {
  const [workspace, setWorkspace] = useState(null);
  const [stats, setStats] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const wsRes = await workspaceAPI.list();
      const ws = wsRes.workspaces?.[0];
      if (!ws) {
        setLoading(false);
        return;
      }
      setWorkspace(ws);

      const res = await analysisAPI.getResults(ws.id);
      setStats(res.stats);
      setClusters(res.clusters?.slice(0, 4) || []);
      setSuggestions(res.suggestions?.slice(0, 3) || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    if (!workspace || importing) return;
    try {
      setImporting(true);
      setError(null);
      await ticketAPI.import(workspace.id, 5);
      await loadData();
    } catch (err) {
      setError(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-[#64748B] mt-1">
            {workspace ? `${workspace.name} — Support ticket insights at a glance` : 'No workspace found'}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadData} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={handleImport}
            disabled={importing || !workspace}
            className="btn-primary flex items-center gap-2"
          >
            <Zap size={16} />
            {importing ? 'Analyzing...' : 'Import & Analyze'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-6">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {workspace ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Tickets"
              value={stats?.totalTickets || 0}
              subtitle="All time"
              icon={Ticket}
              color="blue"
              delay={0}
            />
            <StatCard
              title="Clusters Found"
              value={stats?.totalClusters || 0}
              subtitle="Root cause groups"
              icon={Layers}
              color="purple"
              delay={0.05}
            />
            <StatCard
              title="Suggestions"
              value={stats?.totalSuggestions || 0}
              subtitle="Article ideas"
              icon={Lightbulb}
              color="amber"
              delay={0.1}
            />
            <StatCard
              title="Avg Impact"
              value={stats?.avgImpact ? stats.avgImpact.toFixed(1) : '0.0'}
              subtitle="Out of 10"
              icon={Target}
              color="emerald"
              delay={0.15}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Top Clusters</h2>
                <a href="/tickets" className="text-sm text-blue-400 hover:text-blue-300">
                  View all
                </a>
              </div>
              {clusters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clusters.map((c, i) => (
                    <ClusterCard key={c.id} cluster={c} index={i} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Layers}
                  title="No clusters yet"
                  description="Import tickets to see AI-generated clusters"
                  actionLabel="Import Tickets"
                  actionHref="/tickets"
                />
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Priority Suggestions</h2>
                <a href="/suggestions" className="text-sm text-blue-400 hover:text-blue-300">
                  View all
                </a>
              </div>
              <div className="space-y-4">
                {suggestions.length > 0 ? (
                  suggestions.map((s, i) => (
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
                  ))
                ) : (
                  <EmptyState
                    icon={Lightbulb}
                    title="No suggestions yet"
                    description="Analyze tickets to generate article suggestions"
                  />
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          icon={AlertCircle}
          title="No workspace found"
          description="Create a workspace to get started with TicketAI"
        />
      )}
    </Layout>
  );
}

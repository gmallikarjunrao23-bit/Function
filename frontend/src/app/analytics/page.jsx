'use client';

import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import Layout from '@/components/Layout';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import { workspaceAPI, analysisAPI } from '@/lib/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#3B82F6', '#F59E0B', '#64748B', '#10B981'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass p-3 rounded-xl border border-white/[0.08]">
      <p className="text-sm font-semibold text-white mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [workspace, setWorkspace] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const wsRes = await workspaceAPI.list();
        const ws = wsRes.workspaces?.[0];
        if (!ws) {
          setLoading(false);
          return;
        }
        setWorkspace(ws);

        const [clustersRes, statsRes] = await Promise.all([
          analysisAPI.getClusters(ws.id),
          analysisAPI.getStats(ws.id),
        ]);

        setClusters(clustersRes.clusters || []);
        setStats(statsRes.stats);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const clusterChartData = clusters.map((c) => ({
    name: c.name,
    tickets: c.ticketCount,
    impact: c.impactScore,
  }));

  const statusData =
    stats?.statusDistribution?.map((s) => ({
      name: s.status,
      value: s._count.id,
    })) || [];

  const priorityData =
    stats?.priorityDistribution?.map((p) => ({
      name: p.priority,
      value: p._count.id,
    })) || [];

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">Analytics</h1>
        <p className="text-[#64748B] mt-1">Visualize ticket patterns and impact</p>
      </div>

      {loading ? (
        <LoadingSkeleton type="stats" />
      ) : clusters.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No data yet"
          description="Import and analyze tickets to see analytics"
        />
      ) : (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <BarChart3 size={20} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Cluster Impact Analysis</h3>
                <p className="text-sm text-[#64748B]">Tickets vs Impact Score by cluster</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={clusterChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="tickets" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Tickets" />
                <Bar dataKey="impact" fill="#A855F7" radius={[6, 6, 0, 0]} name="Impact" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Status Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-sm text-[#94A3B8]">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Priority Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-sm text-[#94A3B8]">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Search, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '@/components/Layout';
import TicketRow from '@/components/TicketRow';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import { workspaceAPI, ticketAPI } from '@/lib/api';

export default function TicketsPage() {
  const [workspace, setWorkspace] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function loadTickets() {
    if (!workspace) return;
    try {
      setLoading(true);
      const res = await ticketAPI.list(workspace.id, {
        status: statusFilter,
        page,
        limit: 20,
      });
      setTickets(res.tickets || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load tickets', err);
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
    loadTickets();
  }, [workspace, page, statusFilter]);

  const filteredTickets = tickets.filter((t) =>
    search
      ? (t.subject + ' ' + t.body).toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">Tickets</h1>
        <p className="text-[#64748B] mt-1">Browse and search all support tickets</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="input-field w-full sm:w-40"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="border-b border-white/[0.06]">
            <tr>
              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                Subject
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                Status
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                Priority
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                Cluster
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {loading ? (
              <tr>
                <td colSpan={5}>
                  <LoadingSkeleton type="table" />
                </td>
              </tr>
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <AlertCircle size={32} className="text-[#334155] mx-auto mb-3" />
                  <div className="text-lg font-semibold text-[#94A3B8]">No tickets found</div>
                  <p className="text-sm text-[#64748B] mt-1">
                    {search ? 'Try a different search term' : 'Import tickets to get started'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => <TicketRow key={ticket.id} ticket={ticket} />)
            )}
          </tbody>
        </table>

        {!loading && filteredTickets.length > 0 && (
          <div className="flex justify-between items-center border-t border-white/[0.06] px-6 py-4">
            <span className="text-sm text-[#64748B]">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg bg-[#1A1F2E] text-[#94A3B8] hover:bg-[#252B3D] disabled:opacity-30 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg bg-[#1A1F2E] text-[#94A3B8] hover:bg-[#252B3D] disabled:opacity-30 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

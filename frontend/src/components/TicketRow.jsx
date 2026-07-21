import { MessageSquare } from 'lucide-react';
import Badge from './Badge';

function priorityVariant(priority) {
  if (priority === 'urgent' || priority === 'high') return 'high';
  if (priority === 'normal') return 'medium';
  return 'low';
}

export default function TicketRow({ ticket }) {
  return (
    <tr className="hover:bg-white/[0.02] transition">
      <td className="px-6 py-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1A1F2E] flex items-center justify-center flex-shrink-0">
            <MessageSquare size={16} className="text-[#64748B]" />
          </div>
          <div>
            <div className="text-sm font-medium text-white hover:text-blue-400 cursor-pointer">
              {ticket.subject}
            </div>
            <div className="text-xs text-[#64748B] line-clamp-1 max-w-md">{ticket.body}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <Badge variant={ticket.status === 'closed' ? 'completed' : ticket.status === 'pending' ? 'in_progress' : 'pending'}>
          {ticket.status}
        </Badge>
      </td>
      <td className="px-6 py-4">
        <Badge variant={priorityVariant(ticket.priority)}>{ticket.priority}</Badge>
      </td>
      <td className="px-6 py-4 text-sm text-[#94A3B8]">{ticket.cluster?.name || '—'}</td>
      <td className="px-6 py-4 text-xs text-[#64748B]">
        {new Date(ticket.createdAt).toLocaleDateString()}
      </td>
    </tr>
  );
}

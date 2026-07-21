export default function LoadingSkeleton({ type = 'card' }) {
  if (type === 'stats') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card h-32 animate-pulse bg-[#1A1F2E]" />
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-0">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 animate-pulse bg-[#1A1F2E] border-b border-white/[0.04]" />
        ))}
      </div>
    );
  }

  return <div className="card h-48 animate-pulse bg-[#1A1F2E]" />;
}

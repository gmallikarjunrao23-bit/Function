export default function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }) {
  return (
    <div className="card py-16 text-center">
      {Icon && <Icon size={56} className="text-[#334155] mx-auto mb-4" />}
      <div className="text-lg font-semibold text-[#94A3B8]">{title}</div>
      {description && (
        <p className="text-sm text-[#64748B] mt-2 max-w-md mx-auto">{description}</p>
      )}
      {actionLabel && actionHref && (
        <a href={actionHref} className="btn-primary inline-block mt-6">
          {actionLabel}
        </a>
      )}
    </div>
  );
}

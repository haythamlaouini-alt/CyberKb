/**
 * Loader — three variants:
 *   'spinner'  — small inline spinning ring (default)
 *   'page'     — full-page centered spinner
 *   'dots'     — three bouncing dots (used in chat)
 *   'skeleton' — shimmer placeholder block
 */
export default function Loader({ variant = 'spinner', className = '' }) {
  if (variant === 'page') {
    return (
      <div className="min-h-screen bg-cyber-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-white/10 border-t-neon rounded-full animate-spin" />
          <span className="text-slate-600 text-[0.72rem] font-mono tracking-widest">chargement...</span>
        </div>
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {[0, 150, 300].map((delay, i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-dot"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div className={`animate-pulse bg-cyber-elevated rounded-lg ${className}`} />
    );
  }

  // default: 'spinner'
  return (
    <div
      className={`w-4 h-4 border-2 border-white/10 border-t-neon rounded-full animate-spin ${className}`}
    />
  );
}

/** Grid of skeleton cards — handy for list loading states */
export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-cyber-card border border-white/[0.07] rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Loader variant="skeleton" className="h-3 w-16" />
            <Loader variant="skeleton" className="h-4 w-14 rounded-full" />
          </div>
          <Loader variant="skeleton" className="h-4 w-3/4" />
          <Loader variant="skeleton" className="h-3 w-full" />
          <Loader variant="skeleton" className="h-3 w-5/6" />
        </div>
      ))}
    </div>
  );
}
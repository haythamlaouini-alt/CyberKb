const CONFIG = {
  critical: {
    badge: 'bg-red-500/10 text-red-400 border border-red-500/25',
    dot:   'bg-red-400 shadow-[0_0_6px_#f87171]',
    label: 'Critique',
    bar:   'bg-red-400',
    width: 'w-full',
  },
  high: {
    badge: 'bg-orange-500/10 text-orange-400 border border-orange-500/25',
    dot:   'bg-orange-400 shadow-[0_0_6px_#fb923c]',
    label: 'Élevé',
    bar:   'bg-orange-400',
    width: 'w-3/4',
  },
  medium: {
    badge: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25',
    dot:   'bg-yellow-400 shadow-[0_0_6px_#facc15]',
    label: 'Moyen',
    bar:   'bg-yellow-400',
    width: 'w-1/2',
  },
  low: {
    badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/25',
    dot:   'bg-blue-400',
    label: 'Faible',
    bar:   'bg-blue-400',
    width: 'w-1/4',
  },
};

/**
 * SeverityBadge — pill badge with dot indicator.
 * Props: severity ('critical'|'high'|'medium'|'low'), showLabel (bool)
 */
export default function SeverityBadge({ severity, showLabel = true }) {
  const cfg = CONFIG[severity] ?? CONFIG.medium;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[0.68rem] font-semibold font-mono tracking-wide uppercase ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {showLabel && cfg.label}
    </span>
  );
}

/** Horizontal severity bar — useful in detail pages */
export function SeverityBar({ severity }) {
  const cfg = CONFIG[severity] ?? CONFIG.medium;
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[0.65rem] uppercase tracking-widest text-slate-600 font-mono w-14 flex-shrink-0">
        {cfg.label}
      </span>
      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${cfg.bar} ${cfg.width}`} />
      </div>
    </div>
  );
}

/** Export raw config for reuse elsewhere */
export { CONFIG as SEVERITY_CONFIG };
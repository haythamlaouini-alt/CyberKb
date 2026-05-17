/**
 * Card — generic surface container.
 *
 * Props:
 *  variant: 'default' | 'accent' | 'flat'
 *  hover:   boolean — adds lift + brighter border on hover
 *  padding: 'none' | 'sm' | 'md' | 'lg'  (default 'md')
 */
const VARIANTS = {
  default: 'bg-cyber-card border border-white/[0.07]',
  accent:  'bg-neon/[0.04] border border-neon/20',
  flat:    'bg-cyber-surface border border-white/[0.07]',
};

const PADDING = {
  none: '',
  sm:   'p-3',
  md:   'p-5',
  lg:   'p-7',
};

export default function Card({
  children,
  variant  = 'default',
  padding  = 'md',
  hover    = false,
  className = '',
  ...props
}) {
  return (
    <div
      className={[
        'rounded-xl',
        VARIANTS[variant] ?? VARIANTS.default,
        PADDING[padding]  ?? PADDING.md,
        hover
          ? 'transition-all duration-200 hover:border-white/[0.13] hover:shadow-card hover:-translate-y-0.5 cursor-pointer'
          : '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

/** Convenience sub-components */
Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-4 flex items-center justify-between gap-2 ${className}`}>
      {children}
    </div>
  );
};

Card.Title = function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`font-display font-bold text-slate-100 text-[0.95rem] ${className}`}>
      {children}
    </h3>
  );
};

Card.Body = function CardBody({ children, className = '' }) {
  return <div className={className}>{children}</div>;
};
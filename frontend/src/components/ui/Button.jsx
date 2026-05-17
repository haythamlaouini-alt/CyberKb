import { forwardRef } from 'react';

const VARIANTS = {
  primary: 'bg-neon text-cyber-base border-neon hover:bg-neon-dim hover:border-neon-dim active:scale-[0.98]',
  outline: 'bg-transparent text-slate-300 border-white/10 hover:bg-cyber-elevated hover:text-slate-100 hover:border-white/20',
  ghost:   'bg-transparent text-slate-400 border-transparent hover:bg-cyber-elevated hover:text-slate-200',
  danger:  'bg-transparent text-red-400 border-red-500/30 hover:bg-red-500/10',
  success: 'bg-transparent text-neon border-neon/30 hover:bg-neon/10',
};

const SIZES = {
  xs: 'text-[0.68rem] px-2 py-0.5 gap-1',
  sm: 'text-[0.75rem] px-2.5 py-1 gap-1.5',
  md: 'text-[0.8rem] px-3.5 py-1.5 gap-1.5',
  lg: 'text-[0.88rem] px-5 py-2.5 gap-2',
};

const Button = forwardRef(({
  children, variant = 'primary', size = 'md',
  className = '', loading = false, disabled,
  fullWidth, type = 'button', ...props
}, ref) => (
  <button
    ref={ref}
    type={type}
    disabled={disabled || loading}
    className={[
      'inline-flex items-center justify-center font-mono font-medium rounded-md',
      'border transition-all duration-150 cursor-pointer select-none',
      'disabled:opacity-40 disabled:cursor-not-allowed',
      VARIANTS[variant] ?? VARIANTS.primary,
      SIZES[size] ?? SIZES.md,
      fullWidth ? 'w-full' : '',
      className,
    ].filter(Boolean).join(' ')}
    {...props}
  >
    {loading && (
      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
    )}
    {children}
  </button>
));

Button.displayName = 'Button';
export default Button;
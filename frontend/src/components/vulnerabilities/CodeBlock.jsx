import { useState } from 'react';

/**
 * CodeBlock — displays code with language label, copy button,
 * and optional 'vulnerable vs secure' tab toggle.
 *
 * Props:
 *   code       string   — the code to display
 *   language   string   — e.g. 'python', 'javascript'
 *   label      string   — optional custom label
 *   variant    'default'|'vulnerable'|'secure'
 *   tabs       { vulnerable: string, secure: string } — enables tab mode
 */
export default function CodeBlock({ code, language = 'code', label, variant = 'default', tabs }) {
  const [copied, setCopied]     = useState(false);
  const [activeTab, setActiveTab] = useState('vulnerable');

  const displayCode = tabs ? tabs[activeTab] : code;
  const displayLang = language;

  const copy = () => {
    navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const borderColor =
    variant === 'vulnerable' ? 'border-l-red-400' :
    variant === 'secure'     ? 'border-l-neon' :
    activeTab === 'vulnerable' && tabs ? 'border-l-red-400' :
    activeTab === 'secure'    && tabs ? 'border-l-neon' :
    'border-l-slate-500';

  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.07]">
      {/* Tab switcher (only shown when `tabs` prop is provided) */}
      {tabs && (
        <div className="flex border-b border-white/[0.07]">
          <button
            onClick={() => setActiveTab('vulnerable')}
            className={`flex items-center gap-1.5 px-4 py-2 text-[0.75rem] font-mono transition-all border-r border-white/[0.07]
              ${activeTab === 'vulnerable'
                ? 'bg-red-500/10 text-red-400'
                : 'bg-cyber-surface text-slate-500 hover:text-slate-300'
              }`}
          >
            <span className="text-[0.7rem]">✗</span> Code vulnérable
          </button>
          <button
            onClick={() => setActiveTab('secure')}
            className={`flex items-center gap-1.5 px-4 py-2 text-[0.75rem] font-mono transition-all
              ${activeTab === 'secure'
                ? 'bg-neon/10 text-neon'
                : 'bg-cyber-surface text-slate-500 hover:text-slate-300'
              }`}
          >
            <span className="text-[0.7rem]">✓</span> Code corrigé
          </button>
          <div className="flex-1 bg-cyber-surface" />
        </div>
      )}

      {/* Header bar */}
      {!tabs && (
        <div className="flex items-center justify-between bg-cyber-elevated border-b border-white/[0.07] px-4 py-2">
          <span className={`text-[0.7rem] font-mono font-medium tracking-wide
            ${variant === 'vulnerable' ? 'text-red-400' :
              variant === 'secure'     ? 'text-neon'    : 'text-slate-500'}`}
          >
            {label || displayLang}
          </span>
          {variant === 'vulnerable' && (
            <span className="text-[0.65rem] text-red-400 font-mono bg-red-500/10 px-2 py-0.5 rounded">
              ⚠ vulnérable
            </span>
          )}
          {variant === 'secure' && (
            <span className="text-[0.65rem] text-neon font-mono bg-neon/10 px-2 py-0.5 rounded">
              ✓ corrigé
            </span>
          )}
        </div>
      )}

      {/* Code area */}
      <div className="relative group">
        <button
          onClick={copy}
          className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity
            text-[0.68rem] font-mono text-slate-500 hover:text-slate-200 bg-cyber-base/80
            border border-white/10 px-2 py-1 rounded"
        >
          {copied ? '✓ Copié' : '⎘ Copier'}
        </button>

        <pre className={`overflow-x-auto p-4 text-[0.8rem] leading-relaxed font-mono
          bg-cyber-elevated text-slate-200
          border-l-2 ${borderColor} m-0 rounded-none`}
        >
          <code>{displayCode}</code>
        </pre>
      </div>
    </div>
  );
}
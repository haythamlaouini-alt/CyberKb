import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Loader from '../ui/Loader';

/**
 * ChatMessage — renders a single chat bubble.
 *
 * Props:
 *   role     'user' | 'assistant'
 *   content  string  (supports markdown)
 *   streaming bool   — shows blinking cursor at end
 *   loading  bool    — shows typing dots instead of content
 */
export default function ChatMessage({ role, content, streaming = false, loading = false }) {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-2.5 animate-[msgIn_0.18s_ease] ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar dot */}
      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
        text-[0.58rem] font-bold font-mono
        ${isUser
          ? 'bg-neon/10 border border-neon/30 text-neon'
          : 'bg-cyber-elevated border border-white/10 text-slate-400'
        }`}
      >
        {isUser ? 'U' : 'AI'}
      </div>

      {/* Bubble */}
      <div className={[
        'max-w-[76%] px-3.5 py-2.5 text-[0.83rem] leading-relaxed font-mono',
        isUser
          ? 'bg-neon/10 border border-neon/25 text-slate-100 rounded-xl rounded-tr-sm'
          : 'bg-cyber-card border border-white/[0.07] text-slate-200 rounded-xl rounded-tl-sm',
        streaming ? 'border-neon/30' : '',
      ].filter(Boolean).join(' ')}
      >
        {loading ? (
          <Loader variant="dots" />
        ) : (
          <>
            <div className={`
              prose prose-sm max-w-none
              prose-p:text-[0.83rem] prose-p:text-slate-200 prose-p:my-1 prose-p:leading-relaxed
              prose-strong:text-slate-100 prose-strong:font-semibold
              prose-li:text-slate-300 prose-li:text-[0.83rem]
              prose-code:bg-cyber-elevated prose-code:text-neon prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.75rem] prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-cyber-elevated prose-pre:border prose-pre:border-l-2 prose-pre:border-white/[0.07] prose-pre:border-l-neon prose-pre:rounded-lg prose-pre:p-3 prose-pre:text-[0.75rem] prose-pre:my-2
              prose-h1:text-slate-100 prose-h2:text-slate-100 prose-h3:text-slate-100
              prose-h1:text-base prose-h2:text-[0.9rem] prose-h3:text-[0.85rem]
              prose-a:text-neon prose-a:no-underline hover:prose-a:underline
            `}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
            {streaming && (
              <span className="inline-block text-neon ml-0.5 animate-[blink_1s_step-end_infinite]">▊</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
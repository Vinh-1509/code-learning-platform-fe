import { cn } from '@/lib/utils';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface AIMessageProps {
  content: string;
  isQuestion?: boolean;
  isFeedback?: boolean;
}

export function AIMessage({
  content,
  isQuestion = false,
  isFeedback = false,
}: AIMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasCodeBlock = content.includes('```') || content.includes('`');

  return (
    <div className="flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* AI Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
        <span className="text-xs font-bold text-white">🤖</span>
      </div>

      {/* Message Bubble */}
      <div className="flex-1">
        <div
          className={cn(
            'rounded-xl p-3.5 text-sm leading-relaxed',
            isFeedback
              ? 'bg-amber-50 border border-amber-200 text-amber-900'
              : isQuestion
                ? 'bg-slate-100 border border-slate-200 text-slate-900'
                : 'bg-slate-50 border border-slate-200 text-slate-800'
          )}
        >
          <p className="whitespace-pre-wrap break-words">{content}</p>
        </div>

        {/* Copy button for code blocks */}
        {hasCodeBlock && (
          <button
            onClick={handleCopy}
            className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

interface UserMessageProps {
  content: string;
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex gap-3 mb-4 justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Message Bubble - aligned to right */}
      <div className="flex-1 max-w-md">
        <div className="rounded-xl p-3.5 text-sm leading-relaxed bg-blue-500 text-white border border-blue-600">
          <p className="whitespace-pre-wrap break-words">{content}</p>
        </div>
      </div>

      {/* User Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
        <span className="text-xs font-bold text-white">👤</span>
      </div>
    </div>
  );
}

interface FeedbackBadgeProps {
  isCorrect: boolean;
  message: string;
}

export function FeedbackBadge({ isCorrect, message }: FeedbackBadgeProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-4 border mb-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300',
        isCorrect
          ? 'bg-emerald-50 border-emerald-300'
          : 'bg-rose-50 border-rose-300'
      )}
    >
      <span className="text-xl flex-shrink-0 mt-0.5">
        {isCorrect ? '✓' : '✗'}
      </span>
      <div className="flex-1">
        <p
          className={cn(
            'text-sm font-semibold',
            isCorrect ? 'text-emerald-800' : 'text-rose-800'
          )}
        >
          {isCorrect
            ? 'Great! Your answer is correct.'
            : "Not quite! Here's what's wrong:"}
        </p>
        <p
          className={cn(
            'text-sm mt-1',
            isCorrect ? 'text-emerald-700' : 'text-rose-700'
          )}
        >
          {message}
        </p>
      </div>
    </div>
  );
}

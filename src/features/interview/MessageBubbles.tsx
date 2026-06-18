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
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-codeblock-header flex items-center justify-center">
        <span className="text-xs font-bold text-white">🤖</span>
      </div>

      {/* Message Bubble */}
      <div className="flex-1">
        <div
          className={cn(
            'rounded-xl p-3.5 text-sm leading-relaxed',
            isFeedback
              ? 'bg-hint-yellow border border-yellow-medium/40 text-brown'
              : isQuestion
                ? 'bg-muted border border-border text-foreground'
                : 'bg-muted/40 border border-border text-foreground/90'
          )}
        >
          <p className="whitespace-pre-wrap break-words">{content}</p>
        </div>

        {/* Copy button for code blocks */}
        {hasCodeBlock && (
          <button
            onClick={handleCopy}
            className="mt-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
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
        <div className="rounded-xl p-3.5 text-sm leading-relaxed bg-primary text-white border border-primary/90">
          <p className="whitespace-pre-wrap break-words">{content}</p>
        </div>
      </div>

      {/* User Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
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
          ? 'bg-green-mint border border-success/30'
          : 'bg-red-mint border border-destructive/30'
      )}
    >
      <span className="text-xl flex-shrink-0 mt-0.5">
        {isCorrect ? '✓' : '✗'}
      </span>
      <div className="flex-1">
        <p
          className={cn(
            'text-sm font-semibold',
            isCorrect ? 'text-green-foreground' : 'text-red-foreground'
          )}
        >
          {isCorrect
            ? 'Great! Your answer is correct.'
            : "Not quite! Here's what's wrong:"}
        </p>
        <p
          className={cn(
            'text-sm mt-1',
            isCorrect ? 'text-green-foreground/90' : 'text-red-foreground/90'
          )}
        >
          {message}
        </p>
      </div>
    </div>
  );
}

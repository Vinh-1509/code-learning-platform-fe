import { cn } from '@/lib/utils';
import type { ExplainAnswerResponse } from '@/lib/axios';
import type { ExplanationStatus } from '../types/asyncTypes';
interface ResultBannerProps {
  showResult: 'correct' | 'wrong' | null;
  explanation?: ExplainAnswerResponse | null;
  explanationStatus: ExplanationStatus;
}

export function ResultBanner({
  showResult,
  explanation,
  explanationStatus,
}: ResultBannerProps) {
  if (!showResult) {
    return null;
  }

  return (
    <div className="mb-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Pass / Fail header row */}
      <div
        className={cn(
          'rounded-xl p-4 flex items-center justify-between border',
          showResult === 'correct'
            ? 'bg-green-mint border border-success/30 text-green-foreground'
            : 'bg-red-mint border border-destructive/30 text-red-foreground'
        )}
      >
        <span className="text-sm font-semibold">
          {showResult === 'correct'
            ? '✓ Correct Answer!'
            : '✗ Incorrect. Try again.'}
        </span>
      </div>

      {/* AI Explanation Panel */}
      {showResult === 'wrong' && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-muted border-b border-border">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              AI Explanation
            </span>

            {explanationStatus.status === 'loading' && (
              <span className="text-[10px] text-muted-foreground/60 animate-pulse">
                Analyzing…
              </span>
            )}
          </div>

          {/* Loading State */}
          {explanationStatus.status === 'loading' && (
            <div className="px-4 py-4 space-y-2">
              <div className="h-3 bg-muted rounded animate-pulse w-3/4" />

              <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
            </div>
          )}

          {/* Error State */}
          {explanationStatus.status === 'error' && (
            <div className="px-4 py-4 text-sm text-destructive">
              Failed to generate AI explanation. Please try again later.
            </div>
          )}

          {/* Success State */}
          {explanationStatus.status === 'success' && explanation && (
            <div className="px-4 py-3 space-y-3 text-sm text-foreground/90">
              {/* Overall Feedback */}
              <p className="leading-relaxed">{explanation.feedback}</p>

              {/* Incorrect Fields */}
              {explanation.items.some((it) => !it.isCorrect) && (
                <ul className="space-y-1.5">
                  {explanation.items
                    .filter((it) => !it.isCorrect)
                    .map((it) => (
                      <li
                        key={it.field}
                        className="flex gap-2 text-xs leading-relaxed"
                      >
                        <span className="mt-0.5 shrink-0 text-destructive">
                          ✗
                        </span>

                        <span>
                          <span className="font-semibold text-foreground">
                            {it.field}:
                          </span>{' '}
                          {it.explanation}
                        </span>
                      </li>
                    ))}
                </ul>
              )}

              {/* Suggestion */}
              {explanation.suggestion && (
                <p className="text-xs text-muted-foreground italic border-t border-border pt-2">
                  💡 {explanation.suggestion}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

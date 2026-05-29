import { cn } from '@/lib/utils';
import type { ExplainAnswerResponse } from '@/lib/axios';
import type { ExplanationStatus } from '../types/async.types';
interface ResultBannerProps {
  showResult: 'correct' | 'wrong' | null;
  submitted: boolean;
  onReset: () => void;
  explanation?: ExplainAnswerResponse | null;
  explanationStatus: ExplanationStatus;
}

export function ResultBanner({
  showResult,
  submitted,
  onReset,
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
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
            : 'bg-rose-50 border-rose-300 text-rose-800'
        )}
      >
        <span className="text-sm font-semibold">
          {showResult === 'correct'
            ? '✓ Correct Answer!'
            : '✗ Incorrect. Try again.'}
        </span>

        {showResult === 'wrong' && submitted && (
          <button
            onClick={onReset}
            className="bg-rose-200 text-rose-900 hover:bg-rose-300 h-7 px-3 text-xs font-bold rounded-lg transition-all"
          >
            Reset
          </button>
        )}
      </div>

      {/* AI Explanation Panel */}
      {showResult === 'wrong' && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              AI Explanation
            </span>

            {explanationStatus.status === 'loading' && (
              <span className="text-[10px] text-slate-400 animate-pulse">
                Analyzing…
              </span>
            )}
          </div>

          {/* Loading State */}
          {explanationStatus.status === 'loading' && (
            <div className="px-4 py-4 space-y-2">
              <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4" />

              <div className="h-3 bg-slate-200 rounded animate-pulse w-1/2" />
            </div>
          )}

          {/* Error State */}
          {explanationStatus.status === 'error' && (
            <div className="px-4 py-4 text-sm text-rose-500">
              Failed to generate AI explanation. Please try again later.
            </div>
          )}

          {/* Success State */}
          {explanationStatus.status === 'success' && explanation && (
            <div className="px-4 py-3 space-y-3 text-sm text-slate-700">
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
                        <span className="mt-0.5 shrink-0 text-rose-500">✗</span>

                        <span>
                          <span className="font-semibold text-slate-800">
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
                <p className="text-xs text-slate-500 italic border-t border-slate-200 pt-2">
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

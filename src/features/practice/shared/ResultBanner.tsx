import { cn } from '@/lib/utils';
import type { ExplainAnswerResponse } from '@/lib/axios';

interface ResultBannerProps {
  showResult: 'correct' | 'wrong' | null;
  submitted: boolean;
  onReset: () => void;
  explanation?: ExplainAnswerResponse | null;
  isExplaining?: boolean;
}

export function ResultBanner({
  showResult,
  submitted,
  onReset,
  explanation,
  isExplaining,
}: ResultBannerProps) {
  if (!showResult) return null;

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

      {/* AI Explanation panel — only shown on wrong answers */}
      {showResult === 'wrong' && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              AI Explanation
            </span>
            {isExplaining && (
              <span className="text-[10px] text-slate-400 animate-pulse">
                Analyzing…
              </span>
            )}
          </div>

          {isExplaining && !explanation ? (
            <div className="px-4 py-4 space-y-2">
              <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-slate-200 rounded animate-pulse w-1/2" />
            </div>
          ) : explanation ? (
            <div className="px-4 py-3 space-y-3 text-sm text-slate-700">
              {/* Overall feedback */}
              <p className="leading-relaxed">{explanation.feedback}</p>

              {/* Per-field breakdowns (only wrong fields) */}
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
          ) : null}
        </div>
      )}
    </div>
  );
}

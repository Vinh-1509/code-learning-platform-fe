import { cn } from '@/lib/utils';

interface ResultBannerProps {
  showResult: 'correct' | 'wrong' | null;
  submitted: boolean;
  onReset: () => void;
}

export function ResultBanner({
  showResult,
  submitted,
  onReset,
}: ResultBannerProps) {
  if (!showResult) return null;

  return (
    <div
      className={cn(
        'rounded-xl p-4 flex items-center justify-between border mb-4 animate-in fade-in slide-in-from-top-2 duration-300',
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
  );
}

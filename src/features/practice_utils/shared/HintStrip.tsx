import { Button } from '@/components/ui/button';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

interface HintStripProps {
  onToggleHint: () => void;
  onRequestHint: () => void;
  hints: string[];
  isOpen: boolean;
}

export function HintStrip({
  onToggleHint,
  onRequestHint,
  hints,
  isOpen,
}: HintStripProps) {
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (isOpen) {
      // If panel is open -> Close it on click
      onToggleHint();
    } else {
      // If panel is closed -> Request next hint (which handles opening)
      void onRequestHint();
    }
  };

  return (
    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/60 p-3 flex flex-col gap-2.5 transition-all">
      {/* Header */}
      <div
        onClick={onToggleHint}
        className="flex items-center justify-between w-full cursor-pointer select-none"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
          <Lightbulb className="size-4 text-amber-600 fill-amber-100" />

          <span>Hints {hints.length > 0 ? `(${hints.length})` : ''}</span>

          {hints.length > 0 &&
            (isOpen ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            ))}
        </div>

        <Button
          type="button"
          onClick={handleButtonClick}
          className="bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold px-3 h-7 rounded-lg transition-colors shadow-sm"
        >
          {isOpen ? 'Hide Hint' : hints.length > 0 ? 'Next Hint' : 'Get Hint'}
        </Button>
      </div>

      {/* Hint list */}
      {isOpen && hints.length > 0 && (
        <div className="text-xs text-amber-900 bg-white/80 border border-amber-200/60 rounded-lg p-3 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
          <ul className="list-disc list-inside space-y-2">
            {hints.map((hint, idx) => (
              <li key={`${idx}-${hint}`} className="marker:text-amber-600 pl-1">
                {hint}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

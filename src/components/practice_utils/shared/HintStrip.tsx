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
    <div className="mt-5 rounded-xl border border-yellow-medium/40 bg-hint-yellow/60 p-3 flex flex-col gap-2.5 transition-all">
      {/* Header */}
      <div
        onClick={onToggleHint}
        className="flex items-center justify-between w-full cursor-pointer select-none"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-brown uppercase tracking-wider">
          <Lightbulb className="size-4 text-yellow-patel fill-yellow-medium" />

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
          className="bg-yellow-patel hover:bg-yellow-patel/90 text-white text-[11px] font-bold px-3 h-7 rounded-lg transition-colors shadow-sm"
        >
          {isOpen ? 'Hide Hint' : hints.length > 0 ? 'Next Hint' : 'Get Hint'}
        </Button>
      </div>

      {/* Hint list */}
      {isOpen && hints.length > 0 && (
        <div className="text-xs text-brown bg-card/80 border border-yellow-medium/30 rounded-lg p-3 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
          <ul className="list-disc list-inside space-y-2">
            {hints.map((hint, idx) => (
              <li
                key={`${idx}-${hint}`}
                className="marker:text-yellow-patel pl-1"
              >
                {hint}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

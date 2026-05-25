import { Lightbulb } from 'lucide-react';

interface HintStripProps {
  onShowHint: () => void;
}

export function HintStrip({ onShowHint }: HintStripProps) {
  return (
    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/60 p-3 flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
        <Lightbulb className="size-4 text-amber-600 fill-amber-100" />
        <span>Hints</span>
      </div>
      <button
        onClick={onShowHint}
        className="bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold px-3 h-7 rounded-lg transition-colors shadow-sm"
      >
        Show Hint
      </button>
    </div>
  );
}

import { cn } from '@/lib/utils';
import type { DraggableBlock } from '../../types/practice.types';

interface AvailableBlockProps {
  block: DraggableBlock;
  isUsed: boolean;
  onDragStart: (id: string) => void;
}

export function AvailableBlock({
  block,
  isUsed,
  onDragStart,
}: AvailableBlockProps) {
  return (
    <div
      draggable={!isUsed}
      onDragStart={() => !isUsed && onDragStart(block.id)}
      className={cn(
        'rounded-xl h-11 flex items-center px-4 font-mono text-[13px] border shadow-sm transition-all relative select-none shrink-0 min-w-[110px] justify-center',
        isUsed
          ? 'opacity-20 border-slate-200 bg-slate-100/50 cursor-not-allowed shadow-none'
          : 'border-blue-400 bg-white text-slate-800 cursor-grab hover:border-blue-600 hover:shadow'
      )}
    >
      <span>{block.code}</span>
    </div>
  );
}

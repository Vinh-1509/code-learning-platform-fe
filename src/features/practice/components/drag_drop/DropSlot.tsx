import { cn } from '@/lib/utils';
import type { DraggableBlock } from '../../types/practice.types';

interface DropSlotProps {
  slotIndex: number;
  block?: DraggableBlock;
  isOver: boolean;
  onDrop: (slotIndex: number) => void;
  onDragOver: (e: React.DragEvent, slotIndex: number) => void;
  onDragLeave: () => void;
  onDragStart: (id: string, fromSlot?: number) => void;
  onRemove: (slotIndex: number) => void;
}

export function DropSlot({
  slotIndex,
  block,
  isOver,
  onDrop,
  onDragOver,
  onDragLeave,
  onDragStart,
  onRemove,
}: DropSlotProps) {
  return (
    <div
      onDrop={() => onDrop(slotIndex)}
      onDragOver={(e) => onDragOver(e, slotIndex)}
      onDragLeave={onDragLeave}
      className={cn(
        'w-full h-12 rounded-xl flex items-center px-3 border transition-all',
        block
          ? 'bg-blue-50 border-blue-500 shadow-sm'
          : isOver
            ? 'bg-blue-100/70 border-blue-400 border-dashed'
            : 'bg-slate-50 border-slate-200'
      )}
    >
      <div
        className={cn(
          'size-5 rounded-full border flex items-center justify-center text-[11px] font-bold mr-3 shrink-0',
          block
            ? 'bg-blue-600 border-blue-600 text-white'
            : 'border-slate-300 text-slate-400 bg-white'
        )}
      >
        {slotIndex + 1}
      </div>

      {block ? (
        <div
          draggable
          onDragStart={() => onDragStart(block.id, slotIndex)}
          className="flex items-center justify-between flex-1 cursor-grab font-mono text-[13px] text-slate-800"
        >
          <span>
            {'  '.repeat(block.indent)}
            {block.code}
          </span>

          <button
            onClick={() => onRemove(slotIndex)}
            className="text-slate-400 hover:text-slate-600 font-bold text-xs p-1"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between w-full text-slate-400 text-xs">
          <span />
          <span className="text-slate-400/60 font-medium">+ drop here</span>
        </div>
      )}
    </div>
  );
}

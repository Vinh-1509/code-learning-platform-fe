import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DraggableBlock } from '../../types/practiceTypes';

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
          ? 'bg-primary-second border-primary shadow-sm'
          : isOver
            ? 'bg-primary-second/70 border-primary-second-border border-dashed'
            : 'bg-muted/40 border-border'
      )}
    >
      <div
        className={cn(
          'size-5 rounded-full border flex items-center justify-center text-[11px] font-bold mr-3 shrink-0',
          block
            ? 'bg-primary border-primary text-primary-foreground'
            : 'border-border text-muted-foreground bg-card'
        )}
      >
        {slotIndex + 1}
      </div>

      {block ? (
        <div
          draggable
          onDragStart={() => onDragStart(block.id, slotIndex)}
          className="flex items-center justify-between flex-1 cursor-grab font-mono text-[13px] text-foreground"
        >
          <span>
            {'  '.repeat(block.indent)}
            {block.code}
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(slotIndex)}
            className="text-muted-foreground hover:text-foreground font-bold text-xs size-6 p-0 hover:bg-transparent shadow-none"
          >
            ✕
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between w-full text-muted-foreground text-xs">
          <span />
          <span className="text-muted-foreground/60 font-medium">
            + drop here
          </span>
        </div>
      )}
    </div>
  );
}

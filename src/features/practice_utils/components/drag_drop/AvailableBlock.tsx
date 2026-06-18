import { cn } from '@/lib/utils';
import type { DraggableBlock } from '../../types/practiceTypes';

interface AvailableBlockProps {
  block: DraggableBlock;
  isUsed: boolean;
  onDragStart: (id: string) => void;
  onClick?: () => void;
}

/**
 * AvailableBlock component renders a single code block item.
 * Supports HTML5 native dragging and touch click actions.
 *
 * @param {AvailableBlockProps} props - The component properties.
 * @param {DraggableBlock} props.block - The code block object data.
 * @param {boolean} props.isUsed - State flag indicating if the block has already been placed.
 * @param {Function} props.onDragStart - Callback trigger when the user starts dragging the block.
 * @param {Function} [props.onClick] - Optional tap callback to place the block in the first empty slot.
 * @returns {JSX.Element} The rendered AvailableBlock component.
 */
export function AvailableBlock({
  block,
  isUsed,
  onDragStart,
  onClick,
}: AvailableBlockProps) {
  return (
    <div
      draggable={!isUsed}
      onDragStart={() => !isUsed && onDragStart(block.id)}
      onClick={onClick}
      className={cn(
        'rounded-xl h-11 flex items-center px-4 font-mono text-[13px] border shadow-sm transition-all relative select-none shrink-0 min-w-[110px] justify-center',
        isUsed
          ? 'opacity-20 border-border bg-muted/50 cursor-not-allowed shadow-none'
          : 'border-primary/40 bg-card text-foreground cursor-pointer hover:border-primary hover:shadow'
      )}
    >
      <span>{block.code}</span>
    </div>
  );
}

import type { Block } from '@/lib/axios';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface LessonSidebarProps {
  blocks: Block[];
  lessonTitle?: string;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
}

function BlockIcon({ status }: { status: Block['status'] }) {
  if (status === 'completed')
    return (
      <div className="size-5 rounded-full flex items-center justify-center bg-bluelight text-primary-foreground text-[10px] font-bold shrink-0">
        ✓
      </div>
    );
  if (status === 'active')
    return (
      <div className="size-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold shrink-0">
        ●
      </div>
    );
  return (
    <div className="size-5 rounded-full flex items-center justify-center bg-dark-gray text-muted-foreground text-[10px] shrink-0">
      🔒
    </div>
  );
}

export function LessonSidebar({
  blocks,
  lessonTitle,
  selectedBlockId,
  onSelectBlock,
}: LessonSidebarProps) {
  return (
    <aside className="w-64 flex flex-col bg-background  overflow-y-auto">
      <div className="px-4 pt-5 pb-2">
        <p className="text-[10px] font-bold mb-2 text-muted-foreground tracking-wider">
          LESSON BLOCKS
        </p>
        <Separator />
      </div>
      <div className="flex flex-col">
        {blocks.map((block, index) => {
          const isLocked = block.status === 'locked';

          const isSelected = block._id === selectedBlockId;

          const blockTypeLabel = lessonTitle;

          return (
            <div
              key={block._id}
              onClick={() => !isLocked && onSelectBlock(block._id)}
              className={cn(
                'relative flex items-center gap-3 px-4 py-3 min-h-18 transition-colors select-none',
                isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                isSelected
                  ? 'bg-blue-50/50'
                  : !isLocked
                    ? 'hover:bg-slate-100'
                    : ''
              )}
            >
              {isSelected && (
                <div className="absolute left-0 top-0 w-0.75 h-full bg-primary" />
              )}

              <BlockIcon status={block.status} />

              <div className="flex flex-col min-w-0 flex-1 justify-center gap-0.5">
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-wider',
                    isSelected
                      ? 'text-primary'
                      : 'text-primary-second-foreground'
                  )}
                >
                  Block {index + 1}
                </span>
                <span className="text-sm font-medium text-primary-foreground truncate leading-tight">
                  {block.title || blockTypeLabel}
                </span>
                {block.description && (
                  <span className="text-xs text-muted-foreground truncate leading-tight">
                    {block.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

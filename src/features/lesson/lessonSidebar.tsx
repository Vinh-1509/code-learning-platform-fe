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
      <div className="size-5 rounded-full flex items-center justify-center bg-green-100 text-green-600 text-[10px] font-bold flex-shrink-0">
        ✓
      </div>
    );
  if (status === 'active')
    return (
      <div className="size-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
        ●
      </div>
    );
  return (
    <div className="size-5 rounded-full flex items-center justify-center bg-slate-100 text-slate-400 text-[10px] flex-shrink-0">
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
    <aside className="w-64 flex flex-col bg-slate-50 border-r border-slate-200 overflow-y-auto">
      <div className="px-4 pt-5 pb-2">
        <p className="text-[10px] font-bold mb-2 text-slate-400 tracking-wider">
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
                'relative flex items-center gap-3 px-4 py-3 min-h-[72px] transition-colors select-none',
                isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                isSelected
                  ? 'bg-blue-50/50'
                  : !isLocked
                    ? 'hover:bg-slate-100'
                    : ''
              )}
            >
              {isSelected && (
                <div className="absolute left-0 top-0 w-0.75 h-full bg-blue-600" />
              )}

              <BlockIcon status={block.status} />

              <div className="flex flex-col min-w-0 flex-1 justify-center gap-0.5">
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-wider',
                    isSelected ? 'text-blue-600' : 'text-slate-500'
                  )}
                >
                  Block {index + 1}
                </span>
                <span className="text-sm font-medium text-slate-800 truncate leading-tight">
                  {block.title || blockTypeLabel}
                </span>
                {block.description && (
                  <span className="text-xs text-slate-400 truncate leading-tight">
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

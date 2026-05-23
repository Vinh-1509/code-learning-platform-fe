import type { Block } from '@/lib/axios';
import { cn } from '@/lib/utils';

interface LessonSidebarProps {
  blocks: Block[];
  lessonTitle?: string;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
}

function BlockIcon({ status }: { status: Block['state'] }) {
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
  selectedBlockId,
  onSelectBlock,
}: LessonSidebarProps) {
  return (
    <aside className="w-64 flex flex-col bg-slate-50 border-r border-slate-200 overflow-y-auto">
      <div className="px-4 pt-5 pb-2">
        <p className="text-[10px] font-bold mb-2 text-slate-400 tracking-wider">
          LESSON BLOCKS
        </p>
        <div className="h-px bg-slate-200" />
      </div>
      <div className="flex flex-col">
        {blocks.map((block, index) => {
          const isLocked = block.state === 'locked';

          const isSelected = block._id === selectedBlockId;

          const blockTypeLabel =
            block.content[0]?.type === 'theory' ? 'Lý thuyết' : 'Bài tập Code';

          return (
            <div
              key={block._id}
              onClick={() => !isLocked && onSelectBlock(block._id)} // Không cho click nếu block bị khóa
              className={cn(
                'relative flex items-center gap-3 px-4 h-15 transition-colors select-none',
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

              <BlockIcon status={block.state} />

              <div className="flex flex-col min-w-0 flex-1">
                <span
                  className={cn(
                    'text-[10px] font-bold truncate uppercase tracking-wider',
                    isSelected ? 'text-blue-600' : 'text-slate-400'
                  )}
                >
                  {index + 1} . {blockTypeLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

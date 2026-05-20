import type { LessonBlock, LessonStatus } from './types';
import { cn } from '@/lib/utils';

function BlockIcon({ status }: { status: LessonStatus }) {
  if (status === 'completed')
    return (
      <div className="size-5 rounded-full flex items-center justify-center bg-green-100 text-green-600 text-[10px] font-bold">
        ✓
      </div>
    );
  if (status === 'active')
    return (
      <div className="size-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
        ●
      </div>
    );
  return (
    <div className="size-5 rounded-full flex items-center justify-center bg-slate-100 text-slate-400 text-[10px]">
      🔒
    </div>
  );
}

export function LessonSidebar({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-slate-50 border-r border-slate-200 overflow-y-auto">
      <div className="px-4 pt-5 pb-2">
        <p className="text-[10px] font-bold mb-2 text-slate-400 tracking-wider">
          LESSON BLOCKS
        </p>
        <div className="h-px bg-slate-200" />
      </div>
      <div className="flex flex-col">
        {blocks.map((block) => {
          const isActive = block.status === 'active';
          return (
            <div
              key={block.id}
              className={cn(
                'relative flex items-center gap-3 px-4 h-[60px] cursor-pointer transition-colors',
                isActive ? 'bg-blue-50/50' : 'hover:bg-slate-100'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 w-[3px] h-full bg-blue-600" />
              )}
              <BlockIcon status={block.status} />
              <div className="flex flex-col min-w-0">
                <span
                  className={cn(
                    'text-[10px] font-bold truncate',
                    isActive ? 'text-blue-600' : 'text-slate-400'
                  )}
                >
                  {block.tag}
                </span>
                <span
                  className={cn(
                    'text-sm truncate text-slate-900',
                    isActive ? 'font-semibold' : 'font-normal'
                  )}
                >
                  {block.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

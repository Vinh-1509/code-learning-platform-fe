import type { LessonBlock, LessonStatus } from '../types';
import { cn } from '@/lib/utils';

const LESSON_BLOCKS: LessonBlock[] = [
  {
    id: 1,
    title: 'What is a Loop?',
    subtitle: 'for, while basics',
    tag: 'Block 1',
    status: 'completed',
  },
  {
    id: 2,
    title: 'While Loop',
    subtitle: 'Syntax & condition',
    tag: 'Block 2',
    status: 'completed',
  },
  {
    id: 3,
    title: 'For Loop',
    subtitle: 'Range & iteration',
    tag: 'Block 3',
    status: 'active',
  },
  {
    id: 4,
    title: 'Nested Loops',
    subtitle: 'Loops inside loops',
    tag: 'Block 4',
    status: 'locked',
  },
  {
    id: 5,
    title: 'Loop Control',
    subtitle: 'break, continue',
    tag: 'Block 5',
    status: 'locked',
  },
];

function BlockIcon({ status }: { status: LessonStatus }) {
  if (status === 'completed') {
    return (
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-300">
        <span className="text-white text-[10px] font-bold">✓</span>
      </div>
    );
  }
  if (status === 'active') {
    return (
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-600">
        <span className="text-white text-[10px] font-bold">●</span>
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-300">
      <span className="text-white text-[9px] font-bold">🔒</span>
    </div>
  );
}

function SidebarRow({ block }: { block: LessonBlock }) {
  const isActive = block.status === 'active';
  const isLocked = block.status === 'locked';

  return (
    <div
      className={cn(
        'relative flex items-center gap-3 pl-[14px] h-[60px] cursor-pointer transition-colors',
        isActive ? 'bg-blue-50/70' : 'bg-slate-50 hover:bg-slate-100'
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-0 w-[3px] h-full rounded-r bg-blue-600" />
      )}
      <BlockIcon status={block.status} />
      <div className="flex flex-col min-w-0">
        <span
          className={cn(
            'text-[10px] font-bold leading-[14px] truncate',
            isActive
              ? 'text-blue-600'
              : isLocked
                ? 'text-slate-500'
                : 'text-slate-900'
          )}
        >
          {block.tag}
        </span>
        <span
          className={cn(
            'text-[12px] leading-[16px] truncate text-slate-900',
            isActive ? 'font-semibold' : 'font-normal'
          )}
        >
          {block.title}
        </span>
        <span className="text-[10px] leading-[14px] truncate text-slate-500">
          {block.subtitle}
        </span>
      </div>
    </div>
  );
}

export function LessonSidebar() {
  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col bg-slate-50 border-r border-slate-200 shadow-[2px_0_8px_rgba(0,0,0,0.02)] overflow-y-auto">
      <div className="px-4 pt-5 pb-2">
        <p className="text-[10px] font-bold mb-2 text-slate-500 tracking-wider">
          LESSON BLOCKS
        </p>
        <div className="h-px bg-slate-200" />
      </div>
      <div className="flex flex-col">
        {LESSON_BLOCKS.map((block) => (
          <SidebarRow key={block.id} block={block} />
        ))}
      </div>
      {/* Progress bar ở góc dưới */}
      <div className="px-4 mt-6 mb-4">
        <div className="h-1 rounded-full w-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full"
            style={{ width: '40%' }}
          />
        </div>
        <p className="text-[11px] mt-2 text-slate-500">2 of 5 completed</p>
      </div>
    </aside>
  );
}

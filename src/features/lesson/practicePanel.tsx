import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { Lightbulb } from 'lucide-react';
import type { DraggableBlock } from './types';

interface PracticePaneProps {
  availableBlocks: DraggableBlock[];
  droppedBlocks: (string | null)[];
  overSlot: number | null;
  showResult: 'correct' | 'wrong' | null;
  submitted: boolean;
  isSubmitting: boolean;
  onDragStart: (id: string, fromSlot?: number) => void;
  onDragOver: (e: React.DragEvent, slotIndex: number) => void;
  onDragLeave: () => void;
  onDrop: (slotIndex: number) => void;
  onRemove: (slotIndex: number) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export function PracticePane({
  availableBlocks,
  droppedBlocks,
  overSlot,
  showResult,
  submitted,
  isSubmitting,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemove,
  onSubmit,
  onReset,
}: PracticePaneProps) {
  const usedIds = new Set(
    droppedBlocks.filter((id): id is string => id !== null)
  );
  const allFilled = droppedBlocks.every((b) => b !== null);

  return (
    <div className="w-[480px] flex-shrink-0 flex flex-col bg-slate-50/60 p-5 overflow-y-auto border-l border-slate-200 justify-between">
      <div>
        <div className="rounded-xl p-4 bg-blue-50/80 border border-blue-100/70 text-sm text-blue-600 mb-5">
          <p className="font-bold text-[13px]">
            Task: Arrange the blocks to print numbers 0, 1, 2
          </p>
          <p className="text-xs text-blue-500/90 mt-0.5">
            Drag the code blocks into the correct order in the drop zone below.
          </p>
        </div>

        {showResult && (
          <div
            className={cn(
              'rounded-xl p-4 flex items-center justify-between border mb-4',
              showResult === 'correct'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-rose-50 border-rose-300 text-rose-800'
            )}
          >
            <span className="text-sm font-semibold">
              {showResult === 'correct'
                ? '✓ Correct Answer!'
                : '✗ Incorrect. Try again.'}
            </span>
            {showResult === 'wrong' && (
              <Button
                size="sm"
                onClick={onReset}
                className="bg-rose-200 text-rose-900 hover:bg-rose-300 h-7 text-xs rounded-lg"
              >
                Reset
              </Button>
            )}
          </div>
        )}

        <p className="text-[11px] font-bold text-slate-400 mb-2 tracking-wider uppercase">
          Available Blocks — drag to zone below
        </p>
        <div className="flex flex-row flex-wrap gap-2 mb-6">
          {availableBlocks.map((block) => {
            const isUsed = usedIds.has(block.id);
            return (
              <div
                key={block.id}
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
          })}
        </div>

        <p className="text-[11px] font-bold text-slate-400 mb-2 tracking-wider uppercase">
          Drop Zone — place blocks in correct order
        </p>
        <div className="flex flex-col gap-2.5 bg-slate-100/60 p-3 rounded-2xl border border-slate-200/60">
          {droppedBlocks.map((blockId, slotIndex) => {
            const block = blockId
              ? availableBlocks.find((b) => b.id === blockId)
              : undefined;
            const isOver = overSlot === slotIndex;

            return (
              <div
                key={slotIndex}
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
                    <span></span>
                    <span className="text-slate-400/60 font-medium">
                      + drop here
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/60 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
            <Lightbulb className="size-4 text-amber-600 fill-amber-100" />
            <span>Hints</span>
          </div>
          <button className="bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold px-3 h-7 rounded-lg transition-colors shadow-sm">
            Show Hint
          </button>
        </div>
      </div>

      <div className="pt-6">
        <p className="text-[10px] text-slate-400 text-center mb-2 font-medium">
          {!allFilled && 'Arrange all 3 blocks to enable submit.'}
        </p>
        <Button
          onClick={onSubmit}
          disabled={!allFilled || submitted || isSubmitting}
          className={cn(
            'w-full font-bold h-10 text-xs text-white rounded-xl transition-all uppercase tracking-wider',
            allFilled && !submitted && !isSubmitting
              ? 'bg-blue-600 hover:bg-blue-700 shadow-md cursor-pointer'
              : 'bg-blue-200 text-blue-400/80 cursor-not-allowed shadow-none'
          )}
        >
          {isSubmitting ? 'Verifying...' : 'Submit Answer →'}
        </Button>
      </div>
    </div>
  );
}

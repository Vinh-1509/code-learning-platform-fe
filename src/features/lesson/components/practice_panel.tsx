import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import type { DraggableBlock } from '../types';
import { cn } from '../../../lib/utils';

interface PracticePaneProps {
  availableBlocks: DraggableBlock[];
  droppedBlocks: (string | null)[];
  draggingId: string | null;
  draggingFromSlot: number | null;
  overSlot: number | null;
  showResult: 'correct' | 'wrong' | null;
  submitted: boolean;
  isSubmitting: boolean; // Thêm prop này nhận diện trạng thái Axios gửi đi
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
  draggingId,
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
  const [hintsOpen, setHintsOpen] = useState(false);
  const usedIds = new Set(droppedBlocks.filter(Boolean) as string[]);
  const allFilled = droppedBlocks.every((b) => b !== null);

  return (
    <aside className="w-[640px] flex-shrink-0 flex flex-col bg-white border-l border-slate-200 shadow-[-4px_0_20px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="flex items-center h-11 px-5 flex-shrink-0 bg-blue-50/60 border-b border-slate-100">
        <span className="text-[13px] font-bold text-blue-600">Practice</span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
        {/* Task Instruction */}
        <div className="relative rounded-lg px-4 py-3 bg-blue-50/50 border-l-4 border-blue-600 flex-shrink-0">
          <p className="text-[13px] font-bold text-blue-600">
            Task: Arrange the blocks to print numbers 0, 1, 2
          </p>
          <p className="text-[11px] text-blue-500 mt-1">
            Drag the code blocks into the correct order in the drop zone below.
          </p>
        </div>

        {/* Result Banner */}
        {showResult && (
          <div
            className={cn(
              'rounded-lg px-4 py-3 flex items-center justify-between flex-shrink-0 border',
              showResult === 'correct'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-rose-50 border-rose-300 text-rose-800'
            )}
          >
            <span className="text-[13px] font-semibold">
              {showResult === 'correct'
                ? '✓ Correct! Great job!'
                : '✗ Not quite. Check your order and try again.'}
            </span>
            {showResult === 'wrong' && (
              <Button
                size="sm"
                onClick={onReset}
                className="text-[11px] font-semibold bg-rose-200 hover:bg-rose-300 text-rose-900 h-7 rounded-md"
              >
                Reset
              </Button>
            )}
          </div>
        )}

        {/* Available Blocks */}
        <div>
          <p className="text-[10px] font-bold mb-2 text-slate-500 tracking-wide">
            AVAILABLE BLOCKS
          </p>
          <div className="grid grid-cols-3 gap-3">
            {availableBlocks.map((block) => {
              const isUsed = usedIds.has(block.id);
              const isDragging = draggingId === block.id;
              return (
                <div
                  key={block.id}
                  draggable={!isUsed}
                  onDragStart={() => !isUsed && onDragStart(block.id)}
                  className={cn(
                    'rounded-lg h-[50px] flex items-center justify-between px-3 font-mono text-[12px] select-none transition-all',
                    isUsed
                      ? 'bg-slate-50 border-1.5 border-dashed border-slate-200 opacity-40 cursor-not-allowed'
                      : isDragging
                        ? 'bg-blue-100 border-1.5 border-solid border-blue-400 opacity-50'
                        : 'bg-blue-50/80 border-1.5 border-solid border-blue-400 text-slate-900 cursor-grab active:cursor-grabbing shadow-sm hover:bg-blue-50'
                  )}
                >
                  <span>
                    {'  '.repeat(block.indent)}
                    {block.code}
                  </span>
                  {!isUsed && (
                    <span className="text-[14px] text-slate-400">⠿</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Drop Zone */}
        <div>
          <p className="text-[10px] font-bold mb-2 text-slate-500 tracking-wide">
            DROP ZONE
          </p>
          <div className="rounded-xl p-5 flex flex-col gap-3 bg-slate-50/50 border border-slate-200">
            {droppedBlocks.map((blockId, slotIndex) => {
              const block = blockId
                ? availableBlocks.find((b) => b.id === blockId)
                : undefined;
              const isOver = overSlot === slotIndex;
              const numeral = ['①', '②', '③'][slotIndex];
              return (
                <div
                  key={slotIndex}
                  onDrop={() => onDrop(slotIndex)}
                  onDragOver={(e) => onDragOver(e, slotIndex)}
                  onDragLeave={onDragLeave}
                  className={cn(
                    'w-full h-[46px] rounded-lg flex items-center px-3 border transition-all',
                    block
                      ? 'bg-blue-50/40 border-blue-500'
                      : isOver
                        ? 'bg-blue-50/70 border-dashed border-blue-500'
                        : 'bg-white border-slate-200'
                  )}
                >
                  <span
                    className={cn(
                      'text-[13px] font-bold mr-3',
                      block ? 'text-blue-600' : 'text-slate-400'
                    )}
                  >
                    {numeral}
                  </span>
                  {block ? (
                    <div
                      draggable
                      onDragStart={() => onDragStart(block.id, slotIndex)}
                      className="flex items-center justify-between flex-1 cursor-grab active:cursor-grabbing font-mono text-[12px]"
                    >
                      <span>
                        {'  '.repeat(block.indent)}
                        {block.code}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">⠿</span>
                        <button
                          onClick={() => onRemove(slotIndex)}
                          className="text-[10px] px-1.5 py-0.5 rounded text-slate-500 bg-slate-200/60 hover:bg-slate-200"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between flex-1 text-slate-400 text-[11px]">
                      <span>{isOver ? 'Release to drop' : 'Empty slot'}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                        + drop
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Hints Panel */}
        <div className="rounded-lg overflow-hidden bg-amber-50/50 border border-amber-300">
          <div className="flex items-center justify-between px-4 h-9">
            <span className="text-[13px] font-semibold text-amber-800">
              💡 Hints
            </span>
            <Button
              size="sm"
              onClick={() => setHintsOpen(!hintsOpen)}
              className="text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-white h-6 rounded-md px-3"
            >
              {hintsOpen ? 'Hide Hints' : 'Show Hint'}
            </Button>
          </div>
          {hintsOpen && (
            <div className="px-4 pb-3 flex flex-col gap-2 text-[11px] text-slate-700 leading-relaxed border-t border-amber-200 pt-2 bg-white/40">
              <p>
                <strong className="text-amber-700">Hint 1:</strong> "A loop must
                be declared before any action inside it runs."
              </p>
              <p>
                <strong className="text-amber-700">Hint 2:</strong> "Place the
                print block directly under the loop with indentation."
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Submit Action Bar */}
      <div className="flex items-center justify-between px-5 h-[52px] bg-white border-t border-slate-200 shadow-[0_-2px_8px_rgba(0,0,0,0.02)]">
        <p className="text-[11px] text-slate-400">
          {allFilled
            ? 'Ready to submit!'
            : 'Arrange all 3 blocks to enable submit.'}
        </p>
        <Button
          onClick={onSubmit}
          disabled={!allFilled || submitted || isSubmitting}
          className={cn(
            'h-8 px-5 text-[13px] font-bold text-white rounded-md transition-all min-w-[140px]',
            allFilled && !submitted && !isSubmitting
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-slate-300 cursor-not-allowed'
          )}
        >
          {isSubmitting ? 'Verifying...' : 'Submit Answer →'}
        </Button>
      </div>
    </aside>
  );
}

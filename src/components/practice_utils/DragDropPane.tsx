import type { ExplainAnswerResponse } from '@/lib/axios';

import type { DraggableBlock } from './types/practiceTypes';
import type { ExplanationStatus } from './types/asyncTypes';

import { ResultBanner } from './shared/ResultBanner';
import { HintStrip } from './shared/HintStrip';
import { SubmitBar } from './shared/SubmitBar';
import { AvailableBlock } from './components/drag_drop/AvailableBlock';
import { DropSlot } from './components/drag_drop/DropSlot';

import { getUsedIds, isAllFilled } from './utils/dragDrop.utils';

interface DragDropPaneProps {
  description: string;
  availableBlocks: DraggableBlock[];
  droppedBlocks: (string | null)[];
  overSlot: number | null;
  hints: string[];
  isHintOpen: boolean;
  showResult: 'correct' | 'wrong' | null;
  isSubmitting: boolean;
  canResubmit: boolean;
  explanation?: ExplainAnswerResponse | null;
  explanationStatus: ExplanationStatus;
  showDescription?: boolean;
  onDragStart: (id: string, fromSlot?: number) => void;
  onDragOver: (e: React.DragEvent, slotIndex: number) => void;
  onDragLeave: () => void;
  onDrop: (slotIndex: number) => void;
  onRemove: (slotIndex: number) => void;
  onSubmit: () => void;
  onToggleHint: () => void;
  onRequestHint: () => void;
  onNext?: () => void;
  onSelectBlock?: (blockId: string) => void;
}

/**
 * DragDropPane component renders the interactive drag-and-drop workspace layout.
 * Supports HTML5 draggable actions on desktop and touch tap-to-place fallback actions on mobile.
 *
 * @param {DragDropPaneProps} props - The component properties.
 * @param {string} props.description - The instructions/task description for the exercise.
 * @param {DraggableBlock[]} props.availableBlocks - Code blocks available for selection.
 * @param {(string | null)[]} props.droppedBlocks - List of block IDs dropped/placed in active slots.
 * @param {number | null} props.overSlot - Index of the slot currently hovered over during drag.
 * @param {string[]} props.hints - Array of unlocked hint strings.
 * @param {boolean} props.isHintOpen - Flag to show/hide the hint strip.
 * @param {'correct' | 'wrong' | null} props.showResult - Submission evaluation state.
 * @param {boolean} props.isSubmitting - Submission async loading state flag.
 * @param {boolean} props.canResubmit - Flag indicating if modifications allow resubmitting.
 * @param {ExplainAnswerResponse | null} [props.explanation] - AI response/explanation data.
 * @param {ExplanationStatus} props.explanationStatus - Request status of the AI feedback explanation.
 * @param {Function} props.onDragStart - Drag start trigger callback.
 * @param {Function} props.onDragOver - Drag over hover trigger callback.
 * @param {Function} props.onDragLeave - Drag exit hover trigger callback.
 * @param {Function} props.onDrop - Drop action execution callback.
 * @param {Function} props.onRemove - Slot block deletion trigger callback.
 * @param {Function} props.onSubmit - Answer submission handler.
 * @param {Function} props.onToggleHint - Toggle action for hint accordion.
 * @param {Function} props.onRequestHint - Fetch request for standard hints.
 * @param {Function} [props.onSelectBlock] - Tap selection fallback callback to drop blocks on mobile.
 * @returns {JSX.Element} The rendered DragDropPane view.
 */
export function DragDropPane({
  description,
  availableBlocks,
  droppedBlocks,
  overSlot,
  hints,
  isHintOpen,
  showResult,
  isSubmitting,
  canResubmit,
  explanation,
  explanationStatus,
  showDescription = true,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemove,
  onSubmit,
  onToggleHint,
  onRequestHint,
  onSelectBlock,
  onNext,
}: DragDropPaneProps) {
  const usedIds = getUsedIds(droppedBlocks);

  const allFilled = isAllFilled(droppedBlocks);

  return (
    <div className="h-full p-6 flex flex-col">
      <div className="flex-1">
        {/* Task Description */}
        {showDescription && description && (
          <div className="rounded-xl p-4 bg-blue-50/80 border border-blue-100/70 text-sm text-blue-600 mb-5">
            <p className="font-bold text-[13px]">
              {description ||
                'Task: Drag and drop the code blocks to form a correct solution'}
            </p>

            <div className="text-xs text-blue-500/90 mt-1 flex flex-col gap-1">
              <span>
                Read the code carefully and drag the blocks into the correct
                order in the drop zone below.
              </span>
              <span className="lg:hidden text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100/80 px-2.5 py-1 rounded-md mt-1 w-fit">
                💡 Tip: You can also tap a block to place it in the first empty
                slot!
              </span>
            </div>
          </div>
        )}

        {/* Result Banner */}
        <ResultBanner
          showResult={showResult}
          explanation={explanation}
          explanationStatus={explanationStatus}
          showDescription={showDescription}
          onNext={onNext}
        />

        {/* Available Blocks */}
        <p className="text-[11px] font-bold text-slate-400 mb-2 tracking-wider uppercase">
          Available Blocks — drag to zone below
        </p>

        <div className="flex flex-row flex-wrap gap-2 mb-6">
          {availableBlocks.map((block) => (
            <AvailableBlock
              key={block.id}
              block={block}
              isUsed={usedIds.has(block.id)}
              onDragStart={(id) => onDragStart(id)}
              onClick={() =>
                !usedIds.has(block.id) && onSelectBlock?.(block.id)
              }
            />
          ))}
        </div>

        {/* Drop Zone */}
        <p className="text-[11px] font-bold text-slate-400 mb-2 tracking-wider uppercase">
          Drop Zone — place blocks in correct order
        </p>

        <div className="flex flex-col gap-2.5 bg-slate-100/60 p-3 rounded-2xl border border-slate-200/60">
          {droppedBlocks.map((blockId, slotIndex) => {
            const block = blockId
              ? availableBlocks.find((b) => b.id === blockId)
              : undefined;

            return (
              <DropSlot
                key={slotIndex}
                slotIndex={slotIndex}
                block={block}
                isOver={overSlot === slotIndex}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDragStart={onDragStart}
                onRemove={onRemove}
              />
            );
          })}
        </div>

        {/* Hints */}
        <HintStrip
          onToggleHint={onToggleHint}
          onRequestHint={onRequestHint}
          hints={hints}
          isOpen={isHintOpen}
        />
      </div>

      {/* Submit Bar */}
      <SubmitBar
        allFilled={allFilled}
        isSubmitting={isSubmitting}
        canResubmit={canResubmit}
        onSubmit={onSubmit}
      />
    </div>
  );
}

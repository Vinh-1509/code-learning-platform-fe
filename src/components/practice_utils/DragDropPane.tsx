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
}

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

            <p className="text-xs text-blue-500/90 mt-0.5">
              Read the code carefully and drag the blocks into the correct order
              in the drop zone below.
            </p>
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

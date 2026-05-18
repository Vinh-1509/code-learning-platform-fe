import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import type { DraggableBlock } from './types';
import { LessonSidebar } from './components/lesson_sidebar';
import { TheoryPane } from './components/theory_panel';
import { PracticePane } from './components/practice_pane';

const AVAILABLE_BLOCKS: DraggableBlock[] = [
  { id: 'blk-a', code: 'for i in range(3):', indent: 0 },
  { id: 'blk-b', code: 'print(i)', indent: 1 },
  { id: 'blk-c', code: 'i = i + 1', indent: 0 },
];

export function LessonPage() {
  const [droppedBlocks, setDroppedBlocks] = useState<(string | null)[]>([
    null,
    null,
    null,
  ]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingFromSlot, setDraggingFromSlot] = useState<number | null>(null);
  const [overSlot, setOverSlot] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(
    null
  );

  function handleDragStart(id: string, fromSlot?: number) {
    setDraggingId(id);
    if (fromSlot !== undefined) {
      setDraggingFromSlot(fromSlot);
    }
  }

  function handleDragOver(e: React.DragEvent, slotIndex: number) {
    e.preventDefault();
    setOverSlot(slotIndex);
  }

  function handleDrop(slotIndex: number) {
    if (!draggingId) return;
    setDroppedBlocks((prev) => {
      const next = [...prev];
      if (draggingFromSlot === null) {
        const existingSlot = next.indexOf(draggingId);
        if (existingSlot !== -1) next[existingSlot] = null;
      } else {
        const blockAtTarget = next[slotIndex];
        if (blockAtTarget) {
          next[slotIndex] = next[draggingFromSlot];
          next[draggingFromSlot] = blockAtTarget;
        } else {
          next[slotIndex] = next[draggingFromSlot];
          next[draggingFromSlot] = null;
        }
      }
      next[slotIndex] = draggingId;
      return next;
    });
    setDraggingId(null);
    setDraggingFromSlot(null);
    setOverSlot(null);
    setShowResult(null);
  }

  function handleRemove(slotIndex: number) {
    setDroppedBlocks((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
    setShowResult(null);
  }

  function handleSubmit() {
    const answer = droppedBlocks.slice(0, 2);
    const correct = answer[0] === 'blk-a' && answer[1] === 'blk-b';
    setShowResult(correct ? 'correct' : 'wrong');
    setSubmitted(true);
  }

  function handleReset() {
    setDroppedBlocks([null, null, null]);
    setSubmitted(false);
    setShowResult(null);
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 antialiased selection:bg-blue-100">
      {/* ── Top Nav ── */}
      <header className="flex items-center justify-between px-6 h-14 bg-white border-b border-slate-200 z-10 flex-shrink-0">
        <span className="text-[22px] font-extrabold tracking-tight text-blue-600">
          CodeStep
        </span>
        <Link to="/dashboard">
          <button className="flex items-center gap-1 rounded-lg px-4 h-9 text-[14px] font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </Link>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden layout-body">
        <LessonSidebar />
        <TheoryPane />
        <PracticePane
          availableBlocks={AVAILABLE_BLOCKS}
          droppedBlocks={droppedBlocks}
          draggingId={draggingId}
          draggingFromSlot={draggingFromSlot}
          overSlot={overSlot}
          showResult={showResult}
          submitted={submitted}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragLeave={() => setOverSlot(null)}
          onDrop={handleDrop}
          onRemove={handleRemove}
          onSubmit={handleSubmit}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}

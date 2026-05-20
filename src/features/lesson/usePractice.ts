import { useState } from 'react';
import type { LessonBlock, DraggableBlock } from './types';

const mockSidebarLessons: LessonBlock[] = [
  {
    id: 1,
    tag: 'LESSON 1',
    title: 'Introduction to Loops',
    subtitle: 'Concepts',
    status: 'completed',
  },
  {
    id: 2,
    tag: 'LESSON 2',
    title: 'For Loop Basics',
    subtitle: 'Practice',
    status: 'active',
  },
  {
    id: 3,
    tag: 'LESSON 3',
    title: 'While Loop Basics',
    subtitle: 'Locked',
    status: 'locked',
  },
];

const mockAvailableBlocks: DraggableBlock[] = [
  { id: 'b1', code: 'for i in range(3):', indent: 0 },
  { id: 'b2', code: 'print(i)', indent: 1 },
  { id: 'b3', code: 'i = i + 1', indent: 1 },
];

export function usePractice() {
  const [sidebarLessons] = useState<LessonBlock[]>(mockSidebarLessons);
  const [availableBlocks] = useState<DraggableBlock[]>(mockAvailableBlocks);
  const [isLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ ĐÃ SỬA: Định nghĩa chuẩn kiểu dữ liệu mảng chứa chuỗi hoặc null (string | null)[]
  const [droppedBlocks, setDroppedBlocks] = useState<(string | null)[]>([
    null,
    null,
    null,
  ]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingFromSlot, setDraggingFromSlot] = useState<number | undefined>(
    undefined
  );
  const [overSlot, setOverSlot] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(
    null
  );

  const handleDragStart = (id: string, fromSlot?: number) => {
    setDraggingId(id);
    setDraggingFromSlot(fromSlot);
  };

  const handleDragOver = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    setOverSlot(slotIndex);
  };

  const handleDrop = (slotIndex: number) => {
    if (!draggingId) return;
    setDroppedBlocks((prev) => {
      const next = [...prev];
      if (draggingFromSlot === undefined) {
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
    setDraggingFromSlot(undefined);
    setOverSlot(null);
    setShowResult(null);
  };

  const handleRemove = (slotIndex: number) => {
    setDroppedBlocks((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
    setShowResult(null);
  };

  const handleSubmitAnswer = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const isCorrect = droppedBlocks[0] === 'b2' && droppedBlocks[1] === 'b1';
      setShowResult(isCorrect ? 'correct' : 'wrong');
      setSubmitted(true);
      setIsSubmitting(false);
    }, 600);
  };

  const handleReset = () => {
    setDroppedBlocks([null, null, null]);
    setSubmitted(false);
    setShowResult(null);
  };

  return {
    sidebarLessons,
    availableBlocks,
    isLoading,
    isSubmitting,
    droppedBlocks,
    draggingId,
    draggingFromSlot,
    overSlot,
    submitted,
    showResult,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleRemove,
    handleSubmitAnswer,
    handleReset,
    setOverSlot,
  };
}

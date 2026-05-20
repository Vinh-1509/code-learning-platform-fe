import { useState, useEffect } from 'react';
// ✅ IMPORT CHUẨN: Lấy trực tiếp các hàm API từ file axios tổng ra dùng
import {
  fetchSidebarLessons,
  fetchAvailableBlocks,
  checkAnswerAPI,
} from '../../lib/axios';
import type { LessonBlock, DraggableBlock } from './types';

export function usePractice() {
  const [sidebarLessons, setSidebarLessons] = useState<LessonBlock[]>([]);
  const [availableBlocks, setAvailableBlocks] = useState<DraggableBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Gọi các hàm API từ file axios tổng khi vừa nạp trang
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        const [lessons, blocks] = await Promise.all([
          fetchSidebarLessons(),
          fetchAvailableBlocks(),
        ]);
        setSidebarLessons(lessons);
        setAvailableBlocks(blocks);
      } catch (err) {
        console.error('Lỗi gọi API hệ thống:', err);
      } finally {
        setIsLoading(false);
      }
    }
    void loadInitialData();
  }, []);

  function handleDragStart(id: string, fromSlot?: number) {
    setDraggingId(id);
    setDraggingFromSlot(fromSlot);
  }

  function handleDragOver(e: React.DragEvent, slotIndex: number) {
    e.preventDefault();
    setOverSlot(slotIndex);
  }

  function handleDrop(slotIndex: number) {
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
  }

  function handleRemove(slotIndex: number) {
    setDroppedBlocks((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
    setShowResult(null);
  }

  async function handleSubmitAnswer() {
    try {
      setIsSubmitting(true);
      const res = await checkAnswerAPI(droppedBlocks);
      setShowResult(res.success ? 'correct' : 'wrong');
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setDroppedBlocks([null, null, null]);
    setSubmitted(false);
    setShowResult(null);
  }

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

import { useState } from 'react';
import { DragDropPane } from './dragDrop';
import { FillBlankPane } from './fillBlank';
import type {
  DragDropExercise,
  FillBlankExercise,
  PracticeExercise,
} from './types';

interface PracticePanelProps {
  exercise: PracticeExercise;
  _onSubmit?: (answer: Record<string, unknown>) => Promise<void>;
}

export function PracticePanel({ exercise }: PracticePanelProps) {
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(
    null
  );
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setShowResult('correct');
      setSubmitted(true);
      setIsSubmitting(false);
    }, 1500);
  };

  const handleReset = () => {
    setShowResult(null);
    setSubmitted(false);
  };

  if (exercise.type === 'dragdrop') {
    return (
      <DragDropPaneWrapper
        exercise={exercise}
        showResult={showResult}
        submitted={submitted}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onReset={handleReset}
      />
    );
  }

  return (
    <FillBlankPaneWrapper
      exercise={exercise}
      showResult={showResult}
      submitted={submitted}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onReset={handleReset}
    />
  );
}

function DragDropPaneWrapper({
  exercise,
  showResult,
  submitted,
  isSubmitting,
  onSubmit,
  onReset,
}: {
  exercise: DragDropExercise;
  showResult: 'correct' | 'wrong' | null;
  submitted: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  onReset: () => void;
}) {
  const [droppedBlocks, setDroppedBlocks] = useState<(string | null)[]>(
    exercise.answer || Array(exercise.blocks.length).fill(null)
  );
  const [overSlot, setOverSlot] = useState<number | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<{
    id: string;
    slot?: number;
  } | null>(null);

  const handleDragStart = (id: string, fromSlot?: number) => {
    setDraggedFrom({ id, slot: fromSlot });
  };

  const handleDragOver = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    setOverSlot(slotIndex);
  };

  const handleDragLeave = () => {
    setOverSlot(null);
  };

  const handleDrop = (slotIndex: number) => {
    if (!draggedFrom) return;

    const newDropped = [...droppedBlocks];

    // If dragging from a slot, clear that slot
    if (draggedFrom.slot !== undefined) {
      newDropped[draggedFrom.slot] = null;
    }

    newDropped[slotIndex] = draggedFrom.id;
    setDroppedBlocks(newDropped);
    setOverSlot(null);
    setDraggedFrom(null);
  };

  const handleRemove = (slotIndex: number) => {
    const newDropped = [...droppedBlocks];
    newDropped[slotIndex] = null;
    setDroppedBlocks(newDropped);
  };

  return (
    <DragDropPane
      availableBlocks={exercise.blocks}
      droppedBlocks={droppedBlocks}
      overSlot={overSlot}
      showResult={showResult}
      submitted={submitted}
      isSubmitting={isSubmitting}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onRemove={handleRemove}
      onSubmit={onSubmit}
      onReset={onReset}
    />
  );
}

function FillBlankPaneWrapper({
  exercise,
  showResult,
  submitted,
  isSubmitting,
  onSubmit,
  onReset,
}: {
  exercise: FillBlankExercise;
  showResult: 'correct' | 'wrong' | null;
  submitted: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  onReset: () => void;
}) {
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  const handleAnswerChange = (partId: string, value: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [partId]: value,
    }));
  };

  const handleReset = () => {
    setUserAnswers({});
    onReset();
  };

  return (
    <FillBlankPane
      lines={exercise.lines}
      userAnswers={userAnswers}
      showResult={showResult}
      submitted={submitted}
      isSubmitting={isSubmitting}
      onAnswerChange={handleAnswerChange}
      onSubmit={onSubmit}
      onReset={handleReset}
    />
  );
}

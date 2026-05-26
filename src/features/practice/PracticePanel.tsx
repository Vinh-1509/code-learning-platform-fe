import { useState, useEffect } from 'react';
import { DragDropPane } from './dragDrop';
import { FillBlankPane } from './fillBlank';
import type {
  DragDropExercise,
  FillBlankExercise,
  PracticeExercise,
} from './types';
import type { SubmitAnswerResponse, HintResponse } from '@/lib/axios';
import { getExerciseHistory } from '@/lib/axios';

interface PracticePanelProps {
  exercise: PracticeExercise;
  onSubmit: (
    exerciseId: string,
    answer: unknown
  ) => Promise<SubmitAnswerResponse>;
  onGetHint: (exerciseId: string, level?: number) => Promise<HintResponse>;
}

export function PracticePanel({
  exercise,
  onSubmit,
  onGetHint,
}: PracticePanelProps) {
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(
    null
  );
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [hints, setHints] = useState<string[]>([]);
  const [isHintOpen, setIsHintOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const syncHintHistory = () => {
      void (async () => {
        try {
          const historicalAttempts = await getExerciseHistory(exercise.id);

          if (!isMounted) return;

          if (historicalAttempts && historicalAttempts.length > 0) {
            const savedLevel = historicalAttempts[0].hintLevel || 0;
            if (savedLevel > 0 && exercise.hints) {
              const previouslyUnlocked: string[] = [];
              for (let i = 1; i <= savedLevel; i++) {
                const text = exercise.hints[String(i)];
                if (text) previouslyUnlocked.push(text);
              }
              setHints(previouslyUnlocked);
            }
          }
        } catch (err) {
          console.error('Failed syncing historical hint levels:', err);
        }
      })();
    };

    syncHintHistory();

    return () => {
      isMounted = false;
    };
  }, [exercise.id, exercise.hints]);

  const handleReset = () => {
    setShowResult(null);
    setSubmitted(false);
    setHints([]);
    setIsHintOpen(false);
  };

  const handleSubmit = async (answer: unknown) => {
    setIsSubmitting(true);
    try {
      const result = await onSubmit(exercise.id, answer);
      setShowResult(result.correct ? 'correct' : 'wrong');
      setSubmitted(true);
    } catch {
      setShowResult('wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleHint = () => {
    setIsHintOpen((prev) => !prev);
  };

  const handleRequestHint = () => {
    void (async () => {
      try {
        const res = await onGetHint(exercise.id);

        if (res) {
          const targetLevel = res.hintLevel;

          if (exercise.hints) {
            const incrementalHints: string[] = [];
            for (let i = 1; i <= targetLevel; i++) {
              const item = exercise.hints[String(i)];
              if (item) incrementalHints.push(item);
            }
            setHints(incrementalHints);
          } else {
            setHints((prev) => {
              if (prev.includes(res.hint)) return prev;
              return [...prev, res.hint];
            });
          }
        }
        setIsHintOpen(true);
      } catch (err) {
        console.error('Failed to request hint string updates:', err);
      }
    })();
  };

  if (exercise.type === 'dragdrop') {
    return (
      <DragDropPaneWrapper
        key={exercise.id}
        exercise={exercise}
        showResult={showResult}
        submitted={submitted}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onReset={handleReset}
        onToggleHint={handleToggleHint}
        onRequestHint={handleRequestHint}
        hints={hints}
        isHintOpen={isHintOpen}
      />
    );
  }

  return (
    <FillBlankPaneWrapper
      key={exercise.id}
      exercise={exercise}
      showResult={showResult}
      submitted={submitted}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onReset={handleReset}
      onToggleHint={handleToggleHint}
      onRequestHint={handleRequestHint}
      hints={hints}
      isHintOpen={isHintOpen}
    />
  );
}

// ============================================================================
// WRAPPERS
// ============================================================================

interface DragDropWrapperProps {
  exercise: DragDropExercise;
  showResult: 'correct' | 'wrong' | null;
  submitted: boolean;
  isSubmitting: boolean;
  onSubmit: (answer: unknown) => Promise<void>;
  onReset: () => void;
  onToggleHint: () => void;
  onRequestHint: () => void;
  hints: string[];
  isHintOpen: boolean;
}

function DragDropPaneWrapper({
  exercise,
  showResult,
  submitted,
  isSubmitting,
  onSubmit,
  onReset,
  onToggleHint,
  onRequestHint,
  hints,
  isHintOpen,
}: DragDropWrapperProps) {
  const [droppedBlocks, setDroppedBlocks] = useState<(string | null)[]>(
    exercise.answer || Array(exercise.blocks.length).fill(null)
  );

  const [prevExerciseId, setPrevExerciseId] = useState<string>(exercise.id);
  if (exercise.id !== prevExerciseId) {
    setPrevExerciseId(exercise.id);
    setDroppedBlocks(
      exercise.answer || Array(exercise.blocks.length).fill(null)
    );
  }

  const [overSlot, setOverSlot] = useState<number | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<{
    id: string;
    slot?: number;
  } | null>(null);

  return (
    <DragDropPane
      description={exercise.description}
      availableBlocks={exercise.blocks}
      droppedBlocks={droppedBlocks}
      overSlot={overSlot}
      showResult={showResult}
      submitted={submitted}
      isSubmitting={isSubmitting}
      onDragStart={(id, fromSlot) => {
        setDraggedFrom({ id, slot: fromSlot });
      }}
      onDragOver={(e, slotIndex) => {
        e.preventDefault();
        setOverSlot(slotIndex);
      }}
      onDragLeave={() => {
        setOverSlot(null);
      }}
      onDrop={(slotIndex) => {
        if (!draggedFrom) return;
        const newDropped = [...droppedBlocks];
        if (draggedFrom.slot !== undefined) {
          newDropped[draggedFrom.slot] = null;
        }
        newDropped[slotIndex] = draggedFrom.id;
        setDroppedBlocks(newDropped);
        setOverSlot(null);
        setDraggedFrom(null);
      }}
      onRemove={(slotIndex) => {
        const newDropped = [...droppedBlocks];
        newDropped[slotIndex] = null;
        setDroppedBlocks(newDropped);
      }}
      onSubmit={() => {
        void onSubmit(droppedBlocks);
      }}
      onReset={onReset}
      onToggleHint={onToggleHint}
      onRequestHint={onRequestHint}
      hints={hints}
      isHintOpen={isHintOpen}
    />
  );
}

interface FillBlankWrapperProps {
  exercise: FillBlankExercise;
  showResult: 'correct' | 'wrong' | null;
  submitted: boolean;
  isSubmitting: boolean;
  onSubmit: (answer: unknown) => Promise<void>;
  onReset: () => void;
  onToggleHint: () => void;
  onRequestHint: () => void;
  hints: string[];
  isHintOpen: boolean;
}

function FillBlankPaneWrapper({
  exercise,
  showResult,
  submitted,
  isSubmitting,
  onSubmit,
  onReset,
  onToggleHint,
  onRequestHint,
  hints,
  isHintOpen,
}: FillBlankWrapperProps) {
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  return (
    <FillBlankPane
      description={exercise.description}
      lines={exercise.lines}
      userAnswers={userAnswers}
      showResult={showResult}
      submitted={submitted}
      isSubmitting={isSubmitting}
      onAnswerChange={(partId, value) => {
        setUserAnswers((prev) => ({
          ...prev,
          [partId]: value,
        }));
      }}
      onSubmit={() => {
        void onSubmit(userAnswers);
      }}
      onReset={() => {
        setUserAnswers({});
        onReset();
      }}
      onToggleHint={onToggleHint}
      onRequestHint={onRequestHint}
      hints={hints}
      isHintOpen={isHintOpen}
    />
  );
}

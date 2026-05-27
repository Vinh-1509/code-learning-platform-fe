import { useState, useEffect } from 'react';
import { DragDropPane } from './dragDrop';
import { FillBlankPane } from './fillBlank';
import type {
  DragDropExercise,
  FillBlankExercise,
  PracticeExercise,
} from './types';
import type {
  SubmitAnswerResponse,
  HintResponse,
  ExplainAnswerResponse,
} from '@/lib/axios';
import { getExerciseHistory } from '@/lib/axios';

interface PracticePanelProps {
  exercise: PracticeExercise;
  onSubmit: (
    exerciseId: string,
    answer: unknown
  ) => Promise<SubmitAnswerResponse>;
  onGetHint: (exerciseId: string, level?: number) => Promise<HintResponse>;
  onExplain?: (
    exerciseId: string,
    answer: unknown
  ) => Promise<ExplainAnswerResponse>;
}

export function PracticePanel({
  exercise,
  onSubmit,
  onGetHint,
  onExplain,
}: PracticePanelProps) {
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(
    null
  );
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [hints, setHints] = useState<string[]>([]);
  const [isHintOpen, setIsHintOpen] = useState(false);

  // AI explanation state
  const [explanation, setExplanation] = useState<ExplainAnswerResponse | null>(
    null
  );
  const [isExplaining, setIsExplaining] = useState(false);

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
    setExplanation(null);
    setIsExplaining(false);
  };

  const handleSubmit = async (answer: unknown) => {
    setIsSubmitting(true);
    setExplanation(null);
    try {
      const result = await onSubmit(exercise.id, answer);
      const isCorrect = result.correct;
      setShowResult(isCorrect ? 'correct' : 'wrong');
      setSubmitted(true);

      // Fire AI explanation on wrong answers — non-blocking so UI updates first
      if (!isCorrect && onExplain) {
        setIsExplaining(true);
        onExplain(exercise.id, answer)
          .then((exp) => {
            setExplanation(exp);
          })
          .catch((err) => {
            console.error('Failed to fetch explanation:', err);
          })
          .finally(() => {
            setIsExplaining(false);
          });
      }
    } catch {
      setShowResult('wrong');
      setSubmitted(true);
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

  const sharedResultProps = {
    showResult,
    submitted,
    explanation,
    isExplaining,
  };

  if (exercise.type === 'dragdrop') {
    return (
      <DragDropPaneWrapper
        key={exercise.id}
        exercise={exercise}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onReset={handleReset}
        onToggleHint={handleToggleHint}
        onRequestHint={handleRequestHint}
        hints={hints}
        isHintOpen={isHintOpen}
        {...sharedResultProps}
      />
    );
  }

  return (
    <FillBlankPaneWrapper
      key={exercise.id}
      exercise={exercise}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onReset={handleReset}
      onToggleHint={handleToggleHint}
      onRequestHint={handleRequestHint}
      hints={hints}
      isHintOpen={isHintOpen}
      {...sharedResultProps}
    />
  );
}

// ============================================================================
// WRAPPERS
// ============================================================================

interface SharedResultProps {
  showResult: 'correct' | 'wrong' | null;
  submitted: boolean;
  explanation: ExplainAnswerResponse | null;
  isExplaining: boolean;
}

interface DragDropWrapperProps extends SharedResultProps {
  exercise: DragDropExercise;
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
  explanation,
  isExplaining,
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
      explanation={explanation}
      isExplaining={isExplaining}
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

interface FillBlankWrapperProps extends SharedResultProps {
  exercise: FillBlankExercise;
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
  explanation,
  isExplaining,
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
      explanation={explanation}
      isExplaining={isExplaining}
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

import { useState, useEffect, useRef } from 'react';
import { DragDropPane } from '../practice/DragDropPane';
import { FillBlankPane } from '../practice/FillBlankPane';
import type {
  DragDropExercise,
  FillBlankExercise,
  PracticeExercise,
} from '../practice/types/practiceTypes';
import type { ExplanationStatus } from '../practice/types/asyncTypes';
import type {
  SubmitAnswerResponse,
  HintResponse,
  ExplainAnswerResponse,
} from '@/lib/axios';
import { getExerciseHistory } from '@/lib/axios';
import { prepareAnswerForSubmission } from '../practice/utils/exercise.converter';

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

/**
 * PracticePanel component determines the exercise type (drag-and-drop or fill-in-the-blank)
 * and renders the corresponding component view, coordinating submission and hints tracking.
 *
 * @param {PracticePanelProps} props - The component properties.
 * @param {PracticeExercise} props.exercise - The active exercise data.
 * @param {Function} props.onSubmit - Submission verification request trigger.
 * @param {Function} props.onGetHint - Fetch hint request trigger.
 * @param {Function} [props.onExplain] - Optional request to get explanation from AI for wrong answers.
 * @returns {JSX.Element} The rendered PracticePanel wrapper view.
 */
export function PracticePanel({
  exercise,
  onSubmit,
  onGetHint,
  onExplain,
}: PracticePanelProps) {
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canResubmit, setCanResubmit] = useState(true);
  const [hints, setHints] = useState<string[]>([]);
  const [isHintOpen, setIsHintOpen] = useState(false);

  // AI explanation state
  const [explanation, setExplanation] = useState<ExplainAnswerResponse | null>(
    null
  );
  const [explanationStatus, setExplanationStatus] = useState<ExplanationStatus>(
    {
      status: 'idle',
    }
  );
  // Tracks the current explanation request so stale ones can be ignored
  const explanationRequestId = useRef(0);

  // Sync previously unlocked hints
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

                if (text) {
                  previouslyUnlocked.push(text);
                }
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

  const handleSubmit = async (answer: unknown) => {
    setIsSubmitting(true);

    // Reset explanation states ONLY when a fresh submission action explicitly begins
    setExplanation(null);
    setExplanationStatus({
      status: 'idle',
    });

    // Bump the request counter so any previous in-flight explanation callback is permanently ignored
    explanationRequestId.current += 1;
    const thisRequestId = explanationRequestId.current;

    try {
      const result = await onSubmit(exercise.id, answer);
      const isCorrect = result.correct;

      setShowResult(isCorrect ? 'correct' : 'wrong');

      if (!isCorrect) {
        // Block re-submit until the user modifies their answer
        setCanResubmit(false);

        // Generate AI explanation for wrong answers
        if (onExplain) {
          setExplanationStatus({
            status: 'loading',
          });

          onExplain(exercise.id, answer)
            .then((exp) => {
              // Discard if a newer submission sequence has already taken over
              if (thisRequestId !== explanationRequestId.current) return;

              if (!exp) {
                setExplanationStatus({ status: 'error' });
                return;
              }

              setExplanation(exp);
              setExplanationStatus({ status: 'success' });
            })
            .catch((err) => {
              if (thisRequestId !== explanationRequestId.current) return;

              console.error('Failed to fetch explanation:', err);
              setExplanationStatus({ status: 'error' });
            });
        }
      }
    } catch (err) {
      console.error('Failed submitting answer:', err);

      setShowResult('wrong');
      setCanResubmit(false);
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

              if (item) {
                incrementalHints.push(item);
              }
            }

            setHints(incrementalHints);
          } else {
            setHints((prev) => {
              if (prev.includes(res.hint)) {
                return prev;
              }

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
    canResubmit,
    explanation,
    explanationStatus,
  };

  // Called immediately when the user changes inputs or alters drop slots
  const handleAnswerModified = () => {
    // Enable the submission button again
    setCanResubmit(true);

    // Crucial: DO NOT clear 'showResult', or 'explanation' states here.
    // This allows the ResultBanner and AI panel to remain mounted and visible while typing.
  };

  if (exercise.type === 'dragdrop') {
    return (
      <DragDropPaneWrapper
        key={exercise.id}
        exercise={exercise}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onAnswerModified={handleAnswerModified}
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
      onAnswerModified={handleAnswerModified}
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
  canResubmit: boolean;
  explanation: ExplainAnswerResponse | null;
  explanationStatus: ExplanationStatus;
}

interface DragDropWrapperProps extends SharedResultProps {
  exercise: DragDropExercise;
  isSubmitting: boolean;
  onSubmit: (answer: unknown) => Promise<void>;
  onAnswerModified: () => void;
  onToggleHint: () => void;
  onRequestHint: () => void;
  hints: string[];
  isHintOpen: boolean;
}

function DragDropPaneWrapper({
  exercise,
  showResult,
  canResubmit,
  isSubmitting,
  explanation,
  explanationStatus,
  onSubmit,
  onAnswerModified,
  onToggleHint,
  onRequestHint,
  hints,
  isHintOpen,
}: DragDropWrapperProps) {
  const initialSlots = exercise.answer?.length || exercise.expectedSlots;

  const [droppedBlocks, setDroppedBlocks] = useState<(string | null)[]>(
    exercise.answer || Array(initialSlots).fill(null)
  );
  const [prevExerciseId, setPrevExerciseId] = useState<string>(exercise.id);

  if (exercise.id !== prevExerciseId) {
    setPrevExerciseId(exercise.id);
    setDroppedBlocks(exercise.answer || Array(initialSlots).fill(null));
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
      isSubmitting={isSubmitting}
      canResubmit={canResubmit}
      onSubmit={() => {
        const formatted = prepareAnswerForSubmission('dragdrop', droppedBlocks);
        void onSubmit(formatted);
      }}
      explanation={explanation}
      explanationStatus={explanationStatus}
      onDragStart={(id, fromSlot) => {
        setDraggedFrom({
          id,
          slot: fromSlot,
        });
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
        onAnswerModified();
      }}
      onRemove={(slotIndex) => {
        const newDropped = [...droppedBlocks];

        newDropped[slotIndex] = null;

        setDroppedBlocks(newDropped);
        onAnswerModified();
      }}
      onSelectBlock={(blockId) => {
        const firstEmptyIndex = droppedBlocks.findIndex((b) => b === null);
        if (firstEmptyIndex !== -1) {
          const newDropped = [...droppedBlocks];
          newDropped[firstEmptyIndex] = blockId;
          setDroppedBlocks(newDropped);
          onAnswerModified();
        }
      }}
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
  onAnswerModified: () => void;
  onToggleHint: () => void;
  onRequestHint: () => void;
  hints: string[];
  isHintOpen: boolean;
}

function FillBlankPaneWrapper({
  exercise,
  showResult,
  canResubmit,
  isSubmitting,
  explanation,
  explanationStatus,
  onSubmit,
  onAnswerModified,
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
      isSubmitting={isSubmitting}
      canResubmit={canResubmit}
      onSubmit={() => {
        const formatted = prepareAnswerForSubmission('fillblank', userAnswers);
        void onSubmit(formatted);
      }}
      explanation={explanation}
      explanationStatus={explanationStatus}
      onAnswerChange={(partId, value) => {
        setUserAnswers((prev) => ({
          ...prev,
          [partId]: value,
        }));
        onAnswerModified();
      }}
      onToggleHint={onToggleHint}
      onRequestHint={onRequestHint}
      hints={hints}
      isHintOpen={isHintOpen}
    />
  );
}

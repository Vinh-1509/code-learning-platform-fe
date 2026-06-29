import { useState, useRef, useMemo, useEffect } from 'react';
import { useQueries } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { fetchExerciseById } from '@/features/lesson/api/exercise.api';
import {
  useSubmitAnswer,
  useGetHint,
  useExplainAnswer,
} from './useExerciseMutations';

import { convertExerciseResponse } from '@/components/practice_utils/utils/exercise.converter';

import type { PracticeExercise } from '@/components/practice_utils/types/practiceTypes';
import type { Block } from '@/types/api/learning.types';
import type { SubmitAnswerResponse } from '@/types/api/exercise.types';

interface UseBlockExercisesOptions {
  block: Block | undefined;
}

function deriveExerciseMeta(block: Block | undefined) {
  if (!block) {
    return {
      exerciseIds: [] as string[],
      requiredIds: new Set<string>(),
      immediatelyComplete: false,
    };
  }

  const practiceItems = block.content
    .filter((item) => item.type === 'practice')
    .sort((a, b) => {
      const orderA = typeof a.data.order === 'number' ? a.data.order : 0;
      const orderB = typeof b.data.order === 'number' ? b.data.order : 0;
      return orderA - orderB;
    });

  if (practiceItems.length === 0) {
    return {
      exerciseIds: [] as string[],
      requiredIds: new Set<string>(),
      immediatelyComplete: true,
    };
  }

  const exerciseIds = practiceItems
    .map((item) => item.data.exerciseId as string)
    .filter(Boolean);

  if (exerciseIds.length === 0) {
    return {
      exerciseIds: [] as string[],
      requiredIds: new Set<string>(),
      immediatelyComplete: true,
    };
  }

  const requiredIds = new Set(
    practiceItems
      .filter((item) => item.data.required !== false)
      .map((item) => item.data.exerciseId as string)
      .filter(Boolean)
  );

  return {
    exerciseIds,
    requiredIds,
    immediatelyComplete: requiredIds.size === 0,
  };
}

export function useBlockExercises({ block }: UseBlockExercisesOptions) {
  const blockId = block?._id;

  const { exerciseIds, requiredIds, immediatelyComplete } = useMemo(
    () => deriveExerciseMeta(block),
    [block]
  );

  const requiredIdsRef = useRef<Set<string>>(requiredIds);
  useEffect(() => {
    requiredIdsRef.current = requiredIds;
  }, [requiredIds]);

  const [prevBlockId, setPrevBlockId] = useState<string | undefined>(blockId);
  const [exercisePassMap, setExercisePassMap] = useState<
    Record<string, boolean>
  >({});
  const [blockCompleted, setBlockCompleted] = useState(immediatelyComplete);

  if (prevBlockId !== blockId) {
    setPrevBlockId(blockId);
    setExercisePassMap({});
    setBlockCompleted(immediatelyComplete);
  }

  const exerciseResults = useQueries({
    queries: exerciseIds.map((id) => ({
      queryKey: queryKeys.exercises.detail(id),
      queryFn: () => fetchExerciseById(id),
      staleTime: Infinity,
      gcTime: 30 * 60_000,
    })),
    combine: (results) => ({
      exercises: results
        .map((r) => (r.data ? convertExerciseResponse(r.data) : undefined))
        .filter((ex): ex is PracticeExercise => ex !== undefined),
      loading: results.some((r) => r.isLoading),
      error:
        results.find((r) => r.isError)?.error instanceof Error
          ? results.find((r) => r.isError)!.error.message
          : results.some((r) => r.isError)
            ? 'Failed to fetch exercises'
            : null,
    }),
  });

  const { exercises, loading, error } = exerciseResults;

  // ── Success callback proxy to maintain local tracking maps ────────────────
  const handleSubmissionSuccess = (
    exerciseId: string,
    result: SubmitAnswerResponse
  ) => {
    if (result.correct) {
      setExercisePassMap((prev) => {
        const next = { ...prev, [exerciseId]: true };
        const allRequiredPassed =
          requiredIdsRef.current.size === 0 ||
          [...requiredIdsRef.current].every((id) => next[id]);

        if (allRequiredPassed) {
          setBlockCompleted(true);
        }
        return next;
      });
    }
  };

  // ── Instantiating TanStack Mutations ───────────────────────────────────────
  const submitMutation = useSubmitAnswer(handleSubmissionSuccess);
  const hintMutation = useGetHint();
  const explainMutation = useExplainAnswer();

  // ── Strongly-typed adaptations matching original method interface structures
  const submitAnswer = async (exerciseId: string, answer: unknown) => {
    return submitMutation.mutateAsync({ exerciseId, answer });
  };

  const getHint = async (exerciseId: string, level?: number) => {
    return hintMutation.mutateAsync({ exerciseId, level });
  };

  const explainAnswer = async (exerciseId: string, answer: unknown) => {
    return explainMutation.mutateAsync({ exerciseId, answer });
  };

  return {
    exercises,
    loading,
    error,
    exercisePassMap,
    blockCompleted,
    submitAnswer,
    getHint,
    explainAnswer,
    // Optional: expose mutation pending flags to the UI if needed later
    isSubmitting: submitMutation.isPending,
    isGettingHint: hintMutation.isPending,
    isExplaining: explainMutation.isPending,
  };
}

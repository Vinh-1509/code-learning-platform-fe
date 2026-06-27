import { useState, useRef, useMemo, useEffect } from 'react';
import { useQueries } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import {
  fetchExerciseById,
  submitExerciseAnswer,
  getExerciseHint,
  explainExerciseAnswer,
} from '@/features/lesson/api/exercise.api';

import { convertExerciseResponse } from '@/components/practice_utils/utils/exercise.converter';

import type { PracticeExercise } from '@/components/practice_utils/types/practiceTypes';
import type {
  SubmitAnswerResponse,
  HintResponse,
  ExplainAnswerResponse,
} from '@/types/api/exercise.types';
import type { Block } from '@/types/api/learning.types';

interface UseBlockExercisesOptions {
  block: Block | undefined;
}

// ---------------------------------------------------------------------------
// Helper: extract exercise IDs + required ID set from a block synchronously.
// ---------------------------------------------------------------------------
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

  // No practice content at all → Feynman gate immediately open
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

  // Practice items exist but none carry an exerciseId → treat as no gate
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

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useBlockExercises({ block }: UseBlockExercisesOptions) {
  const blockId = block?._id;

  // ── Derive exercise IDs + required set synchronously ──────────────────────
  const { exerciseIds, requiredIds, immediatelyComplete } = useMemo(
    () => deriveExerciseMeta(block),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [blockId]
  );

  // ── Keep requiredIds accessible in submitAnswer without re-creating it ─────
  const requiredIdsRef = useRef<Set<string>>(requiredIds);
  useEffect(() => {
    requiredIdsRef.current = requiredIds;
  }, [requiredIds]);

  // ── Local pass-tracking state ──────────────────────────────────────────────
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

  // ── Parallel exercise fetches via useQueries ───────────────────────────────
  const exerciseResults = useQueries({
    queries: exerciseIds.map((id) => ({
      queryKey: queryKeys.exercises.detail(id),
      queryFn: () => fetchExerciseById(id),
      staleTime: Infinity, // Exercise definitions never change mid-session
      gcTime: 30 * 60_000, // Keep in cache 30 min so revisiting a block is instant
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

  // ── Submission (pass-tracking stays local) ────────────────────────────────
  async function submitAnswer(
    exerciseId: string,
    answer: unknown
  ): Promise<SubmitAnswerResponse> {
    const result = await submitExerciseAnswer(exerciseId, answer);

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

    return result;
  }

  async function getHint(
    exerciseId: string,
    level?: number
  ): Promise<HintResponse> {
    return getExerciseHint(exerciseId, level);
  }

  async function explainAnswer(
    exerciseId: string,
    answer: unknown
  ): Promise<ExplainAnswerResponse> {
    return explainExerciseAnswer(exerciseId, answer);
  }

  return {
    exercises,
    loading,
    error,
    exercisePassMap,
    blockCompleted,
    submitAnswer,
    getHint,
    explainAnswer,
  };
}

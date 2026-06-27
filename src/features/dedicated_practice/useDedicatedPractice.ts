import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

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
  ExerciseResponse,
  SubmitAnswerResponse,
  HintResponse,
  ExplainAnswerResponse,
} from '@/types/api/exercise.types';

/**
 * useDedicatedPractice resolves single-challenge interactions
 * (loading, submission, hints, AI explanation) for the dedicated practice page.
 */
export function useDedicatedPractice(exerciseId: string) {
  // ── Fetch raw exercise definition ─────────────────────────────────────────
  // Shares the same cache entry as useBlockExercises so navigating from a
  // lesson block to the same exercise in the Practice library is instant.
  const {
    data: rawResponse,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: queryKeys.exercises.detail(exerciseId),
    queryFn: () => fetchExerciseById(exerciseId),
    staleTime: Infinity, // Exercise definitions never change mid-session
    gcTime: 30 * 60_000, // Keep in cache 30 min across page navigations
    enabled: Boolean(exerciseId),
  });

  // ── Derive converted exercise from raw data ───────────────────────────────
  // Memoized so the PracticePanel reference stays stable between renders
  // and doesn't trigger unnecessary child re-renders.
  const exercise = useMemo<PracticeExercise | null>(
    () => (rawResponse ? convertExerciseResponse(rawResponse) : null),
    [rawResponse]
  );

  // Normalise the query error into the string shape callers expect.
  const error =
    queryError instanceof Error
      ? queryError.message
      : queryError
        ? 'Failed to load exercise'
        : null;

  // ── lastSubmitCorrect — local UI state ────────────────────────────────────
  // Tracks whether the most recent submission was correct so the parent can
  // show the "Next Exercise" button. Resets when the user navigates to a
  // different exercise using the same render-time pattern as DragDropPaneWrapper.
  const [prevExerciseId, setPrevExerciseId] = useState(exerciseId);
  const [lastSubmitCorrect, setLastSubmitCorrect] = useState(false);

  if (prevExerciseId !== exerciseId) {
    setPrevExerciseId(exerciseId);
    setLastSubmitCorrect(false);
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  const submitAnswer = async (
    id: string,
    answer: unknown
  ): Promise<SubmitAnswerResponse> => {
    const res = await submitExerciseAnswer(id, answer);
    setLastSubmitCorrect(Boolean(res.correct));
    return res;
  };

  const getHint = (id: string, level?: number): Promise<HintResponse> =>
    getExerciseHint(id, level);

  const explainAnswer = (
    id: string,
    answer: unknown
  ): Promise<ExplainAnswerResponse> => explainExerciseAnswer(id, answer);

  return {
    exercise,
    rawResponse: (rawResponse as ExerciseResponse) ?? null,
    loading,
    error,
    lastSubmitCorrect,
    submitAnswer,
    getHint,
    explainAnswer,
  };
}

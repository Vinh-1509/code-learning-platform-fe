import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import {
  fetchExerciseById,
  getExerciseHint,
  explainExerciseAnswer,
} from '@/features/lesson/api/exercise.api';
import { useSubmitAnswer } from '@/features/lesson/hooks/useExerciseMutations';

import { convertExerciseResponse } from '@/components/practice_utils/utils/exercise.converter';

import type { PracticeExercise } from '@/components/practice_utils/types/practiceTypes';
import type {
  ExerciseResponse,
  HintResponse,
  ExplainAnswerResponse,
} from '@/types/api/exercise.types';

export function useDedicatedPractice(exerciseId: string) {
  const {
    data: rawResponse,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: queryKeys.exercises.detail(exerciseId),
    queryFn: () => fetchExerciseById(exerciseId),
    staleTime: Infinity,
    gcTime: 30 * 60_000,
    enabled: Boolean(exerciseId),
  });

  const exercise = useMemo<PracticeExercise | null>(
    () => (rawResponse ? convertExerciseResponse(rawResponse) : null),
    [rawResponse]
  );

  const error =
    queryError instanceof Error
      ? queryError.message
      : queryError
        ? 'Failed to load exercise'
        : null;

  const [prevExerciseId, setPrevExerciseId] = useState(exerciseId);
  const [lastSubmitCorrect, setLastSubmitCorrect] = useState(false);

  if (prevExerciseId !== exerciseId) {
    setPrevExerciseId(exerciseId);
    setLastSubmitCorrect(false);
  }

  // ── Reuse the same mutation as the lesson flow ────────────────────────────
  // Guarantees identical cache invalidation (history, weakness tags, dashboard)
  // regardless of whether the user submits from a lesson block or this page.
  const submitMutation = useSubmitAnswer((_exerciseId, result) => {
    setLastSubmitCorrect(Boolean(result.correct));
  });

  const submitAnswer = (id: string, answer: unknown) =>
    submitMutation.mutateAsync({ exerciseId: id, answer });

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
    isSubmitting: submitMutation.isPending,
  };
}

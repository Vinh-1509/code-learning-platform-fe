import { useEffect, useState } from 'react';
import {
  explainExerciseAnswer,
  fetchExerciseById,
  getExerciseHint,
  submitExerciseAnswer,
} from '@/features/lesson/api/exercise.api';
import type { ExerciseResponse } from '@/types/api/exercise.types';
import { convertExerciseResponse } from '@/components/practice_utils/utils/exercise.converter';
import type { PracticeExercise } from '@/components/practice_utils/types/practiceTypes';

/**
 * useDedicatedPractice resolves single-challenge interactions (loading, code submission, hints, metrics)
 */
export function useDedicatedPractice(exerciseId: string) {
  const [exercise, setExercise] = useState<PracticeExercise | null>(null);
  const [rawResponse, setRawResponse] = useState<ExerciseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSubmitCorrect, setLastSubmitCorrect] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function loadExercise() {
      setLoading(true);
      setError(null);
      setLastSubmitCorrect(false);

      try {
        const response = await fetchExerciseById(exerciseId);
        if (!isMounted) return;

        setRawResponse(response);
        setExercise(convertExerciseResponse(response));
      } catch (err) {
        if (!isMounted) return;
        setError(
          err instanceof Error ? err.message : 'Failed to load exercise'
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void loadExercise();

    return () => {
      isMounted = false;
    };
  }, [exerciseId]);

  // Transmit answer block payloads payload evaluating user verification state
  const submitAnswer = async (id: string, answer: unknown) => {
    const res = await submitExerciseAnswer(id, answer);
    setLastSubmitCorrect(Boolean(res.correct));
    return res;
  };

  const getHint = (id: string, level?: number) => getExerciseHint(id, level);

  const explainAnswer = (id: string, answer: unknown) =>
    explainExerciseAnswer(id, answer);

  return {
    exercise,
    rawResponse,
    loading,
    error,
    lastSubmitCorrect,
    submitAnswer,
    getHint,
    explainAnswer,
  };
}

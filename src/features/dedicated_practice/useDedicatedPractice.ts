import { useEffect, useState } from 'react';

import {
  explainExerciseAnswer,
  fetchExerciseById,
  getExerciseHint,
  submitExerciseAnswer,
} from '@/lib/axios';
import { convertExerciseResponse } from '@/features/practice_utils/utils/exercise.converter';
import type { PracticeExercise } from '@/features/practice_utils/types/practiceTypes';

// Hook cho trang /practicededicated/:exerciseId — load 1 bài + submit/hint/explain
export function useDedicatedPractice(exerciseId: string) {
  const [exercise, setExercise] = useState<PracticeExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadExercise() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchExerciseById(exerciseId);
        if (!isMounted) return;

        setExercise(convertExerciseResponse(response));
      } catch (err) {
        if (!isMounted) return;
        setError(
          err instanceof Error ? err.message : 'Failed to load exercise'
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadExercise();

    return () => {
      isMounted = false;
    };
  }, [exerciseId]);

  const submitAnswer = (id: string, answer: unknown) =>
    submitExerciseAnswer(id, answer);

  const getHint = (id: string, level?: number) => getExerciseHint(id, level);

  const explainAnswer = (id: string, answer: unknown) =>
    explainExerciseAnswer(id, answer);

  return { exercise, loading, error, submitAnswer, getHint, explainAnswer };
}

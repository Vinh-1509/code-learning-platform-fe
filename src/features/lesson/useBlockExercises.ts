import { useState, useEffect } from 'react';
import {
  fetchExerciseById,
  submitExerciseAnswer,
  getExerciseHint,
} from '@/lib/axios';
import { convertExerciseResponse } from '@/features/practice/types';
import type { PracticeExercise } from '@/features/practice/types';
import type { SubmitAnswerResponse, HintResponse, Block } from '@/lib/axios';

interface UseBlockExercisesOptions {
  block: Block | undefined;
}

export function useBlockExercises({ block }: UseBlockExercisesOptions) {
  const [exercises, setExercises] = useState<PracticeExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getExercises() {
      if (!block) {
        setExercises([]);
        return;
      }

      const practiceItems = block.content.filter(
        (item) => item.type === 'practice'
      );

      if (practiceItems.length === 0) {
        setExercises([]);
        return;
      }

      // Sort practice items by order if it exists
      practiceItems.sort((a, b) => {
        const orderA = typeof a.data.order === 'number' ? a.data.order : 0;
        const orderB = typeof b.data.order === 'number' ? b.data.order : 0;
        return orderA - orderB;
      });

      const exerciseIds = practiceItems
        .map((item) => item.data.exerciseId as string)
        .filter(Boolean);

      if (exerciseIds.length === 0) {
        setExercises([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const apiExercises = await Promise.all(
          exerciseIds.map((id) => fetchExerciseById(id))
        );
        const convertedExercises = apiExercises.map(convertExerciseResponse);
        setExercises(convertedExercises);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch exercises'
        );
        setExercises([]);
      } finally {
        setLoading(false);
      }
    }

    void getExercises();
  }, [block]);

  async function submitAnswer(
    exerciseId: string,
    answer: unknown
  ): Promise<SubmitAnswerResponse> {
    return await submitExerciseAnswer(exerciseId, answer);
  }

  async function getHint(exerciseId: string): Promise<HintResponse> {
    return await getExerciseHint(exerciseId);
  }

  return {
    exercises,
    loading,
    error,
    submitAnswer,
    getHint,
  };
}

import { useState, useEffect, useRef } from 'react';
import {
  fetchExerciseById,
  submitExerciseAnswer,
  getExerciseHint,
  explainExerciseAnswer,
  completeBlock,
} from '@/lib/axios';
import { convertExerciseResponse } from '@/features/practice/types';
import type { PracticeExercise } from '@/features/practice/types';
import type {
  SubmitAnswerResponse,
  HintResponse,
  Block,
  ExplainAnswerResponse,
} from '@/lib/axios';

interface UseBlockExercisesOptions {
  block: Block | undefined;
}

export function useBlockExercises({ block }: UseBlockExercisesOptions) {
  const [exercises, setExercises] = useState<PracticeExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exercisePassMap, setExercisePassMap] = useState<
    Record<string, boolean>
  >({});
  const [blockCompleted, setBlockCompleted] = useState(false);
  const exercisesRef = useRef<PracticeExercise[]>(exercises);

  const blockId = block?._id;

  useEffect(() => {
    async function getExercises() {
      if (!block) {
        setExercises([]);
        exercisesRef.current = [];
        return;
      }

      const practiceItems = block.content.filter(
        (item) => item.type === 'practice'
      );

      if (practiceItems.length === 0) {
        setExercises([]);
        exercisesRef.current = [];
        return;
      }

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
        exercisesRef.current = [];
        return;
      }

      setLoading(true);
      setError(null);
      // Reset pass tracking when block changes
      setExercisePassMap({});
      setBlockCompleted(false);
      try {
        const apiExercises = await Promise.all(
          exerciseIds.map((id) => fetchExerciseById(id))
        );
        const convertedExercises = apiExercises.map(convertExerciseResponse);
        setExercises(convertedExercises);
        exercisesRef.current = convertedExercises;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch exercises'
        );
        setExercises([]);
        exercisesRef.current = [];
      } finally {
        setLoading(false);
      }
    }

    void getExercises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockId]); // blockId is a stable string — won't cause reference churn

  async function submitAnswer(
    exerciseId: string,
    answer: unknown
  ): Promise<SubmitAnswerResponse> {
    const result = await submitExerciseAnswer(exerciseId, answer);

    if (result.correct) {
      setExercisePassMap((prev) => {
        const next = { ...prev, [exerciseId]: true };

        // Check if every exercise in the current block is now passed
        const allPassed = exercisesRef.current.every((ex) => next[ex.id]);
        if (allPassed && block && !blockCompleted) {
          setBlockCompleted(true);
          void completeBlock(block._id).catch((err) => {
            console.error('Failed to mark block as complete:', err);
          });
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
    return await getExerciseHint(exerciseId, level);
  }

  async function explainAnswer(
    exerciseId: string,
    answer: unknown
  ): Promise<ExplainAnswerResponse> {
    return await explainExerciseAnswer(exerciseId, answer);
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

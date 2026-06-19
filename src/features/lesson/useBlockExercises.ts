import { useState, useEffect, useRef } from 'react';
import {
  fetchExerciseById,
  submitExerciseAnswer,
  getExerciseHint,
  explainExerciseAnswer,
} from '@/lib/axios';
import { convertExerciseResponse } from '@/components/practice_utils/utils/exercise.converter';
import type { PracticeExercise } from '@/components/practice_utils/types/practiceTypes';
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

  // Tracks required exercise IDs for the current block.
  // Stored in a ref so the submitAnswer closure always reads the current value
  // without needing to be recreated on every render.
  const requiredIdsRef = useRef<Set<string>>(new Set());

  const blockId = block?._id;

  useEffect(() => {
    async function getExercises() {
      // No block selected — clear everything
      if (!block) {
        setExercises([]);
        setExercisePassMap({});
        setBlockCompleted(false);
        requiredIdsRef.current = new Set();
        return;
      }

      const practiceItems = block.content.filter(
        (item) => item.type === 'practice'
      );

      // Block has no practice content at all — Feynman gate is immediately open
      if (practiceItems.length === 0) {
        setExercises([]);
        setExercisePassMap({});
        setBlockCompleted(true);
        requiredIdsRef.current = new Set();
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

      // Practice content items exist but none have exerciseIds — treat as no gate
      if (exerciseIds.length === 0) {
        setExercises([]);
        setExercisePassMap({});
        setBlockCompleted(true);
        requiredIdsRef.current = new Set();
        return;
      }

      // Compute which exercise IDs are required (data.required defaults to true).
      const requiredIds = new Set(
        practiceItems
          .filter((item) => item.data.required !== false)
          .map((item) => item.data.exerciseId as string)
          .filter(Boolean)
      );
      requiredIdsRef.current = requiredIds;

      // Reset pass tracking for the incoming block.
      // If no exercises are marked required, the gate is already open.
      setExercisePassMap({});
      setBlockCompleted(requiredIds.size === 0);

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

        // Check if every required exercise is now passed.
        // An empty required set means the gate was already open (handled at load time),
        // but guard here too for safety.
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

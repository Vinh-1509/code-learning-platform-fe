import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
  submitExerciseAnswer,
  getExerciseHint,
  explainExerciseAnswer,
} from '../api/exercise.api';
import type {
  SubmitAnswerResponse,
  HintResponse,
  ExplainAnswerResponse,
} from '@/types/api/exercise.types';

interface SubmitPayload {
  exerciseId: string;
  answer: unknown;
}

interface HintPayload {
  exerciseId: string;
  level?: number;
}

// useExerciseMutations.ts
export function useSubmitAnswer(
  onSuccessCallback: (exerciseId: string, result: SubmitAnswerResponse) => void
) {
  const queryClient = useQueryClient();

  return useMutation<SubmitAnswerResponse, Error, SubmitPayload>({
    mutationFn: ({ exerciseId, answer }) =>
      submitExerciseAnswer(exerciseId, answer),
    onSuccess: (data, variables) => {
      const { exerciseId } = variables;

      // Always: attempt history and weakness failure rates are stale after any submission
      void queryClient.invalidateQueries({
        queryKey: queryKeys.exercises.history(exerciseId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tags.weakness(),
      });

      // Only on correct: dashboard stats (lessons learned, problems solved) change
      if (data.correct) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard.all,
        });
        void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      }

      onSuccessCallback(exerciseId, data);
    },
  });
}

export function useGetHint() {
  return useMutation<HintResponse, Error, HintPayload>({
    mutationFn: ({ exerciseId, level }) => getExerciseHint(exerciseId, level),
  });
}

export function useExplainAnswer() {
  return useMutation<ExplainAnswerResponse, Error, SubmitPayload>({
    mutationFn: ({ exerciseId, answer }) =>
      explainExerciseAnswer(exerciseId, answer),
  });
}

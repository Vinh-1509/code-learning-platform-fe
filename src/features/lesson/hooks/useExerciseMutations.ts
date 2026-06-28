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

export function useSubmitAnswer(
  onSuccessCallback: (exerciseId: string, result: SubmitAnswerResponse) => void
) {
  const queryClient = useQueryClient();

  return useMutation<SubmitAnswerResponse, Error, SubmitPayload>({
    mutationFn: ({ exerciseId, answer }) =>
      submitExerciseAnswer(exerciseId, answer),
    onSuccess: (data, variables) => {
      // Invalidate dashboard or milestones if a submission might alter high-level progress tracking
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      onSuccessCallback(variables.exerciseId, data);
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

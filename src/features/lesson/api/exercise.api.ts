import { api } from '@/lib/axios';
import type {
  ExerciseResponse,
  SubmitAnswerResponse,
  HintResponse,
  ExerciseAttemptResponse,
  ExplainAnswerResponse,
} from '@/types/api/exercise.types';

export async function fetchExerciseById(
  exerciseId: string
): Promise<ExerciseResponse> {
  const { data } = await api.get<ExerciseResponse>(
    `/api/practice/exercises/${exerciseId}`
  );
  return data;
}

export async function submitExerciseAnswer(
  exerciseId: string,
  answer: unknown
): Promise<SubmitAnswerResponse> {
  const { data } = await api.post<SubmitAnswerResponse>(
    `/api/practice/exercises/${exerciseId}/submit`,
    { answer }
  );
  return data;
}

export async function getExerciseHint(
  exerciseId: string,
  level?: number
): Promise<HintResponse> {
  const { data } = await api.post<HintResponse>(
    `/api/practice/exercises/${exerciseId}/hint`,
    { level }
  );
  return data;
}

export async function getExerciseHistory(
  exerciseId: string
): Promise<ExerciseAttemptResponse[]> {
  const { data } = await api.get<ExerciseAttemptResponse[]>(
    `/api/practice/exercises/${exerciseId}/history`
  );
  return data;
}

export async function explainExerciseAnswer(
  exerciseId: string,
  answer: unknown
): Promise<ExplainAnswerResponse> {
  const { data } = await api.post<ExplainAnswerResponse>(
    `/api/exercises/${exerciseId}/explain`,
    { answer }
  );
  return data;
}

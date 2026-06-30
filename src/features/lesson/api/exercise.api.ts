import { api } from '@/lib/axios';
import { z } from 'zod';
import {
  ExerciseResponseSchema,
  SubmitAnswerResponseSchema,
  HintResponseSchema,
  ExerciseAttemptResponseSchema,
  ExplainAnswerResponseSchema,
  type ExerciseResponse,
  type SubmitAnswerResponse,
  type HintResponse,
  type ExerciseAttemptResponse,
  type ExplainAnswerResponse,
} from '../lesson.schema';

export async function fetchExerciseById(
  exerciseId: string
): Promise<ExerciseResponse> {
  const { data } = await api.get<unknown>(
    `/api/practice/exercises/${exerciseId}`
  );
  return ExerciseResponseSchema.parse(data);
}

export async function submitExerciseAnswer(
  exerciseId: string,
  answer: unknown
): Promise<SubmitAnswerResponse> {
  const { data } = await api.post<unknown>(
    `/api/practice/exercises/${exerciseId}/submit`,
    { answer }
  );
  return SubmitAnswerResponseSchema.parse(data);
}

export async function getExerciseHint(
  exerciseId: string,
  level?: number
): Promise<HintResponse> {
  const { data } = await api.post<unknown>(
    `/api/practice/exercises/${exerciseId}/hint`,
    { level }
  );
  return HintResponseSchema.parse(data);
}

export async function getExerciseHistory(
  exerciseId: string
): Promise<ExerciseAttemptResponse[]> {
  const { data } = await api.get<unknown>(
    `/api/practice/exercises/${exerciseId}/history`
  );
  return z.array(ExerciseAttemptResponseSchema).parse(data);
}

export async function explainExerciseAnswer(
  exerciseId: string,
  answer: unknown
): Promise<ExplainAnswerResponse> {
  const { data } = await api.post<unknown>(
    `/api/exercises/${exerciseId}/explain`,
    { answer }
  );
  return ExplainAnswerResponseSchema.parse(data);
}

import { api } from '@/lib/axios';
import type { FetchExercisesParams } from '@/types/api/exercise.types';
import {
  ExercisePageResponseSchema,
  WeaknessTagResponseSchema,
  type ExercisePageResponse,
  type WeaknessTagResponse,
} from '../practice.schema';
import { z } from 'zod';

/**
 * Fetches paginated lists of practical exercises with support for custom query filters.
 */
export async function fetchExercises(
  params?: FetchExercisesParams
): Promise<ExercisePageResponse> {
  // Using <unknown> generic to bypass unsafe-assignment lint warnings upon object destructuring
  const { data } = await api.get<unknown>('/api/practice/exercises', {
    params,
  });
  return ExercisePageResponseSchema.parse(data);
}

/**
 * Retrieves student profile weak points and code pattern error statistics.
 */
export async function fetchWeaknessTags(): Promise<WeaknessTagResponse[]> {
  const { data } = await api.get<unknown>('/api/tags/weakness');
  return z.array(WeaknessTagResponseSchema).parse(data);
}

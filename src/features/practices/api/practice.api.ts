import { api } from '@/lib/axios';
import type {
  ExercisePageResponse,
  FetchExercisesParams,
  WeaknessTagResponse,
} from '@/types/api/exercise.types';

export async function fetchExercises(
  params?: FetchExercisesParams
): Promise<ExercisePageResponse> {
  const { data } = await api.get<ExercisePageResponse>(
    '/api/practice/exercises',
    { params }
  );
  return data;
}

export async function fetchWeaknessTags(): Promise<WeaknessTagResponse[]> {
  const { data } = await api.get<WeaknessTagResponse[]>('/api/tags/weakness');
  return data;
}

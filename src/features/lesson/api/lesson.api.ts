import { api } from '@/lib/axios';
import {
  LessonDetailResponseSchema,
  type LessonDetailResponse,
} from '../lesson.schema';

/**
 * Fetches structured block curriculum content for a precise lesson entity.
 */
export async function fetchLessonById(
  lessonId: string
): Promise<LessonDetailResponse> {
  // unknown constraints any assignment on data decomposition
  const { data } = await api.get<unknown>(`/api/learning/lessons/${lessonId}`);
  return LessonDetailResponseSchema.parse(data);
}

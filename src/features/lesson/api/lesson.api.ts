import { api } from '@/lib/axios';
import type { LessonDetailResponse } from '@/types/api/learning.types';

export async function fetchLessonById(
  lessonId: string
): Promise<LessonDetailResponse> {
  const { data } = await api.get<LessonDetailResponse>(
    `/api/learning/lessons/${lessonId}`
  );
  return data;
}

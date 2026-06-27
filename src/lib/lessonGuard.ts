import { redirect } from '@tanstack/react-router';
import { queryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';
import { fetchLessonById } from '@/features/lesson/api/lesson.api';

/**
 * Ensures the requested lesson is accessible.
 * Upgraded to use queryClient.ensureQueryData to leverage React Query caching.
 */
export const requireAccessibleLesson = async (lessonId: string) => {
  const lesson = await queryClient.ensureQueryData({
    queryKey: queryKeys.lessons.detail(lessonId),
    queryFn: () => fetchLessonById(lessonId),
    staleTime: 30_000,
  });

  const isBlocked = lesson.blocks?.every((block) => block.status === 'locked');

  if (isBlocked) {
    throw redirect({ to: '/dashboard' });
  }

  return lesson;
};

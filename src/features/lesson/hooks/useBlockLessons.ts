import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchLessonById } from '@/features/lesson/api/lesson.api';

interface UseBlockLessonsOptions {
  lessonId: string;
}

/**
 * Handles fetching and state management for a single lesson's details.
 * Upgraded to TanStack Query to leverage shared cache and automatic refetching.
 */
export function useBlockLessons({ lessonId }: UseBlockLessonsOptions) {
  const { data, refetch } = useQuery({
    queryKey: queryKeys.lessons.detail(lessonId),
    queryFn: () => fetchLessonById(lessonId),
    enabled: Boolean(lessonId),
    staleTime: 30_000,
  });

  return {
    currentLesson: data ?? null,
    refetchLesson: refetch,
  };
}

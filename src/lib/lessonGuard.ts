import { redirect } from '@tanstack/react-router';
import { fetchLessonById } from './axios';

/**
 * Ensures the requested lesson is accessible.
 */
export const requireAccessibleLesson = async (lessonId: string) => {
  const lesson = await fetchLessonById(lessonId);

  const isBlocked = lesson.blocks?.every((block) => block.status === 'locked');

  if (isBlocked) {
    throw redirect({ to: '/dashboard' });
  }

  return lesson;
};

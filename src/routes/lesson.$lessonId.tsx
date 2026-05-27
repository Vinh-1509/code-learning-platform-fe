import { createFileRoute } from '@tanstack/react-router';
import { fetchLessonById } from '@/lib/axios';
import { LessonPage } from '../features/lesson/lessonPage';
import { redirect } from '@tanstack/react-router';
import { requireAuth } from '@/lib/auth';
export const Route = createFileRoute('/lesson/$lessonId')({
  beforeLoad: async ({ params }) => {
    // 1. auth check
    await requireAuth();

    // 3. fetch lesson
    const lesson = await fetchLessonById(params.lessonId);

    const isBlocked = lesson.blocks?.every((b) => b.status === 'locked');

    if (isBlocked) {
      throw redirect({ to: '/dashboard' });
    }
  },

  component: LessonPage,
});

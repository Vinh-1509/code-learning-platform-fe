import { createFileRoute } from '@tanstack/react-router';
import { LessonPage } from '@/features/lesson/LessonPage';
import { requireAuth } from '@/lib/auth';
import { requireAccessibleLesson } from '@/lib/lessonGuard';

export const Route = createFileRoute('/lesson/$lessonId')({
  beforeLoad: requireAuth,

  loader: async ({ params }) => {
    await requireAccessibleLesson(params.lessonId);
  },

  component: LessonPage,
});

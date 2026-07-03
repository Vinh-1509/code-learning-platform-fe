import { createFileRoute } from '@tanstack/react-router';
import { requireAuth } from '@/lib/auth';
import { requireAccessibleLesson } from '@/lib/lessonGuard';
import { RouteError } from '@/components/error/RouteError';

export const Route = createFileRoute('/lesson/$lessonId')({
  beforeLoad: requireAuth,

  loader: async ({ params }) => {
    await requireAccessibleLesson(params.lessonId);
  },

  errorComponent: RouteError,
});

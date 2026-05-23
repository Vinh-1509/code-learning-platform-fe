import { createFileRoute } from '@tanstack/react-router';
import { LessonPage } from '../features/lesson/lessonPage';
import { requireAuth } from '@/lib/auth';

export const Route = createFileRoute('/lesson')({
  beforeLoad: requireAuth,
  component: LessonPage,
});

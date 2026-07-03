import { createLazyFileRoute } from '@tanstack/react-router';
import { LessonPage } from '@/features/lesson/LessonPage';

export const Route = createLazyFileRoute('/lesson/$lessonId')({
  component: LessonPage,
});

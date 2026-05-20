import { createLazyFileRoute } from '@tanstack/react-router';
import { LessonPage } from '../features/lesson/lessonPage';

export const Route = createLazyFileRoute('/lesson')({
  component: LessonPage,
});

import { createLazyFileRoute } from '@tanstack/react-router';
import { LessonPage } from '../features/lesson/lesson_page';

export const Route = createLazyFileRoute('/practice')({
  component: LessonPage,
});

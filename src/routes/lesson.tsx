import { createFileRoute, redirect } from '@tanstack/react-router';

export interface LessonSearch {
  lessonId: string;
}

export const Route = createFileRoute('/lesson')({
  validateSearch: (search: Record<string, unknown>): LessonSearch => {
    const raw = search.lessonId;
    const lessonId = typeof raw === 'string' ? raw.trim() : '';
    return { lessonId };
  },
  beforeLoad: ({ search }) => {
    if (!search.lessonId) {
      return redirect({ to: '/dashboard' });
    }
  },
});

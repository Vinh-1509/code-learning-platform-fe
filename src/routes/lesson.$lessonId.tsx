import { createFileRoute } from '@tanstack/react-router';
import { fetchLessonById } from '@/lib/axios';
import { LessonPage } from '../features/lesson/lessonPage';
export const Route = createFileRoute('/lesson/$lessonId')({
  beforeLoad: async ({ params }) => {
    // too  fragile be may give lesson.status or sth
    if (!params.lessonId || params.lessonId.trim() === '') {
      throw new Error('INVALID_LESSON_ID');
    }

    try {
      const lesson = await fetchLessonById(params.lessonId);
      const isLessonBlocked = lesson.blocks.every(
        // check  if all blocks are locked
        (block) => block.status === 'locked'
      );

      if (isLessonBlocked) {
        throw new Error('INVALID_LESSON_ID');
      }
    } catch {
      throw new Error('INVALID_LESSON_ID');
    }
  },
  component: LessonPage,
});

import { useState, useEffect } from 'react';
// Import hàm gọi API từ file chứa Axios của ông (sửa lại đường dẫn cho đúng)
import { fetchLessonById } from '@/lib/axios';
import type { LessonDetailResponse } from '@/lib/axios';

interface UsePracticeOptions {
  lessonId: string;
}

export function usePractice({ lessonId }: UsePracticeOptions) {
  const [currentLesson, setCurrentLesson] =
    useState<LessonDetailResponse | null>(null);

  useEffect(() => {
    async function getLessonData() {
      if (!lessonId) return;

      try {
        const data = await fetchLessonById(lessonId);
        setCurrentLesson(data);
      } catch (error) {
        console.error('Lỗi:', error);
        setCurrentLesson(null);
      }
    }

    void getLessonData();

    return () => {};
  }, [lessonId]);

  return {
    // Data thật từ API
    currentLesson,
  };
}

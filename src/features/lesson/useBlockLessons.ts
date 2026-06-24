import { useState, useEffect } from 'react';
import { fetchLessonById } from '@/features/lesson/api/lesson.api';
import type { LessonDetailResponse } from '@/types/api/learning.types';

interface UseBlockLessonsOptions {
  lessonId: string;
}

export function useBlockLessons({ lessonId }: UseBlockLessonsOptions) {
  const [currentLesson, setCurrentLesson] =
    useState<LessonDetailResponse | null>(null);

  useEffect(() => {
    if (!lessonId) return;

    const loadLesson = async () => {
      try {
        const data = await fetchLessonById(lessonId);
        setCurrentLesson(data);
      } catch (error) {
        console.error('Lỗi:', error);
        setCurrentLesson(null);
      }
    };

    void loadLesson();
  }, [lessonId]);

  const refetchLesson = async () => {
    if (!lessonId) return;

    try {
      const data = await fetchLessonById(lessonId);
      setCurrentLesson(data);
    } catch (error) {
      console.error('Lỗi:', error);
      setCurrentLesson(null);
    }
  };

  return {
    currentLesson,
    refetchLesson,
  };
}

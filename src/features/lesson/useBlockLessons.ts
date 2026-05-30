import { useState, useEffect } from 'react';
import { fetchLessonById } from '@/lib/axios';
import type { LessonDetailResponse } from '@/lib/axios';

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

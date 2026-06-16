import { useEffect, useState } from 'react';

import {
  fetchExercises,
  type Exercise,
  type FetchExercisesParams,
} from '@/lib/axios';

// Hook gọi GET /api/practice/exercises — dùng ở PracticeLibrary
export function usePractice(filters: FetchExercisesParams) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Debounce 400ms: user gõ search không bắn API từng ký tự
    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const params: FetchExercisesParams = {
          page: filters.page ?? 1,
          limit: filters.limit ?? 15,
        };

        if (filters.q) {
          params.q = filters.q;
        }

        if (filters.difficulty && filters.difficulty !== 'All Levels') {
          params.difficulty = filters.difficulty.toLowerCase();
        }

        if (filters.language && filters.language !== 'All Languages') {
          params.language = filters.language;
        }

        const response = await fetchExercises(params);

        setExercises(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching exercises:', err);
        setError('Không thể tải danh sách bài tập.');
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [
    filters.q,
    filters.difficulty,
    filters.language,
    filters.page,
    filters.limit,
  ]);

  return { exercises, loading, error };
}

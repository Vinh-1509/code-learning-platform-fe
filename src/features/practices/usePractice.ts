import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/useAuth'; // Hook lấy thông tin user authMe của bạn
import {
  fetchExercises,
  type Exercise,
  type FetchExercisesParams,
} from '@/lib/axios';

export function usePractice(filters: Omit<FetchExercisesParams, 'language'>) {
  const { user } = useAuth();

  const userLanguage = user?.selectedLanguage?.[0];
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLanguage) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const params: FetchExercisesParams = {
          page: filters.page ?? 1,
          limit: filters.limit ?? 15,
          language: userLanguage,
        };

        if (filters.q) {
          params.q = filters.q;
        }

        if (filters.difficulty && filters.difficulty !== 'All Levels') {
          params.difficulty = filters.difficulty.toLowerCase();
        }

        const response = await fetchExercises(params);

        setExercises(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching exercises:', err);
        setError('Error when fetching exercises');
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [
    filters.q,
    filters.difficulty,
    filters.page,
    filters.limit,
    userLanguage,
  ]);

  return { exercises, loading, error };
}

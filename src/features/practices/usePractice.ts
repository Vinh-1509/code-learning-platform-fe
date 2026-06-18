import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import {
  fetchExercises,
  type Exercise,
  type FetchExercisesParams,
} from '@/lib/axios';

/**
 * usePractice safely syncs queries with debounce protection mechanisms
 */
export function usePractice(filters: Omit<FetchExercisesParams, 'language'>) {
  const { user } = useAuth();
  const userLanguage = user?.selectedLanguage?.[0];

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLanguage) return;

    let isMounted = true;

    // Standard debounced timeout tracker evaluating keystroke entry cycles
    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const params: FetchExercisesParams = {
          page: filters.page ?? 1,
          limit: filters.limit ?? 15,
          language: userLanguage,
        };

        if (filters.q?.trim()) {
          params.q = filters.q.trim();
        }

        if (filters.difficulty && filters.difficulty !== 'All Levels') {
          params.difficulty = filters.difficulty.toLowerCase();
        }

        const response = await fetchExercises(params);

        // [FIXED BUG]: Safeguard checks preventing updates to unmounted component pipelines
        if (isMounted) {
          setExercises(response.data || []);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching exercises:', err);
        if (isMounted) {
          setError('Error when fetching exercises');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [
    filters.q,
    filters.difficulty,
    filters.page,
    filters.limit,
    userLanguage,
  ]);

  return { exercises, loading, error };
}

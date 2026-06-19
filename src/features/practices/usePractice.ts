import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import {
  fetchExercises,
  fetchWeaknessTags,
  type Exercise,
  type FetchExercisesParams,
  type WeaknessTagResponse,
} from '@/lib/axios';

interface UsePracticeResult {
  exercises: Exercise[];
  weakTags: WeaknessTagResponse[];
  weakTagIdsSet: Set<string>;
  featuredExercise: Exercise | null;
  isWeakRecommendation: boolean; // Flag to check if the featured exercise is genuinely a weak area
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to manage fetching logic for exercises combined with user weakness analysis.
 */
export function usePractice(
  filters: Omit<FetchExercisesParams, 'language'>
): UsePracticeResult {
  const { user } = useAuth();
  const userLanguage = user?.selectedLanguage?.[0];

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [weakTags, setWeakTags] = useState<WeaknessTagResponse[]>([]);
  const [weakTagIdsSet, setWeakTagIdsSet] = useState<Set<string>>(new Set());
  const [featuredExercise, setFeaturedExercise] = useState<Exercise | null>(
    null
  );
  const [isWeakRecommendation, setIsWeakRecommendation] =
    useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLanguage) return;

    let isMounted = true;

    // Debounce structure to prevent excessive rapid API requests on keystroke changes
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

        // Fetch exercises data and weakness tags concurrently
        const [exercisesRes, weaknessRes] = await Promise.all([
          fetchExercises(params),
          fetchWeaknessTags().catch(() => []), // Fallback to empty array if endpoint errors out
        ]);

        if (isMounted) {
          const exerciseList = exercisesRes.data || [];
          const weakList = weaknessRes || [];

          const weakTagsMap = new Map<string, WeaknessTagResponse>();
          const weakIds = new Set<string>();

          weakList.forEach((tag) => {
            weakTagsMap.set(tag._id, tag);
            weakIds.add(tag._id);
          });

          setExercises(exerciseList);
          setWeakTags(weakList);
          setWeakTagIdsSet(weakIds);

          // Find the unlocked exercise that targets the user's absolute weakest concept
          let topExercise: Exercise | null = null;
          let highestFailureRate = -1;

          for (const ex of exerciseList) {
            if (ex.status === 'locked') continue; // Do not feature locked tasks

            if (ex.tagId && ex.tagId.length > 0) {
              for (const tid of ex.tagId) {
                const matchingWeakTag = weakTagsMap.get(tid);
                if (
                  matchingWeakTag &&
                  matchingWeakTag.failureRate > highestFailureRate
                ) {
                  highestFailureRate = matchingWeakTag.failureRate;
                  topExercise = ex;
                }
              }
            }
          }

          // State decision fallback: if there is no real overlap with weak domains, fallback to daily challenge mode
          if (topExercise && highestFailureRate > -1) {
            setFeaturedExercise(topExercise);
            setIsWeakRecommendation(true);
          } else {
            // Select the first unlocked challenge in the pool, flag it as false for generic presentation
            const fallbackExercise =
              exerciseList.find((ex) => ex.status !== 'locked') ||
              exerciseList[0] ||
              null;
            setFeaturedExercise(fallbackExercise);
            setIsWeakRecommendation(false);
          }

          setError(null);
        }
      } catch (err) {
        console.error(
          'Error synchronizing practice data stream framework:',
          err
        );
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

  return {
    exercises,
    weakTags,
    weakTagIdsSet,
    featuredExercise,
    isWeakRecommendation,
    loading,
    error,
  };
}

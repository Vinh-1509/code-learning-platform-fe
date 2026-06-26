import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import {
  fetchExercises,
  fetchWeaknessTags,
  type Exercise,
  type FetchExercisesParams,
  type WeaknessTagResponse,
} from '@/lib/axios';

export type { Exercise, WeaknessTagResponse, FetchExercisesParams };

const DIFFICULTY_WEIGHT: Record<string, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

export interface UsePracticeFilters extends Omit<
  FetchExercisesParams,
  'language'
> {
  sortBy?: string;
}

export interface UsePracticeResult {
  exercises: Exercise[];
  weakTags: WeaknessTagResponse[];
  weakTagIdsSet: Set<string>;
  featuredExercise: Exercise | null;
  isWeakRecommendation: boolean;
  loading: boolean;
  error: string | null;
}

export function usePractice(filters: UsePracticeFilters): UsePracticeResult {
  const { user } = useAuth();
  const userLanguage = user?.selectedLanguage?.[0];

  const [rawExercises, setRawExercises] = useState<Exercise[]>([]);
  const [weakTags, setWeakTags] = useState<WeaknessTagResponse[]>([]);
  const [weakTagIdsSet, setWeakTagIdsSet] = useState<Set<string>>(
    new Set<string>()
  );
  const [featuredExercise, setFeaturedExercise] = useState<Exercise | null>(
    null
  );
  const [isWeakRecommendation, setIsWeakRecommendation] =
    useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- PHASE 1: GLOBAL HERO BANNER COMPUTATION (UNBOUNDED BY UI FILTERS) ---
  useEffect(() => {
    if (!userLanguage) return;

    let isHeroMounted = true;

    async function computeGlobalHeroBanner() {
      try {
        // FIXED: Fetch a wide range of tasks globally, completely ignoring active difficulty/search parameters
        const [globalExercisesRes, weaknessRes] = await Promise.all([
          fetchExercises({ page: 1, limit: 100, language: userLanguage }),
          fetchWeaknessTags().catch(() => [] as WeaknessTagResponse[]),
        ]);

        if (!isHeroMounted) return;

        const globalList = globalExercisesRes.data || [];
        const weakList = Array.isArray(weaknessRes) ? weaknessRes : [];

        const weakTagsMap = new Map<string, WeaknessTagResponse>();
        weakList.forEach((tag) => {
          if (tag._id) weakTagsMap.set(tag._id, tag);
        });

        let topExercise: Exercise | null = null;
        let highestFailureRate = -1;

        // Find the absolute weakest available task across the entire user history database
        for (const ex of globalList) {
          if (ex.status === 'locked') continue;

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

        // If a global weakness exists, display it on the Hero section regardless of UI grid filter configuration
        if (topExercise && highestFailureRate > -1) {
          setFeaturedExercise({ ...topExercise });
          setIsWeakRecommendation(true);
        } else {
          // Fallback: Default back to the first unlocked core task as a general Daily Challenge
          const fallbackExercise =
            globalList.find((ex) => ex.status !== 'locked') ||
            globalList[0] ||
            null;
          setFeaturedExercise(
            fallbackExercise ? { ...fallbackExercise } : null
          );
          setIsWeakRecommendation(false);
        }
      } catch (err) {
        console.error('Error calculating global unlinked hero target:', err);
      }
    }

    void computeGlobalHeroBanner();

    return () => {
      isHeroMounted = false;
    };
  }, [userLanguage]);

  // --- PHASE 2: FEED LIST ACQUISITION BOUNDED BY FILTER STATES ---
  useEffect(() => {
    if (!userLanguage) return;

    let isMounted = true;

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

        const [exercisesRes, weaknessRes] = await Promise.all([
          fetchExercises(params),
          fetchWeaknessTags().catch(() => [] as WeaknessTagResponse[]),
        ]);

        if (isMounted) {
          const exerciseList = exercisesRes.data || [];
          const weakList = Array.isArray(weaknessRes) ? weaknessRes : [];

          const weakIds = new Set<string>();
          weakList.forEach((tag) => {
            if (tag._id) weakIds.add(tag._id);
          });

          setRawExercises(exerciseList);
          setWeakTags(weakList);
          setWeakTagIdsSet(weakIds);
          setError(null);
        }
      } catch (err) {
        console.error('Error syncing dynamic grid collection:', err);
        if (isMounted) setError('Error when fetching exercises');
      } finally {
        if (isMounted) setLoading(false);
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

  // --- PHASE 3: MULTI-STAGE STRATIFIED GRID SORTING ENGINE ---
  const sortedExercises = useMemo(() => {
    if (rawExercises.length === 0) return [];

    // Filter active weak recommendations that are fully unlocked
    const prioritizedWeakExercises = rawExercises.filter(
      (ex) =>
        ex.status !== 'locked' && ex.tagId?.some((id) => weakTagIdsSet.has(id))
    );

    // Fallback rest pool containing regular assignments and locked weak tasks
    const regularAndLockedExercises = rawExercises.filter(
      (ex) =>
        ex.status === 'locked' || !ex.tagId?.some((id) => weakTagIdsSet.has(id))
    );

    const sortByDifficulty = (list: Exercise[]) => {
      return [...list].sort((a, b) => {
        const aWeight = DIFFICULTY_WEIGHT[a.level] || 0;
        const bWeight = DIFFICULTY_WEIGHT[b.level] || 0;

        if (filters.sortBy === 'level-asc') return aWeight - bWeight;
        if (filters.sortBy === 'level-desc') return bWeight - aWeight;
        return 0;
      });
    };

    return sortByDifficulty(prioritizedWeakExercises).concat(
      sortByDifficulty(regularAndLockedExercises)
    );
  }, [rawExercises, weakTagIdsSet, filters.sortBy]);

  return {
    exercises: sortedExercises,
    weakTags,
    weakTagIdsSet,
    featuredExercise,
    isWeakRecommendation,
    loading,
    error,
  };
}

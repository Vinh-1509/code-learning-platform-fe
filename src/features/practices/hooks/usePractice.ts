import { useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import {
  fetchExercises,
  fetchWeaknessTags,
} from '@/features/practices/api/practice.api';
import { useAuth } from '@/features/auth/useAuth';

import type {
  Exercise,
  FetchExercisesParams,
  WeaknessTagResponse,
} from '@/types/api/exercise.types';

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

  // ── Debounce search/difficulty inputs ─────────────────────────────────────
  // Each filter debounces independently — typing in search no longer resets
  // the difficulty dropdown's debounce timer, and vice versa.
  const debouncedQ = useDebouncedValue(filters.q ?? '', 400);
  const debouncedDifficulty = useDebouncedValue(filters.difficulty ?? '', 400);

  // ── Build stable query-param objects ─────────────────────────────────────
  const heroParams = useMemo<FetchExercisesParams>(
    () => ({ page: 1, limit: 100, language: userLanguage ?? '' }),
    [userLanguage]
  );

  const filteredParams = useMemo<FetchExercisesParams>(() => {
    const params: FetchExercisesParams = {
      page: filters.page ?? 1,
      limit: filters.limit ?? 15,
      language: userLanguage ?? '',
    };
    if (debouncedQ.trim()) params.q = debouncedQ.trim();
    if (debouncedDifficulty && debouncedDifficulty !== 'All Levels') {
      params.difficulty = debouncedDifficulty.toLowerCase();
    }
    return params;
  }, [
    debouncedQ,
    debouncedDifficulty,
    filters.page,
    filters.limit,
    userLanguage,
  ]);

  // ── Query 1: Weakness tags ────────────────────────────────────────────────
  const { data: weaknessData } = useQuery({
    queryKey: queryKeys.tags.weakness(),
    queryFn: fetchWeaknessTags,
    enabled: Boolean(userLanguage),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: 1,
  });

  // ── Query 2: Global exercises for the hero banner ─────────────────────────
  const { data: globalExercisesData } = useQuery({
    queryKey: queryKeys.exercises.list(heroParams),
    queryFn: () => fetchExercises(heroParams),
    enabled: Boolean(userLanguage),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });

  // ── Query 3: Filtered exercises for the main grid ─────────────────────────
  const {
    data: filteredExercisesData,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: queryKeys.exercises.list(filteredParams),
    queryFn: () => fetchExercises(filteredParams),
    enabled: Boolean(userLanguage),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  // ── Derived: weakness tag helpers ─────────────────────────────────────────
  const weakTags = useMemo<WeaknessTagResponse[]>(
    () => (Array.isArray(weaknessData) ? weaknessData : []),
    [weaknessData]
  );

  const weakTagIdsSet = useMemo<Set<string>>(
    () => new Set(weakTags.map((t) => t._id).filter(Boolean)),
    [weakTags]
  );

  // ── Derived: hero banner ───────────────────────────────────────────────────
  const { featuredExercise, isWeakRecommendation } = useMemo(() => {
    const globalList = globalExercisesData?.data ?? [];

    const weakTagsMap = new Map<string, WeaknessTagResponse>();
    weakTags.forEach((tag) => {
      if (tag._id) weakTagsMap.set(tag._id, tag);
    });

    let topExercise: Exercise | null = null;
    let highestFailureRate = -1;

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

    if (topExercise && highestFailureRate > -1) {
      return {
        featuredExercise: { ...topExercise },
        isWeakRecommendation: true,
      };
    }

    const fallback =
      globalList.find((ex) => ex.status !== 'locked') ?? globalList[0] ?? null;

    return {
      featuredExercise: fallback ? { ...fallback } : null,
      isWeakRecommendation: false,
    };
  }, [globalExercisesData, weakTags]);

  const sortedExercises = useMemo(() => {
    const rawExercises = filteredExercisesData?.data ?? [];

    if (rawExercises.length === 0) return [];

    const prioritizedWeakExercises = rawExercises.filter(
      (ex) =>
        ex.status !== 'locked' && ex.tagId?.some((id) => weakTagIdsSet.has(id))
    );

    const regularAndLockedExercises = rawExercises.filter(
      (ex) =>
        ex.status === 'locked' || !ex.tagId?.some((id) => weakTagIdsSet.has(id))
    );

    const sortByDifficulty = (list: Exercise[]) =>
      [...list].sort((a, b) => {
        const aWeight = DIFFICULTY_WEIGHT[a.level] || 0;
        const bWeight = DIFFICULTY_WEIGHT[b.level] || 0;

        if (filters.sortBy === 'level-asc') return aWeight - bWeight;
        if (filters.sortBy === 'level-desc') return bWeight - aWeight;
        return 0;
      });

    return sortByDifficulty(prioritizedWeakExercises).concat(
      sortByDifficulty(regularAndLockedExercises)
    );
  }, [filteredExercisesData, weakTagIdsSet, filters.sortBy]);

  const error =
    queryError instanceof Error
      ? queryError.message
      : queryError
        ? 'Error when fetching exercises'
        : null;

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

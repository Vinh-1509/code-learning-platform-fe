import { useMemo, useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
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
  // Replaces the manual setTimeout inside the old useEffect.
  // Page and limit are not debounced — they change on explicit user action.
  // setState inside a setTimeout effect is intentionally async (400 ms gap),
  // so it does not cause cascading renders.
  const [debouncedQ, setDebouncedQ] = useState(filters.q ?? '');
  const [debouncedDifficulty, setDebouncedDifficulty] = useState(
    filters.difficulty ?? ''
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(filters.q ?? '');
      setDebouncedDifficulty(filters.difficulty ?? '');
    }, 400);
    return () => clearTimeout(timer);
  }, [filters.q, filters.difficulty]);

  // ── Build stable query-param objects ─────────────────────────────────────
  // Memoized so the query key only changes when the values actually change,
  // preventing React Query from firing a new request on every render.
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
  // Shared between the hero and feed derivations — one network call, one cache
  // entry. The original fetched this separately inside each useEffect.
  const { data: weaknessData } = useQuery({
    queryKey: queryKeys.tags.weakness(),
    queryFn: fetchWeaknessTags,
    enabled: Boolean(userLanguage),
    staleTime: 5 * 60_000, // Weakness data is slow to change
    gcTime: 30 * 60_000,
    retry: 1, // Original silently swallowed errors; be lenient here too
  });

  // ── Query 2: Global exercises for the hero banner ─────────────────────────
  // Intentionally unbounded by UI filter state so the "Weakness-Based
  // Recommendation" card always reflects the user's actual weakest concept,
  // not whatever the search/difficulty dropdowns happen to be set to.
  const { data: globalExercisesData } = useQuery({
    queryKey: queryKeys.exercises.list(heroParams),
    queryFn: () => fetchExercises(heroParams),
    enabled: Boolean(userLanguage),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });

  // ── Query 3: Filtered exercises for the main grid ─────────────────────────
  // keepPreviousData keeps the old list visible while a new filter is loading,
  // replacing the UX role the 400 ms debounce played in the original.
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

  // ── Derived: hero banner (Phase 1 logic, now a useMemo) ───────────────────
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

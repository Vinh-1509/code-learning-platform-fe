import { useState, useMemo } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
  fetchMilestones,
  fetchLessonsByMilestone,
} from '@/features/dashboard/api/dashboard.api';
import type {
  MilestoneResponse,
  LessonResponse,
} from '@/types/api/learning.types';
import { useStartLesson } from '@/features/dashboard/useStartLesson';

export type LessonStatus = 'active' | 'completed' | 'locked';
export interface Lesson {
  id: string;
  name: string;
  status: LessonStatus;
}

export interface Module {
  id: string;
  name: string;
  status: string;
  progress: number;
  lessons: Lesson[];
}

export interface CurrentLessonInfo {
  lessonId: string;
  lessonName: string;
  moduleName: string;
  progress: number;
}

/**
 * getCurrentLesson searches through the course curriculum modules to find the first in-progress/active lesson.
 * Used to display the shortcut resume banner on the dashboard.
 *
 * @param {Module[]} modules - List of modules containing lesson items.
 * @returns {CurrentLessonInfo | null} Information about the current active lesson, or null if none is in progress.
 */
export function getCurrentLesson(modules: Module[]): CurrentLessonInfo | null {
  for (const module of modules) {
    const currentLesson = module.lessons.find((l) => l.status === 'active');
    if (currentLesson) {
      return {
        lessonId: currentLesson.id,
        lessonName: currentLesson.name,
        moduleName: module.name,
        progress: module.progress,
      };
    }
  }
  return null;
}

/**
 * useRoadmap is a custom React hook that manages data fetching and expansion state for the dashboard learning roadmap.
 *
 * Upgraded to TanStack Query:
 *  - useMilestonesQuery: fetches the list of milestones (staleTime: 2 min).
 *  - useQueries (parallel): once milestone IDs are known, fires all lesson requests
 *    simultaneously instead of sequentially — eliminating the N+1 problem.
 *
 * @returns {Object} State and handler functions:
 *   - modules: Array of sorted module data structures.
 *   - expandedModules: List of expanded module IDs.
 *   - toggleModule: Function to toggle a module's accordion expansion state.
 *   - handleStartLesson: Callback trigger when starting/resuming a lesson.
 *   - currentLesson: Shortcut info of the user's active lesson.
 *   - loading: Boolean indicating if any fetch queries are still in-flight.
 */
export function useRoadmap() {
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const startLesson = useStartLesson();

  // ── Step 1: Fetch the milestone list ──────────────────────────────────────
  const { data: milestones = [], isLoading: milestonesLoading } = useQuery({
    queryKey: queryKeys.milestones.list(),
    queryFn: fetchMilestones,
    staleTime: 2 * 60_000,
    gcTime: 10 * 60_000,
  });

  // ── Step 2: Parallel-fetch lessons for every milestone ────────────────────
  // useQueries fires all requests concurrently; each result is independently cached.
  const lessonQueries = useQueries({
    queries: milestones.map((milestone: MilestoneResponse) => ({
      queryKey: queryKeys.milestones.lessons(milestone._id),
      queryFn: () => fetchLessonsByMilestone(milestone._id),
      staleTime: 2 * 60_000,
      gcTime: 10 * 60_000,
    })),
  });

  const lessonsLoading = lessonQueries.some((q) => q.isLoading);
  const loading = milestonesLoading || lessonsLoading;

  // ── Step 3: Combine milestones + lesson results into Module[] ─────────────
  const modules = useMemo<Module[]>(() => {
    if (milestones.length === 0) return [];

    const assembled = milestones.map(
      (m: MilestoneResponse, index: number): Module => {
        const lessonsData: LessonResponse[] = lessonQueries[index]?.data ?? [];
        return {
          id: m._id,
          name: m.title,
          status: m.progress.status,
          progress: m.progress.completionPercentage,
          lessons: lessonsData.map((l: LessonResponse) => ({
            id: l._id,
            name: l.title,
            status: l.progress.status,
          })),
        };
      }
    );

    return assembled.sort((a: Module, b: Module) => a.id.localeCompare(b.id));
  }, [milestones, lessonQueries]);

  // ── Step 4: UI state handlers (unchanged) ─────────────────────────────────
  const toggleModule = (id: string) => {
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleStartLesson = (lessonId: string) => {
    startLesson(lessonId);
  };

  const currentLesson = getCurrentLesson(modules);

  return {
    modules,
    expandedModules,
    toggleModule,
    handleStartLesson,
    currentLesson,
    loading,
  };
}

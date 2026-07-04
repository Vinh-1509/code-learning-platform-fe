/**
 * Central Query Key Factory
 *
 * All React Query cache keys are defined here to guarantee:
 *  - Uniqueness  — no two queries accidentally share a key.
 *  - Hierarchy   — broad invalidations (e.g. `queryKeys.feynman.all`) automatically
 *                  cover every narrower key inside the same namespace.
 *  - Type safety — `as const` assertions make every key a readonly tuple.
 *
 * Usage examples:
 *   useQuery({ queryKey: queryKeys.auth.me(), ... })
 *   queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
 *   queryClient.invalidateQueries({ queryKey: queryKeys.feynman.all })
 */

import type { FetchExercisesParams } from '@/types/api/exercise.types';

export const queryKeys = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    all: ['auth'] as const,
    /** Cached result of GET /api/auth/me */
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },

  // ── Languages ─────────────────────────────────────────────────────────────
  languages: {
    all: ['languages'] as const,
    /** Full list from GET /api/languages */
    list: () => [...queryKeys.languages.all, 'list'] as const,
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  dashboard: {
    all: ['dashboard'] as const,
    /** Aggregate stats + milestones from GET /api/dashboard */
    data: () => [...queryKeys.dashboard.all, 'data'] as const,
  },

  // ── Leaderboard ───────────────────────────────────────────────────────────
  leaderboard: {
    all: ['leaderboard'] as const,
    /** Read-only standings list for the public leaderboard page */
    list: () => [...queryKeys.leaderboard.all, 'list'] as const,
  },

  // ── Milestones / Roadmap ──────────────────────────────────────────────────
  milestones: {
    all: ['milestones'] as const,
    /** All milestones for the user's roadmap */
    list: () => [...queryKeys.milestones.all, 'list'] as const,
    /**
     * Lessons belonging to a specific milestone.
     * Invalidating `queryKeys.milestones.all` covers these too.
     */
    lessons: (milestoneId: string) =>
      [...queryKeys.milestones.all, milestoneId, 'lessons'] as const,
  },

  // ── Lessons ───────────────────────────────────────────────────────────────
  lessons: {
    all: ['lessons'] as const,
    /**
     * Full lesson detail (blocks, content, progress) from
     * GET /api/learning/lessons/:lessonId
     */
    detail: (lessonId: string) => [...queryKeys.lessons.all, lessonId] as const,
  },

  // ── Exercises ─────────────────────────────────────────────────────────────
  exercises: {
    all: ['exercises'] as const,
    /**
     * Single exercise definition from GET /api/practice/exercises/:id.
     * Use `staleTime: Infinity` — exercise definitions never change mid-session.
     */
    detail: (exerciseId: string) =>
      [...queryKeys.exercises.all, exerciseId] as const,
    /**
     * Paginated & filtered exercise library from GET /api/practice/exercises.
     * Each unique filter combination gets its own cache entry.
     */
    list: (filters: Omit<FetchExercisesParams, never>) =>
      [...queryKeys.exercises.all, 'list', filters] as const,
    /**
     * Attempt history for a single exercise from
     * GET /api/practice/exercises/:id/history.
     */
    history: (exerciseId: string) =>
      [...queryKeys.exercises.all, exerciseId, 'history'] as const,
  },

  // ── Weakness / Topic Tags ─────────────────────────────────────────────────
  tags: {
    all: ['tags'] as const,
    /** User's weak topic tags from GET /api/tags/weakness */
    weakness: () => [...queryKeys.tags.all, 'weakness'] as const,
  },

  // ── Feynman AI ────────────────────────────────────────────────────────────
  feynman: {
    all: ['feynman'] as const,
    /**
     * Chat history + pass status for a block.
     * Use `staleTime: 0, gcTime: 0` — always fresh, not shared across blocks.
     */
    history: (blockId: string) =>
      [...queryKeys.feynman.all, blockId, 'history'] as const,
    /** The AI-generated opening question for a block */
    question: (blockId: string) =>
      [...queryKeys.feynman.all, blockId, 'question'] as const,
    /** Pass/fail status for a block's Feynman session */
    stats: (blockId: string) =>
      [...queryKeys.feynman.all, blockId, 'stats'] as const,
  },
} as const;

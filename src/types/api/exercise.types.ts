/**
 * Exercise & practice domain API types.
 *
 * These are re-exported from their Zod schema definitions
 * (lesson.schema.ts, practice.schema.ts) rather than hand-declared here.
 * This keeps a single source of truth: when a schema's shape or
 * nullability changes, every consumer picks it up automatically instead
 * of silently drifting out of sync with a parallel hand-written interface.
 */

export type {
  ExerciseType,
  Difficulty,
  Exercise,
  ExercisePageResponse,
  WeaknessTagResponse,
} from '@/features/practices/practice.schema';

export type {
  DragDropBlockResponse,
  DragDropExerciseResponse,
  FillBlankExerciseResponse,
  ExerciseResponse,
  SubmitAnswerItem,
  SubmitAnswerResponse,
  HintResponse,
  ExerciseAttemptResponse,
  ExplainAnswerItem,
  ExplainAnswerResponse,
} from '@/features/lesson/lesson.schema';

// ── Request params ───────────────────────────────────────────────────────
// Not parsed from a server response, so there's no matching Zod schema —
// this one stays hand-declared.
export interface FetchExercisesParams {
  q?: string;
  difficulty?: string;
  language?: string;
  page?: number;
  limit?: number;
}

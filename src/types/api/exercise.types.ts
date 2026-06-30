/**
 * Exercise & practice domain API response types.
 * Covers exercise definitions, submissions, hints, history, and weakness tags.
 */

// ── Exercise definitions ────────────────────────────────────────────────────

export type ExerciseType = 'drag_drop' | 'fill_blank';

export interface DragDropBlockResponse {
  id: string;
  code: string;
  indent: number;
}

export interface DragDropExerciseResponse {
  _id: string;
  type: 'drag_drop';
  title: string;
  instruction: string;
  language: string;
  level: string;
  order: number;
  data: {
    expectedSlots?: number;
    blocks: DragDropBlockResponse[];
    answer?: (string | null)[];
  };
  hints?: Record<string, string>;
}

export interface FillBlankExerciseResponse {
  _id: string;
  type: 'fill_blank';
  title: string;
  instruction: string;
  language: string;
  level: string;
  order: number;
  data: {
    template: string[];
    placeholders: Record<string, string>;
  };
  hints?: Record<string, string>;
}

export type ExerciseResponse =
  | DragDropExerciseResponse
  | FillBlankExerciseResponse;

// ── Submission & feedback ───────────────────────────────────────────────────

export interface SubmitAnswerItem {
  field: string;
  isCorrect: boolean;
}

export interface SubmitAnswerResponse {
  correct: boolean;
  items?: SubmitAnswerItem[];
  attemptNumber?: number;
}

export interface HintResponse {
  hintLevel: number;
  hint: string;
}

export interface ExerciseAttemptResponse {
  _id: string;
  exerciseId: string;
  isPassed: boolean;
  items: SubmitAnswerItem[];
  hintLevel: number;
  userAnswer?: unknown;
  attemptNumber: number;
  attemptedAt: string;
}

export interface ExplainAnswerItem {
  field: string;
  isCorrect: boolean;
  explanation: string;
}

export interface ExplainAnswerResponse {
  exerciseId: string;
  isCorrect: boolean;
  feedback: string;
  items: ExplainAnswerItem[];
  suggestion?: string;
}

// ── Practice library / filters ──────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Exercise {
  _id: string;
  title: string;
  instruction: string;
  language: string;
  tagId: string[];
  type: ExerciseType;
  level: Difficulty;
  order: number;
  status?: 'completed' | 'active' | 'locked';
}

export interface ExercisePageResponse {
  total: number;
  page: number;
  limit: number;
  data: Exercise[];
}

export interface FetchExercisesParams {
  q?: string;
  difficulty?: string;
  language?: string;
  page?: number;
  limit?: number;
}

// ── Weakness tags ───────────────────────────────────────────────────────────

export interface WeaknessTagResponse {
  _id: string;
  name: string;
  description: string;
  totalAttempts: number;
  failAttempts: number;
  failureRate: number;
  isWeak: boolean;
  updatedAt: string;
}

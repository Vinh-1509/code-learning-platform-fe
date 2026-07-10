/**
 * Block / ContentItem / LessonDetailResponse are re-exported from
 * lesson.schema.ts (Zod-validated). MilestoneResponse / LessonResponse
 * have no backing schema yet — dashboard.api.ts currently trusts them via
 * a type cast rather than runtime validation, so they stay hand-declared
 * here until that gets a schema too.
 */
export type {
  Block,
  ContentItem,
  LessonDetailResponse,
} from '@/features/lesson/lesson.schema';

export interface MilestoneResponse {
  _id: string;
  title: string;
  description: string;
  order: number;
  progress: {
    status: 'active' | 'locked' | 'completed';
    completionPercentage: number;
  };
}

export interface LessonResponse {
  _id: string;
  title: string;
  order: number;
  progress: {
    status: 'active' | 'locked' | 'completed';
    isCompleted: boolean;
    completionPercentage: number;
  };
}

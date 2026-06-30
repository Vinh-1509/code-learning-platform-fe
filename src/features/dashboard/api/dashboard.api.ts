import { api } from '@/lib/axios';
import type {
  MilestoneResponse,
  LessonResponse,
} from '@/types/api/learning.types';
import {
  DashboardResponseSchema,
  type DashboardResponse,
} from '../dashboard.schema';

/**
 * Fetches dashboard domain analytics metrics with strict runtime schema evaluation.
 */
export async function fetchDashboardData(): Promise<DashboardResponse> {
  // unknown generic guarantees compliance with no-unsafe-assignment rule
  const { data } = await api.get<unknown>('/api/dashboard');
  return DashboardResponseSchema.parse(data);
}

/**
 * Retrieves milestones associated with the current study roadmap.
 */
export async function fetchMilestones(): Promise<MilestoneResponse[]> {
  const { data } = await api.get<unknown>('/api/learning/milestones');
  return data as MilestoneResponse[];
}

/**
 * Extracts lessons tied directly to a structural milestone ID.
 */
export async function fetchLessonsByMilestone(
  milestoneId: string
): Promise<LessonResponse[]> {
  const { data } = await api.get<unknown>(
    `/api/learning/milestones/${milestoneId}/lessons`
  );
  return data as LessonResponse[];
}

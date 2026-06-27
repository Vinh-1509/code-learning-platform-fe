import { api } from '@/lib/axios';
import type { DashboardResponse } from '@/types/api/dashboard.types';
import type {
  MilestoneResponse,
  LessonResponse,
} from '@/types/api/learning.types';

export async function fetchDashboardData(): Promise<DashboardResponse> {
  const { data } = await api.get<DashboardResponse>('/api/dashboard');
  return data;
}

export async function fetchMilestones(): Promise<MilestoneResponse[]> {
  const { data } = await api.get<MilestoneResponse[]>(
    '/api/learning/milestones'
  );
  return data;
}

export async function fetchLessonsByMilestone(
  milestoneId: string
): Promise<LessonResponse[]> {
  const { data } = await api.get<LessonResponse[]>(
    `/api/learning/milestones/${milestoneId}/lessons`
  );
  return data;
}

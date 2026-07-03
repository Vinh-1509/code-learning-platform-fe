import { createFileRoute } from '@tanstack/react-router';
import { requireAuth } from '@/lib/auth';
import { queryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';
import {
  fetchDashboardData,
  fetchMilestones,
} from '@/features/dashboard/api/dashboard.api';
import { RouteError } from '@/components/error/RouteError';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: requireAuth,
  loader: () => {
    // Fire-and-forget — don't await, don't block navigation
    void queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.data(),
      queryFn: fetchDashboardData,
      staleTime: 60_000,
    });
    void queryClient.prefetchQuery({
      queryKey: queryKeys.milestones.list(),
      queryFn: fetchMilestones,
      staleTime: 2 * 60_000,
    });
  },
  errorComponent: RouteError,
});

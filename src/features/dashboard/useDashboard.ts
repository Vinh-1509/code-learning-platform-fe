import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchDashboardData } from '@/features/dashboard/api/dashboard.api';

/**
 * Handles fetching and state management for the user dashboard data.
 * Upgraded to TanStack Query for optimal caching and performance.
 */
export function useDashboardData() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.dashboard.data(),
    queryFn: fetchDashboardData,
    staleTime: 60_000,
  });

  return {
    dashboardData: data ?? null,
    loading: isLoading,
    error: error ? 'Failed to load dashboard statistics.' : null,
  };
}

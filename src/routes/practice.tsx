import { createFileRoute } from '@tanstack/react-router';
import { requireAuth } from '@/lib/auth';
import { queryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';
import { fetchWeaknessTags } from '@/features/practices/api/practice.api';
import { RouteError } from '@/components/error/RouteError';

export const Route = createFileRoute('/practice')({
  beforeLoad: requireAuth,
  loader: () => {
    // Weakness tags are slow to compute server-side — warm them early
    void queryClient.prefetchQuery({
      queryKey: queryKeys.tags.weakness(),
      queryFn: fetchWeaknessTags,
      staleTime: 5 * 60_000,
    });
  },
  errorComponent: RouteError,
});

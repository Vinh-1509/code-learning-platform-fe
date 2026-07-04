import { createFileRoute } from '@tanstack/react-router';

import { RouteError } from '@/components/error/RouteError';
import { requireAuth } from '@/lib/auth';
import { queryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';
import { fetchLeaderboard } from '@/features/leaderboard/api/leaderboard.api';
import { LeaderboardPage } from '@/features/leaderboard/LeaderboardPage';

export const Route = createFileRoute('/leaderboard')({
  beforeLoad: requireAuth,
  loader: () => {
    void queryClient.prefetchQuery({
      queryKey: queryKeys.leaderboard.list(),
      queryFn: fetchLeaderboard,
      staleTime: 60_000,
    });
  },
  errorComponent: RouteError,
  component: LeaderboardPage,
});

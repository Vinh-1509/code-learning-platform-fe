import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';
import { useEffect } from 'react';
import {
  claimGachaReward,
  fetchClassTargets,
  submitAttack,
  checkGachaNotifications,
} from '../api/gacha.api';

export function useGacha(userId?: string) {
  const queryClient = useQueryClient();

  // 1. Mutation xử lý xoay Gacha
  const claimGachaMutation = useMutation({
    mutationFn: claimGachaReward,
    onError: () => {
      toast.error('Unable to connect to the reward wheel.');
    },
  });

  // 2. Query the read-only leaderboard list (enabled only when the attack stage is visible)
  const useTargetsQuery = (enabled: boolean) =>
    useQuery({
      queryKey: queryKeys.leaderboard.list(),
      queryFn: fetchClassTargets,
      enabled,
      staleTime: 5000,
      refetchInterval: 5000,
      refetchIntervalInBackground: true,
    });

  // 3. Mutation that handles the attack action
  const attackMutation = useMutation({
    mutationFn: submitAttack,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.leaderboard.all,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Attack failed.');
    },
  });

  // 4. Poll every 15 seconds to detect if the user has been attacked
  const { data: notificationData } = useQuery({
    queryKey: ['gacha', 'notifications', userId],
    queryFn: checkGachaNotifications,
    enabled: Boolean(userId),
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
  });
  useEffect(() => {
    if (notificationData?.hasNotification) {
      toast.error('⚠️ Got bugged', {
        description: notificationData.message,
        id: 'gacha-attack-toast',
        duration: 7000,
      });

      // 2. Ép các query khác cập nhật lại điểm số và bảng xếp hạng trên UI
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.leaderboard.all,
      });
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    }
  }, [notificationData, queryClient]);

  return {
    claimGachaMutation,
    useTargetsQuery,
    attackMutation,
  };
}

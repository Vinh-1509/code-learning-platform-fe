import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';
import { useEffect } from 'react';
import {
  //claimGachaReward,
  fetchClassTargets,
  submitAttack,
  checkGachaNotifications,
} from '../api/gacha.api';

export function useGacha(userId?: string) {
  const queryClient = useQueryClient();

  const useTargetsQuery = (enabled: boolean) =>
    useQuery({
      queryKey: queryKeys.leaderboard.targets(),
      queryFn: fetchClassTargets,
      enabled,
      staleTime: 5000,
      refetchInterval: enabled ? 15000 : false,
      refetchIntervalInBackground: false,
    });

  const attackMutation = useMutation({
    mutationFn: submitAttack,
    onSuccess: (data) => {
      if (data.details) {
        toast.success(
          `💥 Bugged successfully! Stole ${data.details.coinsStolen} CS-Pts from ${data.details.targetName}.`
        );
      } else {
        toast.success(data.msg || 'Successfully bugged!');
      }

      void queryClient.invalidateQueries({
        queryKey: queryKeys.leaderboard.all,
      });

      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Attack failed.');
    },
  });

  // 4. Polling định kỳ kiểm tra biến động số dư do bị tấn công
  const { data: notificationData } = useQuery({
    queryKey: ['gacha', 'notifications', userId],
    queryFn: checkGachaNotifications,
    enabled: Boolean(userId),
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (
      notificationData?.hasNotification &&
      notificationData.notifications?.length > 0
    ) {
      notificationData.notifications.forEach((notif) => {
        toast.error('⚠️ Got bugged!', {
          description: notif.message,
          id: notif.id, // 🔥 QUAN TRỌNG: Dùng id của thông báo làm Toast ID để chống trùng lặp, spam lặp lại khi polling refetch
          duration: 7000,
        });
      });

      // Ép các query hệ thống đồng loạt cập nhật lại điểm số thật trên UI ngay lập tức
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.leaderboard.all,
      });
      // 🔥 FIX: đồng bộ với chỗ trên, dùng queryKeys.auth.me()
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    }
  }, [notificationData, queryClient]);

  return {
    // claimGachaMutation,
    useTargetsQuery,
    attackMutation,
  };
}

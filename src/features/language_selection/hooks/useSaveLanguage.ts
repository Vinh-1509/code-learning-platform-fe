import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { queryKeys } from '@/lib/queryKeys';
import { saveLanguage } from '../api/languages.api';
import type { Language } from '@/types/languageSelection';

export function useSaveLanguage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (language: Language) => saveLanguage(language),
    onSuccess: async () => {
      // ── 1. Force hard refetch for user profile identity to secure the Guard ──
      // This guarantees the 'selectedLanguage' array is completely updated in cache before moving forward
      await queryClient.refetchQueries({
        queryKey: queryKeys.auth.me(),
        exact: true,
      });

      // ── 2. Background invalidation for domain-specific metrics ────────────────
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.milestones.all,
      });

      // ── 3. Smooth transition to Dashboard with hydrated cache values ──────────
      void navigate({ to: '/dashboard' });
    },
  });
}

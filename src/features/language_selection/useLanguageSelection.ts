import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

import { queryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';
import {
  fetchLanguages,
  saveLanguage,
} from '@/features/language_selection/api/languages.api';

import type { LanguageOption } from '@/types/languageSelection';

/**
 * useLanguageSelection manages the state and flow of language selection.
 * Fetches available languages, tracks user selection, and saves the
 * preference before navigating to the dashboard.
 */
export function useLanguageSelection() {
  const navigate = useNavigate();

  // ── Fetch available languages ─────────────────────────────────────────────
  // staleTime: Infinity because language options are static — they never
  // change between sessions.
  const { data: languages = [], isLoading: fetching } = useQuery<
    LanguageOption[]
  >({
    queryKey: queryKeys.languages.list(),
    queryFn: fetchLanguages,
    staleTime: Infinity,
    gcTime: 60 * 60_000,
  });

  // ── Local UI state ────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ── Confirm selection ─────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!selected) return;

    const selectedLanguage = languages.find((lang) => lang.id === selected);
    if (!selectedLanguage) return;

    setSaving(true);
    try {
      await saveLanguage(selectedLanguage.language);

      // Invalidate auth.me BEFORE navigating so the dashboard route guard
      // (requireAuth → queryClient.ensureQueryData) fetches fresh user data
      // that includes the newly saved selectedLanguage.
      await queryClient.invalidateQueries({
        queryKey: queryKeys.auth.me(),
      });

      void navigate({ to: '/dashboard' });
    } finally {
      setSaving(false);
    }
  };

  return { languages, fetching, selected, setSelected, saving, handleConfirm };
}

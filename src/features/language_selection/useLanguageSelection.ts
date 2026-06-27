import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

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
  const { data: languages = [], isLoading: fetching } = useQuery<
    LanguageOption[]
  >({
    queryKey: queryKeys.languages.list(),
    queryFn: fetchLanguages,
    staleTime: Infinity,
    gcTime: 60 * 60_000, // 1 hour — language list is effectively static
  });

  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!selected) return;

    const selectedLanguage = languages.find((lang) => lang.id === selected);
    if (!selectedLanguage) return;

    setSaving(true);
    try {
      await saveLanguage(selectedLanguage.language);
      void navigate({ to: '/dashboard' });
    } finally {
      setSaving(false);
    }
  };

  return { languages, fetching, selected, setSelected, saving, handleConfirm };
}

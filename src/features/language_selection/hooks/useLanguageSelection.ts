import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { fetchLanguages } from '@/features/language_selection/api/languages.api';
import { useSaveLanguage } from '../hooks/useSaveLanguage'; // Import the new mutation hook

import type { LanguageOption } from '@/types/languageSelection';

/**
 * useLanguageSelection manages the state and flow of language selection.
 * Fetches available languages, tracks user selection, and saves the
 * preference using TanStack Query mutations.
 */
export function useLanguageSelection() {
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

  // ── Handle language saving mutation ────────────────────────────────────────
  const { mutate: save, isPending: saving } = useSaveLanguage();

  const handleConfirm = () => {
    if (!selected) return;

    const selectedLanguage = languages.find((lang) => lang.id === selected);
    if (!selectedLanguage) return;

    // Trigger mutation with the specific language argument
    save(selectedLanguage.language);
  };

  return { languages, fetching, selected, setSelected, saving, handleConfirm };
}

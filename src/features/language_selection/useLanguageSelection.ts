import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { queryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';
import {
  fetchLanguages,
  saveLanguage,
} from '@/features/language_selection/api/languages.api';
import type { LanguageOption } from '@/types/languageSelection';

export function useLanguageSelection() {
  const navigate = useNavigate();
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const langs = await fetchLanguages();
      setLanguages(langs);
    };

    void initialize().finally(() => setFetching(false));
  }, [navigate]);

  const handleConfirm = async () => {
    if (!selected) return;
    const selectedLanguage = languages.find((lang) => lang.id === selected);
    if (!selectedLanguage) return;

    setSaving(true);
    try {
      await saveLanguage(selectedLanguage.language);
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      void navigate({ to: '/dashboard' });
    } finally {
      setSaving(false);
    }
  };

  return { languages, fetching, selected, setSelected, saving, handleConfirm };
}

import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { fetchLanguages, saveLanguage } from '@/lib/axios';
import type { LanguageOption } from '@/types/languageSelection';

/**
 * useLanguageSelection is a custom React hook managing the state and flow of language selection.
 * Handles fetching available languages from the database, tracking user selection,
 * and saving the selected language preference to the profile before navigating to the dashboard.
 *
 * @returns {Object} State and handler functions:
 *   - languages: List of fetched language options.
 *   - fetching: Loading state of languages query.
 *   - selected: Selected language ID.
 *   - setSelected: Setter function for selecting a language.
 *   - saving: Saving indicator during preference confirmation.
 *   - handleConfirm: Async function to submit the selection.
 */
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
      void navigate({ to: '/dashboard' });
    } finally {
      setSaving(false);
    }
  };

  return { languages, fetching, selected, setSelected, saving, handleConfirm };
}

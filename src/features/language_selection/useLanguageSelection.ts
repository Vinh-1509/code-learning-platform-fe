import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { fetchLanguages, saveLanguage, getMe } from '@/lib/axios';
import type { LanguageOption } from '@/types/language_selection';

export function useLanguageSelection() {
  const navigate = useNavigate();
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await getMe();
        if (user.selectedLanguage?.length) {
          void navigate({ to: '/' });
          return;
        }
      } catch {
        void navigate({ to: '/' });
      }

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

import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { fetchLanguages, saveLanguage } from '@/lib/axios';
import type { Language, LanguageOption } from '@/types/language_selection';

export function useLanguageSelection() {
  const navigate = useNavigate();
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selected, setSelected] = useState<Language | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('language'); //tam thoi mai mot thay the bang auth context
    if (saved) {
      void navigate({ to: '/' });
      return;
    }
    void fetchLanguages()
      .then(setLanguages)
      .finally(() => setFetching(false));
  }, [navigate]);

  const handleConfirm = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await saveLanguage(selected);
      localStorage.setItem('language', selected); //tam thoi mai mot thay the bang auth context
      void navigate({ to: '/dashboard' });
    } finally {
      setSaving(false);
    }
  };

  return { languages, fetching, selected, setSelected, saving, handleConfirm };
}

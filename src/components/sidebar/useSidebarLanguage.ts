import { useEffect, useState } from 'react';

import { getMe } from '@/features/auth/api/auth.api';

export function useSidebarLanguage() {
  const [languageLabel, setLanguageLabel] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadLanguage = async () => {
      try {
        const user = await getMe();
        if (!isMounted) return;

        setLanguageLabel(user.selectedLanguage?.join(', ') || 'Your Language');
      } catch {
        if (!isMounted) return;
        setLanguageLabel('Your Language');
      }
    };

    void loadLanguage();

    return () => {
      isMounted = false;
    };
  }, []);

  return { languageLabel };
}

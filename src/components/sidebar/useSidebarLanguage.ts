import { useAuth } from '@/features/auth/useAuth';

export function useSidebarLanguage() {
  const { user } = useAuth();
  const languageLabel = user?.selectedLanguage?.join(', ') || 'Your Language';
  return { languageLabel };
}

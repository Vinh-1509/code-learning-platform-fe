import { createFileRoute } from '@tanstack/react-router';
import { LanguageSelectionPage } from '@/features/language_selection/LanguageSelectionPage';
import { requireAuth } from '@/lib/auth';

export const Route = createFileRoute('/languageselection')({
  beforeLoad: requireAuth,
  component: LanguageSelectionPage,
});

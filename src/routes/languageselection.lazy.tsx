import { createLazyFileRoute } from '@tanstack/react-router';
import { LanguageSelectionPage } from '@/features/language_selection/LanguageSelectionPage';

export const Route = createLazyFileRoute('/languageselection')({
  component: LanguageSelectionPage,
});

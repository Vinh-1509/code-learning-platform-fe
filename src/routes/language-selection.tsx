import { createFileRoute } from '@tanstack/react-router';
import { LanguageSelectionPage } from '@/features/language_selection/LanguageSelectionPage';
import { checkLanguageSelection } from '@/lib/auth';
export const Route = createFileRoute('/language-selection')({
  beforeLoad: checkLanguageSelection,
  component: LanguageSelectionPage,
});

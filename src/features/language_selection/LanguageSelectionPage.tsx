import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguageSelection } from './hooks/useLanguageSelection';
import { LanguageCard } from './LanguageCard';
import { SkeletonCard } from './SkeletonCard';

/**
 * LanguageSelectionPage provides the UI container for selecting the user's primary programming language.
 * Fetches available language configurations and maps selection flow via useLanguageSelection hook.
 *
 * @returns {JSX.Element} The rendered LanguageSelectionPage page component.
 */
export function LanguageSelectionPage() {
  const { languages, fetching, selected, setSelected, saving, handleConfirm } =
    useLanguageSelection();

  const cards = fetching ? (
    <>
      <SkeletonCard />
      <SkeletonCard />
    </>
  ) : (
    languages.map((lang) => (
      <LanguageCard
        key={lang.id}
        lang={lang}
        isSelected={selected === lang.id}
        onSelect={() => setSelected(lang.id)}
      />
    ))
  );

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="text-center mb-10 space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Choose your <span className="text-primary">language</span>
        </h1>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          Select the language you want to build your custom journey.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
        {cards}
      </div>

      <div className="flex items-center justify-between w-full max-w-2xl mt-8">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          Selection will be saved to your profile
        </span>
        <Button
          onClick={() => {
            void handleConfirm();
          }}
          disabled={!selected || saving}
          className="bg-primary hover:bg-primary/90 disabled:opacity-40 text-white font-medium px-6 h-10 rounded-xl transition-colors"
        >
          {saving ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}

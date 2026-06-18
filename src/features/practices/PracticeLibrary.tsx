import { useState } from 'react';
import { Loader2, Star } from 'lucide-react';

import { usePractice } from './usePractice';
import { ExerciseCard } from './ExerciseCard';
import { PracticeFilters } from './PracticeFilters';
import { PracticeHero } from './PracticeHero';

export function PracticeLibrary() {
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState('All Levels');

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleDifficultyChange = (value: string) => {
    setDiffFilter(value);
  };

  // Sync criteria triggers up to usePractice domain layer fetches
  const { exercises, loading, error } = usePractice({
    q: search,
    difficulty: diffFilter,
    page: 1,
    limit: 15,
  });

  // Structural view toggles to keep template rendering clean
  const showLoading = loading;
  const showError = !loading && error;
  const showEmpty =
    !loading && !error && (!exercises || exercises.length === 0);
  const showList = !loading && !error && exercises && exercises.length > 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-8">
      <PracticeFilters
        diffFilter={diffFilter}
        onDiffChange={handleDifficultyChange}
        onSearchChange={handleSearchChange}
        search={search}
      />

      <PracticeHero />

      {/* Target Content Feed Frame */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-base font-bold text-foreground">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            Recommended for You
          </h3>
        </div>

        {showLoading && (
          <div className="flex flex-col items-center justify-center gap-2 py-20">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Looking for matching challenges...
            </p>
          </div>
        )}

        {showError && (
          <div className="py-20 text-center font-medium text-red-500">
            {error}
          </div>
        )}

        {showEmpty && (
          <div className="py-20 text-center text-sm text-muted-foreground">
            No challenges matches the selected filter setup.
          </div>
        )}

        {showList && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exercises.map((exercise) => (
              <ExerciseCard key={exercise._id} exercise={exercise} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Loader2, Star } from 'lucide-react';

import { usePractice } from './usePractice';
import { ExerciseCard } from './ExerciseCard';
import { PracticeFilters } from './PracticeFilters';
import { PracticeHero } from './PracticeHero';

export function PracticeLibrary() {
  // State bộ lọc — đổi filter thì reset về trang 1
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState('All Levels');
  const [langFilter, setLangFilter] = useState('All Languages');
  const [page, setPage] = useState(1);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDifficultyChange = (value: string) => {
    setDiffFilter(value);
    setPage(1);
  };

  const handleLanguageChange = (value: string) => {
    setLangFilter(value);
    setPage(1);
  };

  const { exercises, loading, error } = usePractice({
    q: search,
    difficulty: diffFilter,
    language: langFilter,
    page,
    limit: 15,
  });

  const showLoading = loading;
  const showError = !loading && error;
  const showEmpty = !loading && !error && exercises.length === 0;
  const showList = !loading && !error && exercises.length > 0;

  let exerciseContent = null;

  if (showLoading) {
    exerciseContent = (
      <div className="flex flex-col items-center justify-center gap-2 py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Đang tìm kiếm bài tập phù hợp...
        </p>
      </div>
    );
  }

  if (showError) {
    exerciseContent = (
      <div className="py-20 text-center font-medium text-red-500">{error}</div>
    );
  }

  if (showEmpty) {
    exerciseContent = (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Không tìm thấy bài tập nào khớp với bộ lọc.
      </div>
    );
  }

  if (showList) {
    const cards = exercises.map((exercise) => (
      <ExerciseCard key={exercise._id} exercise={exercise} />
    ));

    exerciseContent = (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-8">
      <PracticeFilters
        langFilter={langFilter}
        diffFilter={diffFilter}
        onLangChange={handleLanguageChange}
        onDiffChange={handleDifficultyChange}
        onSearchChange={handleSearchChange}
        search={search}
      />

      <PracticeHero />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-base font-bold text-foreground">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            Recommended for You
          </h3>
        </div>

        {exerciseContent}
      </div>
    </div>
  );
}

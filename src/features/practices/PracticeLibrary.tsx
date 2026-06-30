import { useState } from 'react';
import { Loader2, Star } from 'lucide-react';

import { usePractice } from './hooks/usePractice';
import { ExerciseCard } from './ExerciseCard';
import { PracticeFilters } from './PracticeFilters';
import { PracticeHero } from './PracticeHero';

export function PracticeLibrary() {
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState('All Levels');
  // Thêm state lưu giá trị sort để truyền xuống các bên
  const [sortBy, setSortBy] = useState('default');

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleDifficultyChange = (value: string) => {
    setDiffFilter(value);
  };

  // Thêm hàm handler bắt sự kiện thay đổi select sort
  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  // Connect layout directly to the orchestrated practice query domain stream
  const {
    exercises,
    weakTagIdsSet,
    featuredExercise,
    isWeakRecommendation,
    loading,
    error,
  } = usePractice({
    q: search,
    difficulty: diffFilter,
    sortBy: sortBy, // Truyền sortBy xuống hook xử lý logic
    page: 1,
    limit: 15,
  });

  const showLoading = loading;
  const showError = !loading && error;
  const showEmpty =
    !loading && !error && (!exercises || exercises.length === 0);
  const showList = !loading && !error && exercises && exercises.length > 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4  sm:p-8">
      {/* Truyền cả sortBy lẫn onSortChange vào đây để dập tắt lỗi TypeScript thiếu prop */}
      <PracticeFilters
        diffFilter={diffFilter}
        onDiffChange={handleDifficultyChange}
        onSearchChange={handleSearchChange}
        search={search}
        sortBy={sortBy}
        onSortChange={handleSortChange}
      />
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-base font-bold text-foreground">
          <Star className="size-4 fill-amber-400 text-amber-400" />
          Recommended for You
        </h3>
      </div>
      {/* Renders the top priority item, passing down if it's an actual weakness recommendation */}
      {!loading && !error && (
        <PracticeHero
          exercise={featuredExercise}
          isWeak={isWeakRecommendation}
        />
      )}

      {/* Target Content Feed Frame */}
      <div>
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
            {exercises.map((exercise) => {
              // Checks if any tagId linked to this exercise overlaps with tracked weaknesses
              const hasWeakTagIntersect = exercise.tagId?.some((id) =>
                weakTagIdsSet.has(id)
              );

              return (
                <ExerciseCard
                  key={exercise._id}
                  exercise={exercise}
                  isWeakRecommend={hasWeakTagIntersect}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

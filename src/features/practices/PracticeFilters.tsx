import { Search } from 'lucide-react';

interface PracticeFiltersProps {
  diffFilter: string;
  onDiffChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  search: string;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export function PracticeFilters({
  diffFilter,
  onDiffChange,
  onSearchChange,
  search,
  sortBy,
  onSortChange,
}: PracticeFiltersProps) {
  return (
    <div
      data-tour="practice-filters"
      className="flex flex-col md:flex-row md:items-start justify-between gap-5 w-full"
    >
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          Practice Library
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Master concepts through interactive coding challenges.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
        {/* Difficulty Filter */}
        <div className="flex items-center gap-2 bg-card md:bg-transparent p-1.5 md:p-0 rounded-xl border border-border/60 md:border-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap pl-2 md:pl-0 min-w-[70px] md:min-w-0">
            Difficulty
          </span>
          <select
            className="w-full md:w-auto rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none min-h-[44px] focus:border-primary cursor-pointer"
            value={diffFilter}
            onChange={(e) => onDiffChange(e.target.value)}
          >
            <option>All Levels</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>

        {/* Sort By Filter */}
        <div className="flex items-center gap-2 bg-card md:bg-transparent p-1.5 md:p-0 rounded-xl border border-border/60 md:border-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap pl-2 md:pl-0 min-w-[70px] md:min-w-0">
            Sort By
          </span>
          <select
            className="w-full md:w-auto rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none min-h-[44px] focus:border-primary cursor-pointer"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="default">Default</option>
            <option value="level-asc">Difficulty: Easy to Hard</option>
            <option value="level-desc">Difficulty: Hard to Easy</option>
          </select>
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full md:w-56 rounded-lg border border-border bg-background py-2.5 pl-9 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 min-h-[44px]"
          />
        </div>
      </div>
    </div>
  );
}

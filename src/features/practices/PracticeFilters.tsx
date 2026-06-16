import { Search } from 'lucide-react';

// UI bộ lọc — chỉ hiển thị + gọi callback, không gọi API trực tiếp
interface PracticeFiltersProps {
  langFilter: string;
  diffFilter: string;
  onLangChange: (value: string) => void;
  onDiffChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  search: string;
}

export function PracticeFilters({
  langFilter,
  diffFilter,
  onLangChange,
  onDiffChange,
  onSearchChange,
  search,
}: PracticeFiltersProps) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Practice Library</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Master concepts through interactive coding challenges.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Language
          </span>
          <select
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
            value={langFilter}
            onChange={(e) => onLangChange(e.target.value)}
          >
            <option>All Languages</option>
            <option>C++</option>
            <option>Java</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Difficulty
          </span>
          <select
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
            value={diffFilter}
            onChange={(e) => onDiffChange(e.target.value)}
          >
            <option>All Levels</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-56 rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>
    </div>
  );
}

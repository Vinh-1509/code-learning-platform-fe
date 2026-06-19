import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PracticeExercise } from '@/components/practice_utils/types/practiceTypes';

interface ExerciseTabBarProps {
  loading: boolean;
  error: string | null;
  exercises: PracticeExercise[];
  exercisePassMap: Record<string, boolean>;
  activeExerciseIndex: number;
  setActiveExerciseIndex: (index: number) => void;
}

export function ExerciseTabBar({
  loading,
  error,
  exercises,
  exercisePassMap,
  activeExerciseIndex,
  setActiveExerciseIndex,
}: ExerciseTabBarProps) {
  return (
    <div className="flex gap-2 p-4 border-b border-slate-200 bg-trueaccent overflow-x-auto select-none no-scrollbar">
      {loading ? (
        <span className="text-sm text-muted-foreground shrink-0">
          Loading exercises...
        </span>
      ) : error ? (
        <span className="text-sm text-destructive shrink-0">
          Failed to load exercises
        </span>
      ) : exercises.length === 0 ? (
        <span className="text-sm text-muted-foreground shrink-0">
          No practice available
        </span>
      ) : (
        <>
          {exercises.map((ex, idx) => {
            const isPassed = exercisePassMap[ex.id] === true;
            const isActive = activeExerciseIndex === idx;
            return (
              <Button
                key={ex.id}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveExerciseIndex(idx)}
                className={cn(
                  'text-xs font-bold rounded-lg transition-colors h-8 px-3 flex items-center gap-1.5 shadow-sm shrink-0',
                  isActive
                    ? isPassed
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-none'
                      : 'bg-blue-600 hover:bg-blue-700 text-white border-none'
                    : isPassed
                      ? 'bg-green-mint text-green-foreground border border-success/30 hover:bg-green-mint/80'
                      : 'bg-card text-muted-foreground border border-border hover:border-border/80'
                )}
              >
                {isPassed && <span className="shrink-0">✓</span>}
                Question {idx + 1}
              </Button>
            );
          })}
        </>
      )}
    </div>
  );
}

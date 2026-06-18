import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PracticeExercise } from '@/features/practice_utils/types/practiceTypes';

interface ExerciseTabBarProps {
  loading: boolean;
  error: string | null;
  exercises: PracticeExercise[];
  exercisePassMap: Record<string, boolean>;
  activeExerciseIndex: number;
  setActiveExerciseIndex: (index: number) => void;
  blockCompleted: boolean;
}

export function ExerciseTabBar({
  loading,
  error,
  exercises,
  exercisePassMap,
  activeExerciseIndex,
  setActiveExerciseIndex,
  blockCompleted,
}: ExerciseTabBarProps) {
  return (
    <div className="flex gap-2 p-4 border-b border-border bg-muted/40">
      {loading ? (
        <span className="text-sm text-muted-foreground">
          Loading exercises...
        </span>
      ) : error ? (
        <span className="text-sm text-destructive">
          Failed to load exercises
        </span>
      ) : exercises.length === 0 ? (
        <span className="text-sm text-muted-foreground">
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
                  'text-xs font-bold rounded-lg transition-colors h-8 px-3 flex items-center gap-1.5 shadow-sm',
                  isActive
                    ? isPassed
                      ? 'bg-success hover:bg-success/90 text-white border-none'
                      : 'bg-primary hover:bg-primary/90 text-white border-none'
                    : isPassed
                      ? 'bg-green-mint text-green-foreground border border-success/30 hover:bg-green-mint/80'
                      : 'bg-card text-muted-foreground border border-border hover:border-border/80'
                )}
              >
                {isPassed && <span>✓</span>}
                Question {idx + 1}
              </Button>
            );
          })}

          {/* Block completion badge */}
          {blockCompleted && (
            <span className="ml-auto flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-green-foreground bg-green-mint border border-success/30 rounded-lg">
              🎉 Block complete!
            </span>
          )}
        </>
      )}
    </div>
  );
}

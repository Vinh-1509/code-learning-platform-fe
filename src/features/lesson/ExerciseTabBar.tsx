import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PracticeExercise } from '@/features/practice/types/practice.types';

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
    <div className="flex gap-2 p-4 border-b border-slate-200 bg-slate-50">
      {loading ? (
        <span className="text-sm text-slate-500">Loading exercises...</span>
      ) : error ? (
        <span className="text-sm text-red-500">Failed to load exercises</span>
      ) : exercises.length === 0 ? (
        <span className="text-sm text-slate-500">No practice available</span>
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
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-none'
                      : 'bg-blue-600 hover:bg-blue-700 text-white border-none'
                    : isPassed
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100/50'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                )}
              >
                {isPassed && <span>✓</span>}
                Question {idx + 1}
              </Button>
            );
          })}

          {/* Block completion badge */}
          {blockCompleted && (
            <span className="ml-auto flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 rounded-lg">
              🎉 Block complete!
            </span>
          )}
        </>
      )}
    </div>
  );
}

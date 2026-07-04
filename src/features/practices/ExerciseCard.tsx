import { Link } from '@tanstack/react-router';
import { CheckCircle2, Lock, AlertTriangle } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { Exercise } from '@/types/api/exercise.types';

const difficultyStyles: Record<string, string> = {
  easy: 'text-green-700 bg-green-50 border border-green-200/60',
  medium: 'text-amber-700 bg-amber-50 border border-amber-200/60',
  hard: 'text-red-700 bg-red-50 border border-red-200/60',
};

interface ExerciseCardProps {
  exercise: Exercise;
  isWeakRecommend?: boolean; // Flag identifying weak concept overlap
}

export function ExerciseCard({
  exercise,
  isWeakRecommend = false,
}: ExerciseCardProps) {
  const { title, instruction, level, status } = exercise;

  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isAvailable = !isCompleted && !isLocked;

  const levelStyle = difficultyStyles[level] ?? 'bg-slate-50 text-slate-600';

  let statusLabel = null;
  if (isCompleted) {
    statusLabel = (
      <span className="text-xs font-medium text-green-foreground">
        Completed
      </span>
    );
  }
  if (isAvailable) {
    statusLabel = (
      <span className="text-xs text-muted-foreground">Not Started</span>
    );
  }
  if (isLocked) {
    statusLabel = <span className="text-xs text-muted-foreground">Locked</span>;
  }

  // Core content structure shared cleanly across interactive and static states
  const cardContent = (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={cn(
                'rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                levelStyle
              )}
            >
              {level}
            </span>

            {isWeakRecommend && !isLocked && (
              <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 border border-amber-200">
                <AlertTriangle className="size-3 text-amber-600" />
                Review Needed
              </span>
            )}
          </div>

          {isCompleted && (
            <CheckCircle2 className="size-5 text-green-foreground flex-shrink-0" />
          )}
          {isLocked && (
            <Lock className="size-4 text-muted-foreground/40 flex-shrink-0" />
          )}
        </div>

        <h4 className="line-clamp-1 text-sm font-semibold text-foreground">
          {title}
        </h4>
        <p className="min-h-[32px] text-xs text-muted-foreground line-clamp-2">
          {instruction}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/40 pt-3">
        <div>{statusLabel}</div>
      </div>
    </>
  );

  // If the exercise is active and unlocked, render the entire card component wrapped inside a routing Link context area
  if (!isLocked) {
    return (
      <Link
        to="/practice-dedicated/$exerciseId"
        params={{ exerciseId: exercise._id }}
        data-testid="exercise-card"
        className={cn(
          'flex min-h-45 flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all text-left block relative overflow-hidden cursor-pointer',
          'hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]',
          isWeakRecommend &&
            'border-amber-500/60 bg-amber-50/10 hover:border-amber-500'
        )}
      >
        {cardContent}
      </Link>
    );
  }

  // Safe non-interactive rendering block fallback for locked challenge layouts
  return (
    <div
      data-testid="exercise-card"
      data-tour="locked-exercise"
      className="flex min-h-45 flex-col justify-between rounded-xl border border-border bg-card p-5 opacity-50 bg-muted select-none text-left relative overflow-hidden"
    >
      {cardContent}
    </div>
  );
}

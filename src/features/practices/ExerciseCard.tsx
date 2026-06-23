import { Link } from '@tanstack/react-router';
import { CheckCircle2, Lock, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Exercise } from '@/lib/axios';

const difficultyStyles: Record<string, string> = {
  easy: 'text-green-foreground bg-green-mint border border-green-mint/30',
  medium: 'text-yellow-patel bg-yellow-medium border border-yellow-medium/30',
  hard: 'text-red-foreground bg-red-mint border border-red-mint/30',
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

  let actionButton = (
    <Link
      to="/practicededicated/$exerciseId"
      params={{ exerciseId: exercise._id }}
    >
      <Button size="sm">Start</Button>
    </Link>
  );

  if (isLocked) {
    actionButton = (
      <Button
        variant="secondary"
        size="sm"
        disabled
        className="cursor-not-allowed"
      >
        Locked
      </Button>
    );
  }

  return (
    <div
      data-testid="exercise-card"
      className={cn(
        'flex min-h-45 flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all relative overflow-hidden',
        isLocked
          ? 'opacity-50 bg-muted select-none'
          : 'hover:border-primary/40 hover:shadow-sm',
        isWeakRecommend &&
          !isLocked &&
          'border-amber-500/60 bg-amber-50/10 hover:border-amber-500'
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
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
            <CheckCircle2 className="size-5 text-green-foreground" />
          )}
          {isLocked && <Lock className="size-4 text-muted-foreground/40" />}
        </div>

        <h4 className="line-clamp-1 text-sm font-semibold text-foreground">
          {title}
        </h4>
        <p className="min-h-[32px] text-xs text-muted-foreground line-clamp-2">
          {instruction}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-2">
        {statusLabel}
        {actionButton}
      </div>
    </div>
  );
}

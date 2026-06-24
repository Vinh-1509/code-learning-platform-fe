import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import type { Exercise } from '@/types/api/exercise.types';

interface PracticeHeroProps {
  exercise: Exercise | null;
  isWeak: boolean; // Real status modifier flag to drive clear template differentiation
}

export function PracticeHero({ exercise, isWeak }: PracticeHeroProps) {
  const barWidths = [160, 120, 140, 100, 130, 90];

  if (!exercise) return null;

  return (
    <div className="grid min-h-40 grid-cols-1 md:grid-cols-[240px_1fr] overflow-hidden rounded-xl border-2 border-primary bg-card">
      {/* Decorative Simulated IDE Graphic section */}
      <div className="hidden md:flex items-center justify-center bg-slate-900">
        <div className="space-y-2 p-6 opacity-40">
          {barWidths.map((width, index) => (
            <div
              key={index}
              className="h-2 rounded bg-blue-400"
              style={{ width }}
            />
          ))}
        </div>
      </div>

      {/* Hero content area containing dynamic rendering states */}
      <div className="flex flex-col justify-center gap-3 p-8">
        {isWeak ? (
          <span className="inline-flex w-fit rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white ">
            Review Needed
          </span>
        ) : (
          <span className="inline-flex w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            DAILY CHALLENGE
          </span>
        )}

        <h2 className="text-2xl font-bold text-foreground">{exercise.title}</h2>
        <div className="flex gap-2">
          <span className="rounded border border-border bg-slate-100 px-2 py-1 text-xs font-medium capitalize text-slate-700">
            {exercise.level}
          </span>
        </div>

        <Link
          to="/practice-dedicated/$exerciseId"
          params={{ exerciseId: exercise._id }}
          className="w-fit"
        >
          <Button className="w-fit">Start Practice</Button>
        </Link>
      </div>
    </div>
  );
}

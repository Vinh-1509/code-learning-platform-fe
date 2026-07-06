import { Users, Coins } from 'lucide-react';

interface LeaderboardHeroProps {
  totalStudents: number;
  totalCoins: number;
}

export function LeaderboardHero({
  totalStudents,
  totalCoins,
}: LeaderboardHeroProps) {
  return (
    <section
      data-tour="leaderboard-hero"
      className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Global leaderboard
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            Compare ranks and CS-point across the globe.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground">
            <Users className="size-3.5 text-primary" />
            {totalStudents} students
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground">
            <Coins className="size-3.5 text-success" />
            {totalCoins.toLocaleString()} total CS-points
          </span>
        </div>
      </div>
    </section>
  );
}

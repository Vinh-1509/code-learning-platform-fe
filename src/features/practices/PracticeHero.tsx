import { Button } from '@/components/ui/button';

const FEATURED = {
  title: 'Declare Student Variables',
  language: 'C++',
};

export function PracticeHero() {
  const barWidths = [160, 120, 140, 100, 130, 90];

  return (
    <div className="grid min-h-40 grid-cols-1 md:grid-cols-[240px_1fr] overflow-hidden rounded-xl border-2 border-primary bg-background">
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

      {/* Hero content banner context definitions */}
      <div className="flex flex-col justify-center gap-3 p-8">
        <span className="inline-flex w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          CONTINUE LEARNING
        </span>
        <h2 className="text-2xl font-bold text-foreground">{FEATURED.title}</h2>
        <div className="flex gap-2">
          <span className="rounded border border-border bg-muted px-2 py-1 text-xs font-medium uppercase text-muted-foreground">
            #{FEATURED.language}
          </span>
        </div>
        <Button className="w-fit">Start Practice</Button>
      </div>
    </div>
  );
}
